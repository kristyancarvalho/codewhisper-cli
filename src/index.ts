import { readFileContent } from './utils/fileUtils';
import { ConversationDB } from './utils/dbUtils';
import { sendToOpenRouter } from './utils/apiUtils';
import { parseCommandLineArgs, validateArgs, printUsage, DEFAULT_MODEL } from './utils/cliUtils';
import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';

const runInteractiveMode = async (model: string) => {
  const sessionId = uuidv4();
  const db = new ConversationDB(sessionId);
  await db.initialize();
  
  console.log("Iniciando modo de chat. Digite 'sair' para finalizar.");
  console.log("Contexto de código será carregado apenas no início da conversa.");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askForFiles = () => {
    return new Promise<string[]>((resolve) => {
      rl.question('Digite os caminhos dos arquivos de código (separados por vírgula), ou pressione Enter para pular: ', async (answer) => {
        if (answer.trim() === '') {
          resolve([]);
        } else {
          const filePaths = answer.split(',').map(path => path.trim());
          resolve(filePaths);
        }
      });
    });
  };

  const askQuestion = () => {
    return new Promise<string>((resolve) => {
      rl.question('\nSua pergunta (ou "sair" para encerrar): ', (answer) => {
        resolve(answer);
      });
    });
  };

  const filePaths = await askForFiles();
  let codeContext = '';
  
  if (filePaths.length > 0) {
    try {
      codeContext = await readFileContent(filePaths);
      await db.addMessage('system', `Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      console.log(`Código carregado de ${filePaths.length} arquivo(s).`);
    } catch (error: any) {
      console.error(`Erro ao carregar arquivos: ${error.message}`);
      await db.close();
      rl.close();
      return;
    }
  }
  
  await db.addMessage('system', 'You are a programming assistant that helps with coding questions and maintains conversation context.');
  
  let isRunning = true;
  while (isRunning) {
    const question = await askQuestion();
    
    if (question.toLowerCase() === 'sair') {
      isRunning = false;
      continue;
    }
    
    await db.addMessage('user', question);
    
    try {
      const history = await db.getConversationHistory();
      const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
      
      const apiResponse = await sendToOpenRouter(messages, model);
      
      if (apiResponse.choices && apiResponse.choices.length > 0) {
        const response = apiResponse.choices[0].message.content;
        console.log('\nAssistente:');
        console.log(response);
        await db.addMessage('assistant', response);
      } else if (apiResponse.error) {
        console.error('\nErro da API:');
        console.error(apiResponse.error.message);
      } else {
        console.log('Não foi possível obter uma resposta da IA.');
      }
    } catch (error: any) {
      console.error(`Erro: ${error.message}`);
    }
  }
  
  await db.close();
  rl.close();
  console.log('Chat encerrado.');
};

const runSinglePromptMode = async (filePaths: string[], prompt: string, model: string) => {
  try {
    const codeContext = await readFileContent(filePaths);
    
    const messages = [
      { role: 'system' as const, content: 'You are a programming assistant that uses the provided code as context to answer questions.' },
      { role: 'user' as const, content: `Context:\n\`\`\`\n${codeContext}\n\`\`\`\n\nQuestion: ${prompt}` }
    ];
    
    const apiResponse = await sendToOpenRouter(messages, model);
    
    if (apiResponse.choices) {
      console.log('\nResposta da IA:');
      console.log(apiResponse.choices[0].message.content);
    } else if (apiResponse.error) {
      console.error('\nErro da API:');
      console.error(apiResponse.error.message);
    } else {
      console.log('Não foi possível obter uma resposta da IA.');
    }
  } catch (error: any) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    const parsedArgs = parseCommandLineArgs(args);
    
    if (parsedArgs.interactive) {
      await runInteractiveMode(parsedArgs.model || DEFAULT_MODEL);
    } else {
      validateArgs(parsedArgs);
      await runSinglePromptMode(parsedArgs.filePaths!, parsedArgs.prompt!, parsedArgs.model);
    }
  } catch (error: any) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }
};

main();
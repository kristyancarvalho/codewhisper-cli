import { readFileContent, findRelevantFiles } from './utils/fileUtils';
import { ConversationDB } from './utils/dbUtils';
import { sendToOpenRouter } from './utils/apiUtils';
import { parseCommandLineArgs, validateArgs, printUsage } from './utils/cliUtils';
import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';

const runInteractiveMode = async (model: string, initialFilePaths?: string[], initialPrompt?: string, autoDiscover?: boolean, maxFiles?: number, basePath?: string) => {
  const sessionId = uuidv4();
  const db = new ConversationDB(sessionId);
  await db.initialize();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await db.addMessage('system', 'You are a programming assistant that helps with coding questions and maintains conversation context.');

  const discoverAndLoadFiles = async (prompt: string, specifiedPaths?: string[]): Promise<string[]> => {
    let filesToUse: string[] = [];
    
    if (specifiedPaths && specifiedPaths.length > 0) {
      filesToUse = specifiedPaths;
      console.log(`Usando arquivos especificados: ${filesToUse.join(', ')}`);
    } 
    else if (autoDiscover) {
      try {
        console.log(`Descobrindo arquivos relevantes para o prompt...`);
        filesToUse = await findRelevantFiles(prompt, basePath || '.', maxFiles || 5);
        console.log(`Arquivos descobertos: ${filesToUse.join(', ')}`);
      } catch (error: any) {
        console.warn(`Aviso: Falha na descoberta automática: ${error.message}`);
      }
    }
    
    return filesToUse;
  };

  let filesToUse: string[] = [];
  if (initialPrompt && autoDiscover && (!initialFilePaths || initialFilePaths.length === 0)) {
    filesToUse = await discoverAndLoadFiles(initialPrompt);
  } else if (initialFilePaths && initialFilePaths.length > 0) {
    filesToUse = initialFilePaths;
  } else {
    const userResponse = await new Promise<string>((resolve) => {
      rl.question('Digite os caminhos dos arquivos de código (separados por vírgula), ou "auto" para descoberta automática, ou pressione Enter para pular: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (userResponse.toLowerCase() === 'auto') {
      autoDiscover = true;
    } else if (userResponse !== '') {
      filesToUse = userResponse.split(',').map(path => path.trim());
    }
  }
  
  if (filesToUse.length > 0) {
    try {
      const codeContext = await readFileContent(filesToUse);
      await db.addMessage('system', `Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
    } catch (error: any) {
      console.error(`Erro ao carregar arquivos: ${error.message}`);
      await db.close();
      rl.close();
      return;
    }
  }

  if (initialPrompt) {
    if (autoDiscover && filesToUse.length === 0) {
      filesToUse = await discoverAndLoadFiles(initialPrompt);
      
      if (filesToUse.length > 0) {
        try {
          const codeContext = await readFileContent(filesToUse);
          await db.addMessage('system', `Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
        } catch (error: any) {
          console.error(`Erro ao carregar arquivos: ${error.message}`);
        }
      }
    }
    
    await db.addMessage('user', initialPrompt);
    
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
        console.error('\nErro da API:', apiResponse.error.message);
      } else {
        console.log('Não foi possível obter uma resposta da IA.');
      }
    } catch (error: any) {
      console.error(`Erro: ${error.message}`);
    }
  }
  
  let isRunning = true;
  while (isRunning) {
    const question = await new Promise<string>((resolve) => {
      rl.question('\nSua pergunta (ou "sair" para encerrar, "arquivo:caminho" para adicionar arquivo, "auto:prompt" para descoberta): ', (answer) => {
        resolve(answer);
      });
    });
    
    if (question.toLowerCase() === 'sair') {
      isRunning = false;
      continue;
    }
    
    if (question.startsWith('arquivo:')) {
      const filePath = question.substring(8).trim();
      try {
        const fileContent = await readFileContent([filePath]);
        await db.addMessage('system', `Adicionando novo arquivo ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``);
        console.log(`Arquivo ${filePath} adicionado ao contexto.`);
      } catch (error: any) {
        console.error(`Erro ao ler o arquivo: ${error.message}`);
      }
      continue;
    }
    
    if (question.startsWith('auto:')) {
      const autoPrompt = question.substring(5).trim();
      if (autoPrompt) {
        try {
          console.log('Descobrindo arquivos relevantes...');
          const discoveredFiles = await findRelevantFiles(autoPrompt, basePath || '.', maxFiles || 5);
          
          if (discoveredFiles.length > 0) {
            console.log(`Arquivos descobertos: ${discoveredFiles.join(', ')}`);
            const fileContent = await readFileContent(discoveredFiles);
            await db.addMessage('system', `Adicionando arquivos descobertos ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``);
          } else {
            console.log('Nenhum arquivo relevante encontrado.');
          }
        } catch (error: any) {
          console.error(`Erro na descoberta automática: ${error.message}`);
        }
      } else {
        console.log('Por favor, forneça um prompt para descoberta automática após "auto:"');
      }
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
        console.error('\nErro da API:', apiResponse.error.message);
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

const runSinglePromptMode = async (filePaths: string[] | undefined, prompt: string, model: string, autoDiscover: boolean, maxFiles?: number, basePath?: string) => {
  let filesToUse: string[] = [];

  if ((!filePaths || filePaths.length === 0) && autoDiscover) {
    try {
      console.log('Descobrindo arquivos relevantes para o prompt...');
      filesToUse = await findRelevantFiles(prompt, basePath || '.', maxFiles || 5);
      console.log(`Arquivos descobertos: ${filesToUse.join(', ')}`);
    } catch (error: any) {
      console.error(`Erro na descoberta automática: ${error.message}`);
      process.exit(1);
    }
  } else if (filePaths && filePaths.length > 0) {
    filesToUse = filePaths;
  }
  
  if (filesToUse.length === 0) {
    console.error('Nenhum arquivo encontrado ou especificado para análise.');
    process.exit(1);
  }
  
  try {
    const codeContext = await readFileContent(filesToUse);
    
    const messages = [
      { role: 'system' as const, content: 'You are a programming assistant that uses the provided code as context to answer questions.' },
      { role: 'user' as const, content: `Context:\n\`\`\`\n${codeContext}\n\`\`\`\n\nQuestion: ${prompt}` }
    ];
    
    const apiResponse = await sendToOpenRouter(messages, model);
    
    if (apiResponse.choices) {
      console.log('\nResposta da IA:');
      console.log(apiResponse.choices[0].message.content);
    } else if (apiResponse.error) {
      console.error('\nErro da API:', apiResponse.error.message);
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
    
    validateArgs(parsedArgs);
    
    if (parsedArgs.interactive) {
      await runInteractiveMode(
        parsedArgs.model, 
        parsedArgs.filePaths, 
        parsedArgs.prompt, 
        parsedArgs.autoDiscover,
        parsedArgs.maxFiles,
        parsedArgs.basePath
      );
    } else {
      await runSinglePromptMode(
        parsedArgs.filePaths, 
        parsedArgs.prompt!, 
        parsedArgs.model,
        parsedArgs.autoDiscover || false,
        parsedArgs.maxFiles,
        parsedArgs.basePath
      );
    }
  } catch (error: any) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }
};

main();
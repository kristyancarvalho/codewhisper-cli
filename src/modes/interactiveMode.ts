import readline from 'readline';
import chalk from 'chalk';
import { SessionManager } from '../core/sessionManager';
import { handleSpecialCommand } from '../core/commandHandler';
import { loadFiles, discoverAndLoadFiles } from '../services/fileService';
import { sendMessageToAI } from '../services/apiService';
import { 
  printAppTitle, 
  printSeparator, 
  logInfo, 
  formatUserMessage, 
  formatAssistantMessage
} from '../styles/prettierLogs';

const debug = (message: string) => {
  console.log(chalk.gray(`[DEBUG] ${message}`));
};

export const runInteractiveMode = async (
  model: string, 
  initialFilePaths?: string[], 
  initialPrompt?: string, 
  autoDiscover?: boolean, 
  maxFiles?: number, 
  basePath?: string
) => {
  debug('Iniciando modo interativo');
  printAppTitle();
  
  debug('Criando gerenciador de sessão');
  const sessionManager = new SessionManager();
  await sessionManager.initialize();
  
  debug('Configurando interface de linha de comando');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  let filesToUse: string[] = [];
  
  if (initialFilePaths && initialFilePaths.length > 0) {
    debug(`Processando ${initialFilePaths.length} arquivos iniciais`);
    filesToUse = initialFilePaths;
    const codeContext = await loadFiles(filesToUse);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
    }
  } 
  else if (!initialPrompt || !autoDiscover) {
    debug('Pedindo caminhos de arquivos ao usuário');
    const userResponse = await new Promise<string>((resolve) => {
      rl.question(
        '\n' + chalk.cyan.bold('Digite os caminhos dos arquivos de código (separados por vírgula), ou "auto" para descoberta automática, ou pressione Enter para pular: '), 
        (answer) => {
          resolve(answer.trim());
        }
      );
    });
    
    if (userResponse.toLowerCase() === 'auto') {
      debug('Usuário selecionou auto-descoberta');
      autoDiscover = true;
    } else if (userResponse !== '') {
      debug(`Processando arquivos fornecidos pelo usuário: ${userResponse}`);
      filesToUse = userResponse.split(',').map(path => path.trim());
      const codeContext = await loadFiles(filesToUse);
      if (codeContext) {
        await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      }
    }
  }
  
  if (initialPrompt) {
    debug(`Processando prompt inicial: "${initialPrompt}"`);
    if (autoDiscover && filesToUse.length === 0) {
      debug('Realizando auto-descoberta para o prompt inicial');
      const codeContext = await discoverAndLoadFiles(initialPrompt, basePath, maxFiles);
      if (codeContext) {
        await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      }
    }
    
    debug('Adicionando prompt inicial e obtendo resposta');
    await sessionManager.addUserMessage(initialPrompt);
    console.log(formatUserMessage(initialPrompt));
    
    const history = await sessionManager.getConversationHistory();
    const response = await sendMessageToAI(history, model);
    
    if (response) {
      console.log(formatAssistantMessage(response));
      await sessionManager.addAssistantMessage(response);
    }
  }
  
  printSeparator();
  logInfo('Comandos disponíveis:\n- "sair" para encerrar\n- "arquivo:caminho" para adicionar arquivo\n- "auto:prompt" para descoberta automática\n- "ajuda" ou "help" para exibir ajuda');
  printSeparator();
  
  debug('Iniciando loop principal de interação');
  let isRunning = true;
  while (isRunning) {
    debug('Aguardando entrada do usuário');
    const question = await new Promise<string>((resolve) => {
      rl.question('\n' + chalk.green.bold('> '), (answer) => {
        resolve(answer);
      });
    });
    
    debug(`Entrada do usuário: "${question}"`);
    
    debug('Verificando comandos especiais');
    const commandResult = await handleSpecialCommand(
      question, 
      sessionManager, 
      basePath || '.',
      maxFiles || 5
    );
    
    debug(`Resultado do comando: shouldContinue=${commandResult.shouldContinue}, skipMessageProcessing=${commandResult.skipMessageProcessing}`);
    
    if (!commandResult.shouldContinue) {
      debug('Comando para finalizar aplicação detectado');
      isRunning = false;
      continue;
    }
    
    if (commandResult.skipMessageProcessing) {
      debug('Pulando processamento da mensagem');
      continue;
    }
    
    debug('Processando mensagem normalmente');
    await sessionManager.addUserMessage(question);
    console.log(formatUserMessage(question));
    
    debug('Obtendo histórico de conversa');
    const history = await sessionManager.getConversationHistory();
    debug(`Histórico obtido com ${history.length} mensagens`);
    
    debug('Enviando mensagem para IA');
    const response = await sendMessageToAI(history, model);
    
    if (response) {
      debug('Resposta recebida da IA');
      console.log(formatAssistantMessage(response));
      await sessionManager.addAssistantMessage(response);
    } else {
      debug('Nenhuma resposta recebida da IA');
    }
  }
  
  debug('Encerrando sessão');
  await sessionManager.close();
  rl.close();
  debug('Modo interativo finalizado');
};
import readline from 'readline';
import { SessionManager } from '../core/sessionManager';
import { handleSpecialCommand } from '../core/commandHandler';
import { loadFiles, discoverAndLoadFiles } from '../services/fileService';
import { sendMessageToAI } from '../services/apiService';
import { 
  printCommandList, 
  printUserMessage, 
  printAssistantMessage, 
  printSeparator, 
  printThinking, 
  printFileAdded, 
  printCodeContext,
  printWaitingInput,
  printModelInfo,
  printAppTitle,
  printExitMessage,
  printInfo
} from '../styles/prettierLogs';

export const runInteractiveMode = async (
  model: string,
  initialFilePaths?: string[],
  initialPrompt?: string,
  autoDiscover?: boolean,
  maxFiles?: number,
  basePath?: string
) => {
  printAppTitle();
  printModelInfo(model);

  const sessionManager = new SessionManager();
  await sessionManager.initialize();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (initialFilePaths && initialFilePaths.length > 0) {
    const codeContext = await loadFiles(initialFilePaths);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      initialFilePaths.forEach(file => printFileAdded(file));
      printCodeContext(initialFilePaths.length);
    }
  }
  else if (!initialPrompt || !autoDiscover) {
    const userResponse = await new Promise<string>((resolve) => {
      rl.question(
        '\nDigite os caminhos dos arquivos de código (separados por vírgula), ou "auto" para descoberta automática, ou pressione Enter para pular: ',
        (answer) => {
          resolve(answer.trim());
        }
      );
    });

    if (userResponse.toLowerCase() === 'auto') {
      autoDiscover = true;
    } else if (userResponse !== '') {
      const filesToLoad = userResponse.split(',').map(path => path.trim());
      const codeContext = await loadFiles(filesToLoad);
      if (codeContext) {
        await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
        filesToLoad.forEach(file => printFileAdded(file));
        printCodeContext(filesToLoad.length);
      }
    }
  }

  if (initialPrompt) {
    if (autoDiscover) {
      printInfo("Realizando descoberta automática de arquivos relevantes...");
      const codeContext = await discoverAndLoadFiles(initialPrompt, basePath, maxFiles);
      if (codeContext) {
        await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
        printInfo(`Descoberta automática concluída. ${codeContext.split('\n').length} linhas de código adicionadas ao contexto.`);
      }
    }

    await sessionManager.addUserMessage(initialPrompt);
    printUserMessage(initialPrompt);

    const historyForInitialPrompt = await sessionManager.getConversationHistory();
    
    printThinking();
    const initialResponse = await sendMessageToAI(historyForInitialPrompt, model);

    if (initialResponse) {
      printAssistantMessage(initialResponse);
      await sessionManager.addAssistantMessage(initialResponse);
    } else {
      printAssistantMessage("Desculpe, não consegui processar sua solicitação no momento.");
    }
  }

  printSeparator();
  
  const commands = [
    { name: "sair", description: "Encerrar a aplicação" },
    { name: "arquivo:caminho", description: "Adicionar arquivo ao contexto" },
    { name: "auto:prompt", description: "Descoberta automática de arquivos" },
    { name: "ajuda", description: "Exibir esta lista de comandos" },
    { name: "help", description: "Exibir esta lista de comandos" }
  ];
  
  printCommandList(commands);
  printSeparator();

  let isRunning = true;
  while (isRunning) {
    printWaitingInput();
    
    const question = await new Promise<string>((resolve) => {
      rl.question('\n➤ ', (answer) => {
        resolve(answer);
      });
    });

    if (question.trim() === '') {
      continue;
    }
    
    const commandResult = await handleSpecialCommand(
      question,
      sessionManager,
      basePath || '.',
      maxFiles || 5
    );

    if (!commandResult.shouldContinue) {
      isRunning = false;
      printExitMessage();
      continue;
    }

    if (commandResult.skipMessageProcessing) {
      continue;
    }

    await sessionManager.addUserMessage(question);
    printUserMessage(question);

    const history = await sessionManager.getConversationHistory();

    printThinking();
    const response = await sendMessageToAI(history, model);

    if (response) {
      printAssistantMessage(response);
      await sessionManager.addAssistantMessage(response);
    } else {
      printAssistantMessage("Desculpe, não consegui processar sua solicitação no momento.");
    }
  }

  await sessionManager.close();
  rl.close();
};
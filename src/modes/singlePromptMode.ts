import { SessionManager } from '../core/sessionManager';
import { loadFiles, discoverAndLoadFiles } from '../services/fileService';
import { sendMessageToAI } from '../services/apiService';
import { 
  printUserMessage, 
  printAssistantMessage, 
  printFileAdded, 
  printCodeContext,
  printThinking,
  printModelInfo,
  printInfo,
  printAppTitle,
} from '../styles/prettierLogs';

export const runSinglePromptMode = async (
  filePaths: string[] | undefined,
  prompt: string,
  model: string,
  autoDiscover: boolean = false,
  maxFiles?: number,
  basePath?: string
) => {
  printAppTitle();
  printModelInfo(model);
    
  const sessionManager = new SessionManager();
  await sessionManager.initialize();
  
  if (filePaths && filePaths.length > 0) {
    const codeContext = await loadFiles(filePaths);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      filePaths.forEach(file => printFileAdded(file));
      printCodeContext(filePaths.length);
    }
  } else if (autoDiscover) {
    printInfo("Realizando descoberta automática de arquivos relevantes...");
    const codeContext = await discoverAndLoadFiles(prompt, basePath, maxFiles);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
      printInfo(`Descoberta automática concluída. ${codeContext.split('\n').length} linhas de código adicionadas ao contexto.`);
    }
  }
  
  await sessionManager.addUserMessage(prompt);
  printUserMessage(prompt);
  
  const history = await sessionManager.getConversationHistory();
  
  printThinking();
  const response = await sendMessageToAI(history, model);
  
  if (response) {
    printAssistantMessage(response);
  } else {
    printAssistantMessage("Desculpe, não consegui processar sua solicitação no momento.");
  }
  
  await sessionManager.close();
};
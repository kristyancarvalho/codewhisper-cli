import { SessionManager } from '../core/sessionManager';
import { loadFiles, discoverAndLoadFiles } from '../services/fileService';
import { sendMessageToAI } from '../services/apiService';

export const runSinglePromptMode = async (
  filePaths: string[] | undefined,
  prompt: string,
  model: string,
  autoDiscover: boolean = false,
  maxFiles?: number,
  basePath?: string
) => {
  const sessionManager = new SessionManager();
  await sessionManager.initialize();
  
  if (filePaths && filePaths.length > 0) {
    const codeContext = await loadFiles(filePaths);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
    }
  } else if (autoDiscover) {
    const codeContext = await discoverAndLoadFiles(prompt, basePath, maxFiles);
    if (codeContext) {
      await sessionManager.addSystemMessage(`Código de contexto:\n\`\`\`\n${codeContext}\n\`\`\``);
    }
  }
  
  await sessionManager.addUserMessage(prompt);
  console.log(`Você: ${prompt}`);
  
  const history = await sessionManager.getConversationHistory();
  const response = await sendMessageToAI(history, model);
  
  if (response) {
    console.log(`Assistente: ${response}`);
  }
  
  await sessionManager.close();
};
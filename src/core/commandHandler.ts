import { SessionManager } from './sessionManager';
import { loadFiles, discoverFiles } from '../services/fileService';
import { 
  printError, 
  printSuccess, 
  printWarning, 
  printInfo, 
  printCommandList,
  printFileAdded,
  printFilesDiscovered,
} from '../styles/prettierLogs';

export interface CommandResult {
  shouldContinue: boolean;
  skipMessageProcessing?: boolean;
}

export const handleSpecialCommand = async (
  input: string,
  sessionManager: SessionManager,
  basePath: string = '.',
  maxFiles: number = 5
): Promise<CommandResult> => {
  if (!input || input.trim() === '') {
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  if (input.toLowerCase() === 'sair') {
    printInfo('Encerrando a aplicação...');
    return { shouldContinue: false };
  }
  
  if (input.startsWith('arquivo:')) {
    const filePath = input.substring(8).trim();
    if (!filePath) {
      printWarning('Por favor, forneça um caminho de arquivo após "arquivo:"');
      return { shouldContinue: true, skipMessageProcessing: true };
    }
    
    try {
      printInfo(`Carregando arquivo "${filePath}"...`);
      
      const fileContent = await loadFiles([filePath]);
      
      if (fileContent) {
        await sessionManager.addSystemMessage(
          `Adicionando novo arquivo ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``
        );
        printFileAdded(filePath);
        printSuccess('Arquivo adicionado com sucesso ao contexto!');
      } else {
        printError(`Não foi possível ler o conteúdo do arquivo "${filePath}"`);
      }
    } catch (error: any) {
      printError(`Erro ao ler o arquivo: ${error.message}`);
    }
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  if (input.startsWith('auto:')) {
    const autoPrompt = input.substring(5).trim();
    if (!autoPrompt) {
      printWarning('Por favor, forneça um prompt para descoberta automática após "auto:"');
      return { shouldContinue: true, skipMessageProcessing: true };
    }
    
    try {
      printInfo(`Buscando arquivos relacionados a "${autoPrompt}"...`);
      
      const discoveredFiles = await discoverFiles(autoPrompt, basePath, maxFiles);
      
      if (discoveredFiles.length > 0) {
        printFilesDiscovered(discoveredFiles);
        printInfo('Carregando conteúdo dos arquivos...');
        
        try {
          const fileContent = await loadFiles(discoveredFiles);
          if (fileContent) {
            await sessionManager.addSystemMessage(
              `Adicionando arquivos descobertos ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``
            );
            printSuccess('Arquivos adicionados com sucesso ao contexto!');
          } else {
            printError('Falha ao carregar conteúdo dos arquivos');
          }
        } catch (loadError: any) {
          printError(`Erro ao carregar arquivos: ${loadError.message}`);
        }
      } else {
        printWarning(`Nenhum arquivo encontrado para o prompt "${autoPrompt}"`);
      }
    } catch (searchError: any) {
      printError(`Erro ao buscar arquivos: ${searchError.message}`);
    }
    
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  if (input.toLowerCase() === 'ajuda' || input.toLowerCase() === 'help') {
    const commands = [
      { name: 'sair', description: 'Encerra a aplicação' },
      { name: 'arquivo:caminho', description: 'Adiciona um arquivo ao contexto' },
      { name: 'auto:prompt', description: 'Descobre e adiciona arquivos relacionados ao prompt' },
      { name: 'ajuda/help', description: 'Exibe esta mensagem de ajuda' }
    ];
    
    printCommandList(commands);
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  return { shouldContinue: true };
};
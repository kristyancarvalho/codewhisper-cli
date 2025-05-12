import { SessionManager } from './sessionManager';
import { loadFiles, discoverFiles } from '../services/fileService';

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
    console.log('Encerrando a aplicação...');
    return { shouldContinue: false };
  }
  
  if (input.startsWith('arquivo:')) {
    const filePath = input.substring(8).trim();
    if (!filePath) {
      console.log('Por favor, forneça um caminho de arquivo após "arquivo:"');
      return { shouldContinue: true, skipMessageProcessing: true };
    }
    
    try {
      const fileContent = await loadFiles([filePath]);
      if (fileContent) {
        await sessionManager.addSystemMessage(
          `Adicionando novo arquivo ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``
        );
        console.log(`Arquivo "${filePath}" adicionado com sucesso!`);
      } else {
        console.log(`Não foi possível ler o conteúdo do arquivo "${filePath}"`);
      }
    } catch (error: any) {
      console.log(`Erro ao ler o arquivo: ${error.message}`);
    }
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  if (input.startsWith('auto:')) {
    const autoPrompt = input.substring(5).trim();
    if (autoPrompt) {
      console.log(`Buscando arquivos relacionados a "${autoPrompt}"...`);
      const discoveredFiles = await discoverFiles(autoPrompt, basePath, maxFiles);
      
      if (discoveredFiles.length > 0) {
        console.log(`Encontrados ${discoveredFiles.length} arquivos: ${discoveredFiles.join(', ')}`);
        const fileContent = await loadFiles(discoveredFiles);
        if (fileContent) {
          await sessionManager.addSystemMessage(
            `Adicionando arquivos descobertos ao contexto:\n\`\`\`\n${fileContent}\n\`\`\``
          );
          console.log('Arquivos adicionados com sucesso!');
        }
      } else {
        console.log(`Nenhum arquivo encontrado para o prompt "${autoPrompt}"`);
      }
    } else {
      console.log('Por favor, forneça um prompt para descoberta automática após "auto:"');
    }
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  if (input.toLowerCase() === 'ajuda' || input.toLowerCase() === 'help') {
    console.log(`
      Comandos disponíveis:
      - "sair" - Encerra a aplicação
      - "arquivo:caminho" - Adiciona um arquivo ao contexto
      - "auto:prompt" - Descobre e adiciona arquivos relacionados ao prompt
      - "ajuda" ou "help" - Exibe esta mensagem de ajuda
    `);
    return { shouldContinue: true, skipMessageProcessing: true };
  }
  
  return { shouldContinue: true };
};
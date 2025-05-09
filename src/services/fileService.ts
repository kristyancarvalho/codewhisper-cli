import { readFileContent, findRelevantFiles } from '../utils/fileUtils';
import { createSpinner, logError, logWarning, printFileList } from '../styles/prettierLogs';

export const loadFiles = async (filePaths: string[]): Promise<string | null> => {
  if (filePaths.length === 0) {
    return null;
  }
  
  try {
    const loadSpinner = createSpinner('Carregando arquivos');
    loadSpinner.start();
    const codeContext = await readFileContent(filePaths);
    loadSpinner.succeed(`${filePaths.length} arquivo(s) carregado(s) com sucesso`);
    return codeContext;
  } catch (error: any) {
    logError(`Erro ao carregar arquivos: ${error.message}`);
    return null;
  }
};

export const discoverFiles = async (
  prompt: string, 
  basePath: string = '.', 
  maxFiles: number = 5
): Promise<string[]> => {
  try {
    const discoverSpinner = createSpinner('Descobrindo arquivos relevantes para o prompt');
    discoverSpinner.start();
    const discoveredFiles = await findRelevantFiles(prompt, basePath, maxFiles);
    
    if (discoveredFiles.length > 0) {
      discoverSpinner.succeed('Arquivos descobertos com sucesso');
      printFileList(discoveredFiles, 'Arquivos encontrados');
      return discoveredFiles;
    } else {
      discoverSpinner.fail('Nenhum arquivo relevante encontrado');
      return [];
    }
  } catch (error: any) {
    logWarning(`Falha na descoberta automática: ${error.message}`);
    return [];
  }
};

export const discoverAndLoadFiles = async (
  prompt: string, 
  basePath: string = '.', 
  maxFiles: number = 5
): Promise<string | null> => {
  const discoveredFiles = await discoverFiles(prompt, basePath, maxFiles);
  if (discoveredFiles.length === 0) {
    return null;
  }
  
  return await loadFiles(discoveredFiles);
};
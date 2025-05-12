import { readFileContent, findRelevantFiles } from '../utils/fileUtils';

export const loadFiles = async (filePaths: string[]): Promise<string | null> => {
  if (filePaths.length === 0) {
    return null;
  }
  
  try {
    console.log('Carregando arquivos');
    const codeContext = await readFileContent(filePaths);
    console.log(`${filePaths.length} arquivo(s) carregado(s) com sucesso`);
    return codeContext;
  } catch (error: any) {
    console.error(`Erro ao carregar arquivos: ${error.message}`);
    return null;
  }
};

export const discoverFiles = async (
  prompt: string, 
  basePath: string = '.', 
  maxFiles: number = 5
): Promise<string[]> => {
  try {
    console.log('Descobrindo arquivos relevantes para o prompt');
    const discoveredFiles = await findRelevantFiles(prompt, basePath, maxFiles);
    
    if (discoveredFiles.length > 0) {
      console.log('Arquivos descobertos com sucesso');
      console.log('Arquivos encontrados:');
      discoveredFiles.forEach(file => console.log(`- ${file}`));
      return discoveredFiles;
    } else {
      console.log('Nenhum arquivo relevante encontrado');
      return [];
    }
  } catch (error: any) {
    console.warn(`Falha na descoberta automática: ${error.message}`);
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
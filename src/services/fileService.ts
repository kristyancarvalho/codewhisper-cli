import { readFileContent, findRelevantFiles } from '../utils/fileUtils';

export const loadFiles = async (filePaths: string[]): Promise<string | null> => {
  if (filePaths.length === 0) {
    return null;
  }
  
  try {
    const codeContext = await readFileContent(filePaths);
    return codeContext;
  } catch (error: any) {
    return null;
  }
};

export const discoverFiles = async (
  prompt: string, 
  basePath: string = '.', 
  maxFiles: number = 5
): Promise<string[]> => {
  try {
    const discoveredFiles = await findRelevantFiles(prompt, basePath, maxFiles);
    return discoveredFiles.length > 0 ? discoveredFiles : [];
  } catch (error: any) {
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
import fs from 'fs/promises';
import path from 'path';

export const readFileContent = async (filePaths: string[]): Promise<string> => {
  try {
    const contents = await Promise.all(filePaths.map(async (filePath) => {
      return await fs.readFile(path.resolve(filePath), 'utf-8');
    }));
    return contents.join('\n\n');
  } catch (error: any) {
    throw new Error(`Erro ao ler os arquivos: ${error.message}`);
  }
};
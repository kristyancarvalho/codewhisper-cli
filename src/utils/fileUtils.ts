import fs from 'fs/promises';
import path from 'path';

export const readFileContent = async (filePaths: string[]): Promise<string> => {
  try {
    const contents = await Promise.all(filePaths.map(async (filePath) => {
      try {
        const content = await fs.readFile(path.resolve(filePath), 'utf-8');
        return `Arquivo: ${filePath}\n\n${content}`;
      } catch (error: any) {
        console.warn(`Aviso: Não foi possível ler o arquivo ${filePath}: ${error.message}`);
        return `Não foi possível ler o arquivo: ${filePath}`;
      }
    }));
    return contents.join('\n\n');
  } catch (error: any) {
    throw new Error(`Erro ao ler os arquivos: ${error.message}`);
  }
};

const CODE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.c', '.cpp', '.h', '.cs', 
                        '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.dart', '.json', '.html', 
                        '.css', '.scss', '.less', '.md', '.yaml', '.yml', '.toml'];

const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', '.cache', '.next'];

export const findCodeFiles = async (
  dir: string, 
  maxDepth: number = 3, 
  currentDepth: number = 0
): Promise<string[]> => {
  if (currentDepth > maxDepth) return [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.includes(entry.name)) continue;
        
        const subFiles = await findCodeFiles(fullPath, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CODE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  } catch (error) {
    console.error(`Erro ao buscar arquivos em ${dir}:`, error);
    return [];
  }
};

export const findRelevantFiles = async (
  prompt: string, 
  basePath: string = '.', 
  maxFiles: number = 5
): Promise<string[]> => {
  const allFiles = await findCodeFiles(basePath);
  if (allFiles.length === 0) {
    throw new Error(`Nenhum arquivo de código encontrado em ${basePath}`);
  }
  
  const keywords = extractKeywords(prompt);
  
  const scoredFiles = await Promise.all(
    allFiles.map(async (file) => {
      const score = await scoreFileRelevance(file, keywords);
      return { file, score };
    })
  );
  
  return scoredFiles
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)
    .map(item => item.file);
};

const extractKeywords = (prompt: string): string[] => {
  const commonWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos',
    'e', 'ou', 'para', 'por', 'como', 'que', 'se', 'em', 'na', 'no',
    'com', 'sem', 'the', 'a', 'an', 'of', 'to', 'in', 'on', 'with',
    'for', 'from', 'by', 'and', 'or', 'but', 'is', 'are', 'was', 'were'
  ]);
  
  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !commonWords.has(word) &&
      !word.match(/^\d+$/)
    );
};

const scoreFileRelevance = async (filePath: string, keywords: string[]): Promise<number> => {
  try {
    const fileName = path.basename(filePath).toLowerCase();
    const fileNameScore = keywords.reduce((score, keyword) => 
      fileName.includes(keyword) ? score + 3 : score, 0);
    
    const dirPath = path.dirname(filePath).toLowerCase();
    const dirPathScore = keywords.reduce((score, keyword) => 
      dirPath.includes(keyword) ? score + 1 : score, 0);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const contentPreview = fileContent.slice(0, 10000).toLowerCase();
    
    const contentScore = keywords.reduce((score, keyword) => {
      const matches = contentPreview.match(new RegExp(keyword, 'g'));
      return score + (matches ? matches.length : 0);
    }, 0);
    
    return fileNameScore * 5 + dirPathScore * 2 + contentScore;
    
  } catch (error) {
    console.warn(`Aviso: Erro ao analisar ${filePath}:`, error);
    return 0;
  }
};
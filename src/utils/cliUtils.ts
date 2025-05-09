import chalk from 'chalk';
import { printCommandHelp, printAppTitle, printSeparator } from '../styles/prettierLogs';

export interface CommandLineArgs {
  filePaths?: string[];
  prompt?: string;
  model: string;
  interactive?: boolean;
  autoDiscover?: boolean;
  maxFiles?: number;
  basePath?: string;
}

export const DEFAULT_MODEL = 'meta-llama/llama-4-maverick:free';
export const DEFAULT_MAX_FILES = 5;

export const parseCommandLineArgs = (args: string[]): CommandLineArgs => {
  const parsedArgs: CommandLineArgs = { 
    model: DEFAULT_MODEL,
    interactive: false,
    autoDiscover: false,
    maxFiles: DEFAULT_MAX_FILES,
    basePath: '.'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-F':
      case '--file-path':
        if (i + 1 >= args.length) {
          throw new Error(`Argumento ${arg} requer um valor`);
        }
        if (!parsedArgs.filePaths) {
          parsedArgs.filePaths = [];
        }
        parsedArgs.filePaths.push(args[i + 1]);
        i++;
        break;
      case '-P':
      case '--prompt':
        if (i + 1 >= args.length) {
          throw new Error(`Argumento ${arg} requer um valor`);
        }
        parsedArgs.prompt = args[i + 1]?.replace(/^"|"$/g, '');
        i++;
        break;
      case '-M':
      case '--model':
        if (i + 1 >= args.length) {
          throw new Error(`Argumento ${arg} requer um valor`);
        }
        parsedArgs.model = args[i + 1];
        i++;
        break;
      case '-I':
      case '--interactive':
        parsedArgs.interactive = true;
        break;
      case '-A':
      case '--auto-discover':
        parsedArgs.autoDiscover = true;
        break;
      case '-H':
      case '--help':
        printUsage();
        process.exit(0);
        break;
      case '--max-files':
        if (i + 1 >= args.length) {
          throw new Error(`Argumento ${arg} requer um valor`);
        }
        const maxFiles = parseInt(args[i + 1], 10);
        if (isNaN(maxFiles) || maxFiles <= 0) {
          throw new Error(`Valor inválido para --max-files: ${args[i + 1]}`);
        }
        parsedArgs.maxFiles = maxFiles;
        i++;
        break;
      case '--path':
        if (i + 1 >= args.length) {
          throw new Error(`Argumento ${arg} requer um valor`);
        }
        parsedArgs.basePath = args[i + 1];
        i++;
        break;
      default:
        throw new Error(`Argumento inválido: ${arg}`);
    }
  }

  return parsedArgs;
};

export const validateArgs = (args: CommandLineArgs) => {
  if (!args.interactive) {
    if (!args.prompt) {
      throw new Error('O argumento --prompt é obrigatório no modo não interativo.');
    }
    
    if ((!args.filePaths || args.filePaths.length === 0) && !args.autoDiscover) {
      throw new Error('É necessário fornecer --file-path ou usar --auto-discover.');
    }
  }
};

export const printUsage = () => {
  printAppTitle();
  console.log(chalk.white.bold('\nUso:'));
  console.log(chalk.cyan('  codewhisper [opções]\n'));
  
  console.log(chalk.white.bold('Opções:'));
  printCommandHelp('-F, --file-path <arquivo>', 'Especifica um arquivo para análise (pode ser usado múltiplas vezes)');
  printCommandHelp('-P, --prompt "<prompt>"', 'Pergunta ou instrução para o assistente');
  printCommandHelp('-M, --model <modelo>', `Modelo de IA a ser usado (default: ${DEFAULT_MODEL})`);
  printCommandHelp('-I, --interactive', 'Ativa o modo interativo de chat');
  printCommandHelp('-A, --auto-discover', 'Descobre automaticamente arquivos relevantes com base no prompt');
  printCommandHelp('--max-files <número>', `Número máximo de arquivos para descoberta automática (default: ${DEFAULT_MAX_FILES})`);
  printCommandHelp('--path <caminho>', 'Diretório base para busca de arquivos (default: diretório atual)');
  printCommandHelp('-H, --help', 'Exibe esta ajuda');
  
  console.log(chalk.white.bold('\nExemplos:'));
  console.log(chalk.gray('  $ ') + chalk.cyan('codewhisper -F src/app.js -P "Como otimizar este código?"'));
  console.log(chalk.gray('  $ ') + chalk.cyan('codewhisper -A -P "Como implementar autenticação?" --max-files 8'));
  console.log(chalk.gray('  $ ') + chalk.cyan('codewhisper -I -M anthropic/claude-3-haiku'));
  
  printSeparator();
};
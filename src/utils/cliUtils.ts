import { 
  printAppTitle,
} from "../styles/prettierLogs";
import chalk from 'chalk';

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
  console.log('\n' + chalk.cyanBright('USO:'));
  console.log('  ' + chalk.greenBright('codewhisper') + ' ' + chalk.yellowBright('[opções]') + '\n');
  
  console.log(chalk.cyanBright('OPÇÕES:'));
  
  const options = [
    { flag: '-F, --file-path <arquivo>', desc: 'Especifica um arquivo para análise (pode ser usado múltiplas vezes)' },
    { flag: '-P, --prompt "<prompt>"', desc: 'Pergunta ou instrução para o assistente' },
    { flag: '-M, --model <modelo>', desc: `Modelo de IA a ser usado (default: ${DEFAULT_MODEL})` },
    { flag: '-I, --interactive', desc: 'Ativa o modo interativo de chat' },
    { flag: '-A, --auto-discover', desc: 'Descobre automaticamente arquivos relevantes com base no prompt' },
    { flag: `--max-files <número>`, desc: `Número máximo de arquivos para descoberta automática (default: ${DEFAULT_MAX_FILES})` },
    { flag: '--path <caminho>', desc: 'Diretório base para busca de arquivos (default: diretório atual)' },
    { flag: '-H, --help', desc: 'Exibe esta ajuda' }
  ];
  
  const maxFlagLength = Math.max(...options.map(opt => opt.flag.length));
  
  options.forEach(opt => {
    console.log(`  ${chalk.greenBright(opt.flag.padEnd(maxFlagLength + 2))} ${opt.desc}`);
  });
  
  console.log('\n' + chalk.cyanBright('EXEMPLOS:'));
  console.log('  $ ' + chalk.greenBright('codewhisper') + ' ' + chalk.yellowBright('-F src/app.js -P "Como otimizar este código?"'));
  console.log('  $ ' + chalk.greenBright('codewhisper') + ' ' + chalk.yellowBright('-A -P "Como implementar autenticação?" --max-files 8'));
  console.log('  $ ' + chalk.greenBright('codewhisper') + ' ' + chalk.yellowBright('-I -M anthropic/claude-3-haiku'));
  console.log('\n');
};
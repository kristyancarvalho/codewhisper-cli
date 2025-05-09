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
  console.log(`Uso: codewhisper [opções]`);
  console.log(`Opções:`);
  console.log(`  -F, --file-path <arquivo>   Especifica um arquivo para análise (pode ser usado múltiplas vezes)`);
  console.log(`  -P, --prompt "<prompt>"      Pergunta ou instrução para o assistente`);
  console.log(`  -M, --model <modelo>        Modelo de IA a ser usado (default: ${DEFAULT_MODEL})`);
  console.log(`  -I, --interactive           Ativa o modo interativo de chat`);
  console.log(`  -A, --auto-discover         Descobre automaticamente arquivos relevantes com base no prompt`);
  console.log(`  --max-files <número>        Número máximo de arquivos para descoberta automática (default: ${DEFAULT_MAX_FILES})`);
  console.log(`  --path <caminho>            Diretório base para busca de arquivos (default: diretório atual)`);
  console.log(`\nExemplos:`);
  console.log(`  codewhisper -F src/app.js -P "Como otimizar este código?"`);
  console.log(`  codewhisper -A -P "Como implementar autenticação?" --max-files 8`);
  console.log(`  codewhisper -I -M anthropic/claude-3-haiku`);
};
export interface CommandLineArgs {
  filePaths?: string[];
  prompt?: string;
  model: string;
  interactive?: boolean;
}

export const DEFAULT_MODEL = 'meta-llama/llama-4-maverick:free';

export const parseCommandLineArgs = (args: string[]): CommandLineArgs => {
  const parsedArgs: CommandLineArgs = { 
    model: DEFAULT_MODEL,
    interactive: false
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
      default:
        throw new Error(`Argumento inválido: ${arg}`);
    }
  }

  return parsedArgs;
};

export const validateArgs = (args: CommandLineArgs) => {
  if (!args.interactive && (!args.filePaths || args.filePaths.length === 0 || !args.prompt)) {
    throw new Error('Os argumentos --file-path e --prompt são obrigatórios a menos que o modo interativo seja usado.');
  }
};

export const printUsage = () => {
  console.log(`Uso: codewhisper -F <arquivo> -P "<prompt>" [-M <modelo>]`);
  console.log(`   ou: codewhisper -I [-M <modelo>] (modo interativo)`);
  console.log(`   ou: codewhisper -F <arquivo> -P "<prompt>" -I [-M <modelo>] (responde prompt e entra em modo interativo)`);
};
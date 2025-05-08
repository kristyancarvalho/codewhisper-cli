import fetch, { Response } from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-4-maverick:free';

interface ApiResponse {
  choices?: { message: { content: string } }[];
  error?: { message: string };
}

interface ApiError {
  error: { message: string };
}

interface CommandLineArgs {
  filePaths?: string[];
  prompt?: string;
  model: string;
}

const parseCommandLineArgs = (args: string[]): CommandLineArgs => {
  const parsedArgs: CommandLineArgs = { model: DEFAULT_MODEL };

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
      default:
        throw new Error(`Argumento inválido: ${arg}`);
    }
  }

  return parsedArgs;
};

const readFileContent = async (filePaths: string[]): Promise<string> => {
  try {
    const contents = await Promise.all(filePaths.map(async (filePath) => {
      return await fs.readFile(path.resolve(filePath), 'utf-8');
    }));
    return contents.join('\n\n');
  } catch (error: any) {
    throw new Error(`Erro ao ler os arquivos: ${error.message}`);
  }
};

const sendToOpenRouter = async (context: string, prompt: string, model: string): Promise<ApiResponse> => {
  if (!API_KEY) {
    throw new Error('A variável de ambiente OPENROUTER_API_KEY não está definida.');
  }

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model,
    messages: [
      { role: 'system', content: 'You are a programming assistant that uses the provided code as context to answer questions.' },
      { role: 'user', content: `Context:\n\`\`\`\n${context}\n\`\`\`\n\nQuestion: ${prompt}` },
    ],
  };

  try {
    const response: Response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json() as ApiError;
      throw new Error(`Erro na requisição para a API (${response.status}): ${errorBody?.error?.message || response.statusText}`);
    }

    return await response.json() as ApiResponse;
  } catch (error: any) {
    throw new Error(`Erro na requisição para a API: ${error.message}`);
  }
};

const validateArgs = (args: CommandLineArgs) => {
  if (!args.filePaths || args.filePaths.length === 0 || !args.prompt) {
    throw new Error('Os argumentos --file-path e --prompt são obrigatórios. --file-path pode ser repetido para múltiplos arquivos.');
  }
};

const printUsage = () => {
  console.log(`Uso: codewhisper -F <caminho do arquivo> [-F <outro caminho>] -P "<prompt do usuário>" [-M <nome do modelo>]`);
  console.log(`   ou: codewhisper --file-path <caminho do arquivo> [--file-path <outro caminho>] --prompt "<prompt do usuário>" [--model <nome do modelo>]`);
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    const parsedArgs = parseCommandLineArgs(args);
    validateArgs(parsedArgs);

    const codeContext = await readFileContent(parsedArgs.filePaths!);
    const apiResponse = await sendToOpenRouter(codeContext, parsedArgs.prompt!, parsedArgs.model);

    if (apiResponse.choices) {
      console.log('\nResposta da IA:');
      console.log(apiResponse.choices[0].message.content);
    } else if (apiResponse.error) {
      console.error('\nErro da API:');
      console.error(apiResponse.error.message);
    } else {
      console.log('Não foi possível obter uma resposta da IA.');
    }
  } catch (error: any) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }
};

main();

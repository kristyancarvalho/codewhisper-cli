import fetch, { Response } from 'node-fetch';

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ApiResponse {
  choices?: { message: { content: string } }[];
  error?: { message: string };
}

interface ApiError {
  error: { message: string };
}

export const sendToOpenRouter = async (messages: ApiMessage[], model: string): Promise<ApiResponse> => {
  if (!API_KEY) {
    throw new Error('A variável de ambiente OPENROUTER_API_KEY não está definida.');
  }

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model,
    messages,
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
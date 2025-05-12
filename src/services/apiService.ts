import { sendToOpenRouter } from '../utils/apiUtils';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToAI = async (messages: Message[], model: string): Promise<string | null> => {
  try {
    if (!messages || messages.length === 0) {
      return null;
    }

    const apiResponse = await sendToOpenRouter(messages, model);

    if (apiResponse && apiResponse.choices && apiResponse.choices.length > 0) {
      const content = apiResponse.choices[0].message.content;
      if (content) {
        return content;
      } else {
        return 'Não foi possível obter uma resposta válida do assistente.';
      }
    } else if (apiResponse && apiResponse.error) {
      return `Erro: ${apiResponse.error.message}`;
    } else {
      return 'Não foi possível obter uma resposta da IA. Por favor, tente novamente.';
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Erro desconhecido';
    return `Ocorreu um erro ao processar sua solicitação: ${errorMessage}`;
  }
};
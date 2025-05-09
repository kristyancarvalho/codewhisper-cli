import { sendToOpenRouter } from '../utils/apiUtils';
import { createSpinner, logError, logWarning } from '../styles/prettierLogs';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToAI = async (messages: Message[], model: string): Promise<string | null> => {
  const apiSpinner = createSpinner('Aguardando resposta do assistente');
  apiSpinner.start();
  
  try {
    if (!messages || messages.length === 0) {
      apiSpinner.stop();
      logWarning('Nenhuma mensagem para enviar à API.');
      return null;
    }
    
    console.log(`Enviando ${messages.length} mensagens para o modelo ${model}`);
    
    const apiResponse = await sendToOpenRouter(messages, model);
    apiSpinner.stop();
    
    if (apiResponse && apiResponse.choices && apiResponse.choices.length > 0) {
      const content = apiResponse.choices[0].message.content;
      if (content) {
        return content;
      } else {
        logWarning('A API retornou uma resposta vazia.');
        return 'Não foi possível obter uma resposta válida do assistente.';
      }
    } else if (apiResponse && apiResponse.error) {
      logError(`Erro da API: ${apiResponse.error.message}`);
      return `Erro: ${apiResponse.error.message}`;
    } else {
      logWarning('Não foi possível obter uma resposta da IA.');
      return 'Não foi possível obter uma resposta da IA. Por favor, tente novamente.';
    }
  } catch (error: any) {
    apiSpinner.stop();
    const errorMessage = error.message || 'Erro desconhecido';
    logError(`Erro na requisição para a API: ${errorMessage}`);
    
    return `Ocorreu um erro ao processar sua solicitação: ${errorMessage}`;
  }
};
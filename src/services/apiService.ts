import { sendToOpenRouter } from '../utils/apiUtils';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToAI = async (messages: Message[], model: string): Promise<string | null> => {
  console.log('Aguardando resposta do assistente...');
  console.log('[API_SERVICE_DEBUG] Iniciando sendMessageToAI');

  try {
    if (!messages || messages.length === 0) {
      console.log('Nenhuma mensagem para enviar à API.');
      console.log('[API_SERVICE_DEBUG] Nenhuma mensagem para enviar.');
      return null;
    }

    console.log(`[API_SERVICE_DEBUG] Enviando ${messages.length} mensagens para o modelo ${model}.`);

    const apiResponse = await sendToOpenRouter(messages, model);

    console.log('[API_SERVICE_DEBUG] Resposta recebida de sendToOpenRouter.');

    if (apiResponse && apiResponse.choices && apiResponse.choices.length > 0) {
      const content = apiResponse.choices[0].message.content;
      if (content) {
        console.log('Assistente respondeu!');
        console.log('[API_SERVICE_DEBUG] Conteúdo da resposta da API:', content.substring(0, 100) + "...");
        return content;
      } else {
        console.log('A API retornou uma resposta vazia.');
        console.log('[API_SERVICE_DEBUG] API retornou resposta vazia.');
        return 'Não foi possível obter uma resposta válida do assistente.';
      }
    } else if (apiResponse && apiResponse.error) {
      console.log(`Erro da API: ${apiResponse.error.message}`);
      console.log('[API_SERVICE_DEBUG] Erro da API:', apiResponse.error.message);
      return `Erro: ${apiResponse.error.message}`;
    } else {
      console.log('Não foi possível obter uma resposta da IA.');
      console.log('[API_SERVICE_DEBUG] Não foi possível obter resposta da IA (condição else).');
      return 'Não foi possível obter uma resposta da IA. Por favor, tente novamente.';
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Erro desconhecido';
    console.log(`Erro na requisição para a API: ${errorMessage}`);
    console.log(`[API_SERVICE_DEBUG] Catch error em sendMessageToAI: ${errorMessage}`, error.stack);
    return `Ocorreu um erro ao processar sua solicitação: ${errorMessage}`;
  }
};
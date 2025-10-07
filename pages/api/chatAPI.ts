import { ChatBody } from '@/types/types';
import { MistralStream } from '@/utils/chatStream';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { inputCode, messages, model, apiKey, libraryId } = (await req.json()) as ChatBody;

    let apiKeyFinal;
    if (apiKey) {
      apiKeyFinal = apiKey;
    } else {
      apiKeyFinal = process.env.MISTRAL_API_KEY;
    }

    const useToolCalling = process.env.USE_FUNCTION_CALLING_ARTIFACTS !== 'false';

    const messagesOrInput = messages || inputCode || '';
    const stream = await MistralStream(
      messagesOrInput, 
      model, 
      apiKeyFinal,
      useToolCalling,
      libraryId
    );

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;


import { ChatBody } from '@/types/types';
import { MistralStream } from '@/utils/chatStream';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { inputCode, messages, model, apiKey } = (await req.json()) as ChatBody;

    let apiKeyFinal;
    if (apiKey) {
      apiKeyFinal = apiKey;
    } else {
      apiKeyFinal = process.env.MISTRAL_API_KEY;
    }

    // Use messages array if provided, otherwise fall back to inputCode (legacy)
    const messagesOrInput = messages || inputCode;
    const stream = await MistralStream(messagesOrInput, model, apiKeyFinal);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;


import { ChatBody } from '@/types/types';
import { MistralStream } from '@/utils/chatStream';
import { getToken } from 'next-auth/jwt';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.email) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { inputCode, messages, model, libraryId } = (await req.json()) as ChatBody;

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Mistral API key not configured',
          message: 'Mistral API key not configured on server'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const useToolCalling = process.env.USE_FUNCTION_CALLING_ARTIFACTS !== 'false';

    const messagesOrInput = messages || inputCode || '';
    const stream = await MistralStream(
      messagesOrInput,
      model,
      apiKey,
      useToolCalling,
      libraryId
    );

    return new Response(stream);
  } catch (error) {
    console.error('Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
};

export default handler;

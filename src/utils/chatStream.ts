import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
   //@ts-ignore
} from 'eventsource-parser';
import { Message } from '@/types/types';
import { artifactSystemPrompt } from './artifactSystemPrompt';

const systemPrompt = artifactSystemPrompt;

export const MistralStream = async (
  messages: Message[] | string,
  model: string,
  key: string | undefined,
) => {
  // Handle both new (messages array) and old (single string) format
  let apiMessages: Message[];
  
  if (typeof messages === 'string') {
    // Legacy format: single message
    apiMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messages },
    ];
  } else {
    // New format: full conversation history
    apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];
  }

  const res = await fetch(`https://api.mistral.ai/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.MISTRAL_API_KEY || ''}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `Mistral API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            
            // Handle reasoning models (magistral) with content arrays
            if (delta?.content && Array.isArray(delta.content)) {
              for (const contentBlock of delta.content) {
                if (contentBlock.type === 'thinking' && contentBlock.thinking) {
                  // Extract thinking content
                  const thinkingText = contentBlock.thinking
                    .map((t: any) => t.text)
                    .join('');
                  if (thinkingText) {
                    const thinkingFormatted = `<think>\n${thinkingText}\n</think>\n`;
                    const queue = encoder.encode(thinkingFormatted);
                    controller.enqueue(queue);
                  }
                } else if (contentBlock.type === 'text' && contentBlock.text) {
                  // Extract regular text content
                  const queue = encoder.encode(contentBlock.text);
                  controller.enqueue(queue);
                }
              }
            } else {
              // Handle regular models with simple string content
              const text = delta?.content;
              if (text) {
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              }
            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

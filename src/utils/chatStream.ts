import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { Message, ToolCallData } from '@/types/types';
import { artifactSystemPrompt } from './artifactSystemPrompt';
import { ARTIFACT_TOOLS } from '@/config/artifactTools';

const systemPrompt = artifactSystemPrompt;

export const MistralStream = async (
  messages: Message[] | string,
  model: string,
  key: string | undefined,
  useToolCalling: boolean = true,
  libraryId?: string,
) => {
  let apiMessages: Message[];
  
  if (typeof messages === 'string') {
    apiMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messages },
    ];
  } else {
    apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];
  }

  const body: any = {
    model,
    messages: apiMessages,
    temperature: 0,
    stream: true,
  };

  if (useToolCalling) {
    const tools = [...ARTIFACT_TOOLS];
    
    // Add document_library tool if libraryId is provided
    if (libraryId) {
      tools.push({
        type: 'document_library',
        library_ids: [libraryId],
      } as any);
    }
    
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const res = await fetch(`https://api.mistral.ai/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.MISTRAL_API_KEY || ''}`,
    },
    method: 'POST',
    body: JSON.stringify(body),
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
      let accumulatedToolCalls: any[] = [];
      let currentToolCallIndex: number | null = null;

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            if (accumulatedToolCalls.length > 0) {
              const toolCallMarker = `__TOOL_CALLS__:${JSON.stringify({ tool_calls: accumulatedToolCalls })}`;
              const queue = encoder.encode(toolCallMarker);
              controller.enqueue(queue);
            }
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            
            if (delta?.tool_calls) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                
                if (!accumulatedToolCalls[index]) {
                  accumulatedToolCalls[index] = {
                    id: toolCallDelta.id || `call_${index}`,
                    type: 'function',
                    function: {
                      name: '',
                      arguments: '',
                    },
                  };
                }

                if (toolCallDelta.function?.name) {
                  accumulatedToolCalls[index].function.name += toolCallDelta.function.name;
                }

                if (toolCallDelta.function?.arguments) {
                  accumulatedToolCalls[index].function.arguments += toolCallDelta.function.arguments;
                }

                if (toolCallDelta.id) {
                  accumulatedToolCalls[index].id = toolCallDelta.id;
                }
              }
            }
            
            if (delta?.content && Array.isArray(delta.content)) {
              for (const contentBlock of delta.content) {
                if (contentBlock.type === 'thinking' && contentBlock.thinking) {
                  const thinkingText = contentBlock.thinking
                    .map((t: any) => t.text)
                    .join('');
                  if (thinkingText) {
                    const thinkingFormatted = `<think>\n${thinkingText}\n</think>\n`;
                    const queue = encoder.encode(thinkingFormatted);
                    controller.enqueue(queue);
                  }
                } else if (contentBlock.type === 'text' && contentBlock.text) {
                  const queue = encoder.encode(contentBlock.text);
                  controller.enqueue(queue);
                }
              }
            } else {
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

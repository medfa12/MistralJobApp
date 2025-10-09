import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { Message, ToolCallData } from '@/types/types';
import { getSystemPromptForModel } from './systemPrompt';
import { ARTIFACT_TOOLS } from '@/config/artifactTools';

export const MistralStream = async (
  messages: Message[] | string,
  model: string,
  key: string | undefined,
  useToolCalling: boolean = true,
  libraryId?: string,
) => {
  // Check if this is a reasoning model
  const isReasoningModel = model.includes('magistral');

  // Use appropriate system prompt based on model type
  const systemPromptWithIdentity = getSystemPromptForModel(model);

  let apiMessages: Message[];

  if (typeof messages === 'string') {
    apiMessages = [
      { role: 'system', content: systemPromptWithIdentity },
      { role: 'user', content: messages },
    ];
  } else {
    let messagesArray = messages as Message[];
    const hasSystemMessage = messagesArray.length > 0 && messagesArray[0].role === 'system';

    if (hasSystemMessage) {
      const firstContent = messagesArray[0].content;
      if (typeof firstContent === 'string' && !firstContent.includes('[Model Identity]')) {
        messagesArray = [
          { ...messagesArray[0], content: `${firstContent}\n\n[Model Identity] ${model}` },
          ...messagesArray.slice(1),
        ];
      }
      apiMessages = messagesArray;
    } else {
      apiMessages = [
        { role: 'system', content: systemPromptWithIdentity },
        ...messagesArray,
      ];
    }
  }

  const body: any = {
    model,
    messages: apiMessages,
    temperature: 0,
    stream: true,
  };

  // For reasoning models, set prompt_mode to null since we're using a custom system prompt
  // This prevents the default reasoning prompt from being added on top of our artifact prompt
  if (isReasoningModel) {
    body.prompt_mode = null;
  }

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
    let errorMessage = `Mistral API error (${res.status})`;

    try {
      // Try to read and parse the error response body
      const result = await res.body?.getReader().read();
      if (result?.value) {
        const errorText = decoder.decode(result.value);

        // Try to parse as JSON to get detailed error info
        try {
          const errorJson = JSON.parse(errorText);
          // Mistral API typically returns errors in this format
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorText;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = errorText || statusText;
        }
      }
    } catch (e) {
      errorMessage = statusText;
    }

    throw new Error(errorMessage);
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

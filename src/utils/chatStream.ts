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
  const isReasoningModel = model.includes('magistral');

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

  if (isReasoningModel) {
    body.prompt_mode = null;
  }

  if (useToolCalling) {
    const tools = [...ARTIFACT_TOOLS];

    // Note: document_library is only supported in Agents API, not in chat completions
    // For RAG, we would need to implement Agents API or do manual retrieval
    // For now, we only use artifact tools in project chat

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
      const result = await res.body?.getReader().read();
      if (result?.value) {
        const errorText = decoder.decode(result.value);

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorText;
        } catch (e) {
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

      let totalGeneratedChars = 0;
      let lastMetricsTime = Date.now();
      const METRICS_INTERVAL_MS = 150;
      const METRICS_MARKER = '__STREAM_METRICS__:';

      const emitMetrics = () => {
        const now = Date.now();
        if (now - lastMetricsTime >= METRICS_INTERVAL_MS) {
          const metricsData = JSON.stringify({ chars: totalGeneratedChars, ts: now });
          controller.enqueue(encoder.encode(`${METRICS_MARKER}${metricsData}\n`));
          lastMetricsTime = now;
        }
      };

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            const finalMetrics = JSON.stringify({ chars: totalGeneratedChars, ts: Date.now(), done: true });
            controller.enqueue(encoder.encode(`${METRICS_MARKER}${finalMetrics}\n`));

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
                  totalGeneratedChars += toolCallDelta.function.arguments.length;
                  emitMetrics();
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
                    totalGeneratedChars += thinkingText.length;
                    const thinkingFormatted = `<think>\n${thinkingText}\n</think>\n`;
                    const queue = encoder.encode(thinkingFormatted);
                    controller.enqueue(queue);
                    emitMetrics();
                  }
                } else if (contentBlock.type === 'text' && contentBlock.text) {
                  totalGeneratedChars += contentBlock.text.length;
                  const queue = encoder.encode(contentBlock.text);
                  controller.enqueue(queue);
                  emitMetrics();
                }
              }
            } else {
              const text = delta?.content;
              if (text) {
                totalGeneratedChars += text.length;
                const queue = encoder.encode(text);
                controller.enqueue(queue);
                emitMetrics();
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

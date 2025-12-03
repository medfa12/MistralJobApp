import { useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ChatBody, MistralModel, ToolCallData } from '@/types/types';
import { detectArtifactInStream, isToolCallComplete, extractToolCallData, extractStreamMetrics } from '@/utils/streamingHelpers';

interface StreamOptions {
  apiMessages: any[];
  model: MistralModel;
  libraryId?: string;
  onStreamUpdate: (response: string, isGeneratingArtifact: boolean, artifactLoadingInfo: any, streamingCode?: string) => void;
  onComplete: (response: string, toolCalls?: ToolCallData[]) => void;
  onError: (error: Error) => void;
  onStreamStart?: () => void;
  onTokenUpdate?: (content: string | number) => void;
  onStreamEnd?: () => void;
}

export function useChatAPI() {
  const toast = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (options: StreamOptions) => {
    const { apiMessages, model, libraryId, onStreamUpdate, onComplete, onError, onStreamStart, onTokenUpdate, onStreamEnd } = options;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const body: ChatBody = {
        messages: apiMessages,
        model,
        libraryId,
      };

      const response = await fetch('../api/chatAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Something went wrong when fetching from the API.';

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          console.warn('Failed to parse error response:', e);
        }

        toast({
          title: 'API Error',
          description: errorMessage,
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });

        throw new Error(errorMessage);
      }

      const data = response.body;

      if (!data) {
        toast({
          title: 'Error',
          description: 'No response data received from the API.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        throw new Error('No response data received');
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';
      let fullContentForTokens = '';
      let isGeneratingArtifact = false;
      let artifactLoadingInfo: any = null;
      let accumulatedToolCalls: ToolCallData[] = [];
      let hasReceivedMetrics = false;

      if (onStreamStart) {
        onStreamStart();
      }

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        const { metrics, cleanBuffer } = extractStreamMetrics(chunkValue);

        if (metrics) {
          hasReceivedMetrics = true;
          if (onTokenUpdate) {
            onTokenUpdate(metrics.chars);
          }
        }

        fullContentForTokens += cleanBuffer;

        if (!hasReceivedMetrics && onTokenUpdate) {
           onTokenUpdate(fullContentForTokens);
        }

        if (isToolCallComplete(fullContentForTokens)) {
          const { toolCallJson, textContent } = extractToolCallData(fullContentForTokens);
          accumulatedResponse = textContent;

          if (toolCallJson) {
            try {
              const toolCallData = JSON.parse(toolCallJson);
              accumulatedToolCalls = toolCallData.tool_calls || [];
            } catch {
              accumulatedToolCalls = [];
            }
          }
        } else {
          const { textContent } = extractToolCallData(fullContentForTokens);
          accumulatedResponse = textContent;
        }

        const streamingState = detectArtifactInStream(fullContentForTokens, {
          isGeneratingArtifact,
          artifactLoadingInfo,
          toolCalls: accumulatedToolCalls,
        });

        isGeneratingArtifact = streamingState.isGeneratingArtifact;
        artifactLoadingInfo = streamingState.artifactLoadingInfo;

        onStreamUpdate(
          accumulatedResponse,
          isGeneratingArtifact,
          artifactLoadingInfo,
          streamingState.streamingArtifactCode
        );
      }

      if (onStreamEnd) {
        onStreamEnd();
      }

      onComplete(accumulatedResponse, accumulatedToolCalls);
      abortControllerRef.current = null;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        abortControllerRef.current = null;
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });

      onError(error as Error);
      abortControllerRef.current = null;
    }
  }, []);

  return {
    sendMessage,
    abortRequest,
  };
}

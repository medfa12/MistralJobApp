import { useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ChatBody, MistralModel, ToolCallData } from '@/types/types';
import { detectArtifactInStream } from '@/utils/streamingHelpers';

interface StreamOptions {
  apiMessages: any[];
  model: MistralModel;
  libraryId?: string;
  onStreamUpdate: (response: string, isGeneratingArtifact: boolean, artifactLoadingInfo: any, streamingCode?: string) => void;
  onComplete: (response: string, toolCalls?: ToolCallData[]) => void;
  onError: (error: Error) => void;
}

export function useChatAPI() {
  const toast = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const sendMessage = useCallback(async (options: StreamOptions) => {
    const { apiMessages, model, libraryId, onStreamUpdate, onComplete, onError } = options;

    try {
      const apiKey = localStorage.getItem('apiKey');
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const body: ChatBody = {
        messages: apiMessages,
        model,
        apiKey,
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
        let errorMessage = 'Something went wrong when fetching from the API. Make sure to use a valid API key.';
        
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
      let isGeneratingArtifact = false;
      let artifactLoadingInfo: any = null;
      let accumulatedToolCalls: ToolCallData[] = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        
        if (chunkValue.includes('__TOOL_CALLS__:')) {
          const toolCallMatch = chunkValue.match(/__TOOL_CALLS__:(.+)/);
          if (toolCallMatch) {
            try {
              const toolCallData = JSON.parse(toolCallMatch[1]);
              accumulatedToolCalls = toolCallData.tool_calls || [];
              accumulatedResponse += chunkValue.replace(/__TOOL_CALLS__:.+/, '');
            } catch (e) {
              accumulatedResponse += chunkValue;
            }
          }
        } else {
          accumulatedResponse += chunkValue;
        }
        
        const streamingState = detectArtifactInStream(accumulatedResponse, {
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

      onComplete(accumulatedResponse, accumulatedToolCalls);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
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
    }
  }, [toast]);

  return {
    sendMessage,
    abortRequest,
  };
}


import { useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ChatBody, MistralModel } from '@/types/types';
import { detectArtifactInStream } from '@/utils/streamingHelpers';

interface StreamOptions {
  apiMessages: any[];
  model: MistralModel;
  onStreamUpdate: (response: string, isGeneratingArtifact: boolean, artifactLoadingInfo: any) => void;
  onComplete: (response: string) => void;
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
    const { apiMessages, model, onStreamUpdate, onComplete, onError } = options;

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

      // Stream processing
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';
      let isGeneratingArtifact = false;
      let artifactLoadingInfo: any = null;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;
        
        const streamingState = detectArtifactInStream(accumulatedResponse, {
          isGeneratingArtifact,
          artifactLoadingInfo,
        });
        
        isGeneratingArtifact = streamingState.isGeneratingArtifact;
        artifactLoadingInfo = streamingState.artifactLoadingInfo;
        
        onStreamUpdate(accumulatedResponse, isGeneratingArtifact, artifactLoadingInfo);
      }

      onComplete(accumulatedResponse);
      
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


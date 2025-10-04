import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { MistralModel } from '@/types/types';
import { getModelInfo, formatContextWindow } from '@/config/models';
import { estimateTokens, getMessageText } from '@/utils/messageHelpers';
import { TOKEN_LIMIT_PERCENTAGE, TOKEN_WARNING_PERCENTAGE } from '@/utils/chatConstants';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface TokenValidationResult extends ValidationResult {
  totalTokens?: number;
  showWarning?: boolean;
}

export function useValidation() {
  const toast = useToast();

  const validateApiKey = useCallback((): ValidationResult => {
    const apiKey = localStorage.getItem('apiKey');
    
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a Mistral API key from https://console.mistral.ai/.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return { isValid: false, error: 'API key required' };
    }

    return { isValid: true };
  }, [toast]);

  const validateModel = useCallback((model: MistralModel): ValidationResult => {
    const modelInfo = getModelInfo(model);
    
    if (!modelInfo) {
      toast({
        title: 'Invalid Model',
        description: 'Selected model is not configured properly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return { isValid: false, error: 'Invalid model' };
    }

    return { isValid: true };
  }, [toast]);

  const validateInput = useCallback((input: string): ValidationResult => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      toast({
        title: 'Message Required',
        description: 'Please enter your message.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return { isValid: false, error: 'Message required' };
    }

    return { isValid: true };
  }, [toast]);

  const validateTokens = useCallback((
    messages: any[],
    currentInput: string,
    model: MistralModel
  ): TokenValidationResult => {
    const modelInfo = getModelInfo(model);
    
    if (!modelInfo) {
      return { isValid: false, error: 'Invalid model' };
    }

    let totalTokens = estimateTokens('You are Mistral AI...');
    messages.forEach(msg => {
      totalTokens += estimateTokens(getMessageText(msg.content));
    });
    totalTokens += estimateTokens(currentInput);

    const maxInputTokens = Math.floor(modelInfo.contextWindow * TOKEN_LIMIT_PERCENTAGE);
    
    if (totalTokens > maxInputTokens) {
      toast({
        title: 'Context Window Exceeded',
        description: `This conversation (≈${totalTokens.toLocaleString()} tokens) exceeds ${modelInfo.displayName}'s context limit of ${formatContextWindow(modelInfo.contextWindow)} tokens. Please start a new conversation or use a model with a larger context window.`,
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top',
      });
      return { isValid: false, totalTokens, error: 'Context window exceeded' };
    }

    const warningThreshold = Math.floor(modelInfo.contextWindow * TOKEN_WARNING_PERCENTAGE);
    const showWarning = totalTokens > warningThreshold && totalTokens <= maxInputTokens;
    
    if (showWarning) {
      toast({
        title: 'Approaching Context Limit',
        description: `You're using ≈${totalTokens.toLocaleString()} of ${formatContextWindow(modelInfo.contextWindow)} tokens (${Math.round((totalTokens / modelInfo.contextWindow) * 100)}%). Consider starting a new conversation soon.`,
        status: 'warning',
        duration: 6000,
        isClosable: true,
        position: 'top',
      });
    }

    return { isValid: true, totalTokens, showWarning };
  }, [toast]);

  return {
    validateApiKey,
    validateModel,
    validateInput,
    validateTokens,
  };
}


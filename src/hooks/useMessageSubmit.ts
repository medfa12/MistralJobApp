import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { 
  Message as MessageType, 
  MistralModel, 
  InspectedCodeAttachment,
  ArtifactData,
  ToolCallData
} from '@/types/types';
import { useValidation } from './useValidation';
import { useMessageBuilder } from './useMessageBuilder';
import { useChatAPI } from './useChatAPI';
import { getMessageText } from '@/utils/messageHelpers';

interface UseMessageSubmitOptions {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  model: MistralModel;
  currentConversationId: string | null;
  currentArtifact: ArtifactData | null;
  libraryId?: string;
  createNewConversation: (firstMessage: string, model: MistralModel) => Promise<string | null>;
  saveMessage: (convId: string, role: string, content: string, attachments?: any[], artifact?: ArtifactData, toolCall?: any) => Promise<void>;
  processAttachments: () => Promise<{ contentArray: any[]; uploadedAttachments: any[] }>;
  processArtifactResponse: (response: string, toolCalls?: ToolCallData[]) => Promise<{ artifactData?: ArtifactData; toolCallData?: any; cleanContent: string }>;
  clearAttachments: () => void;
}

interface SubmitMessageOptions {
  inputCode: string;
  inspectedCodeAttachment: InspectedCodeAttachment | null;
  hasAttachments: boolean;
  onSuccess?: () => void;
  onInputClear: () => void;
  onInspectedCodeClear: () => void;
}

export function useMessageSubmit(options: UseMessageSubmitOptions) {
  const {
    messages,
    setMessages,
    model,
    currentConversationId,
    currentArtifact,
    libraryId,
    createNewConversation,
    saveMessage,
    processAttachments,
    processArtifactResponse,
    clearAttachments,
  } = options;

  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [artifactLoadingInfo, setArtifactLoadingInfo] = useState<{ operation: string; title?: string; type?: string } | null>(null);
  const [streamingArtifactCode, setStreamingArtifactCode] = useState<string>('');

  const { validateApiKey, validateModel, validateInput, validateTokens } = useValidation();
  const { buildUserMessageContent, buildApiMessages } = useMessageBuilder();
  const { sendMessage, abortRequest } = useChatAPI();

  const submitMessage = useCallback(async (submitOptions: SubmitMessageOptions) => {
    const {
      inputCode,
      inspectedCodeAttachment,
      hasAttachments,
      onInputClear,
      onInspectedCodeClear,
    } = submitOptions;

    const currentInput = inputCode.trim();

    // Validation steps
    const apiKeyValidation = validateApiKey();
    if (!apiKeyValidation.isValid) return;

    const modelValidation = validateModel(model);
    if (!modelValidation.isValid) return;

    const inputValidation = validateInput(currentInput);
    if (!inputValidation.isValid) return;

    const tokenValidation = validateTokens(messages, currentInput, model);
    if (!tokenValidation.isValid) return;

    // Get or create conversation ID
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation(currentInput, model);
      if (!convId) {
        toast({
          title: 'Error',
          description: 'Failed to create conversation. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }

    try {
      let uploadedAttachments: any[] = [];
      let attachmentContent: any[] = [];

      // Process attachments if any
      if (hasAttachments) {
        setLoading(true);
        const result = await processAttachments();
        uploadedAttachments = result.uploadedAttachments;
        attachmentContent = result.contentArray;
      }

      const userMessageContent = buildUserMessageContent({
        currentInput,
        inspectedCodeAttachment,
        currentArtifact,
        attachmentContent,
      });

      const userMessage: MessageType = { 
        role: 'user', 
        content: userMessageContent,
        attachments: uploadedAttachments,
        inspectedCodeAttachment: inspectedCodeAttachment || undefined,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      onInputClear();
      onInspectedCodeClear();
      setStreamingMessage('');
      setLoading(true);
      clearAttachments();

      await saveMessage(
        convId, 
        'user', 
        getMessageText(userMessageContent), 
        uploadedAttachments, 
        undefined, 
        undefined
      );

      const apiMessages = buildApiMessages({
        messages,
        userMessageContent,
        currentArtifact,
        inspectedCodeAttachment,
      });
      await sendMessage({
        apiMessages,
        model,
        libraryId,
        onStreamUpdate: (response, isGenerating, loadingInfo, streamingCode) => {
          setIsGeneratingArtifact(isGenerating);
          setArtifactLoadingInfo(loadingInfo);
          setStreamingArtifactCode(streamingCode || '');

          if (isGenerating) {
            setStreamingMessage('');
          } else {
            setStreamingMessage(response);
          }
        },
        onComplete: async (response, toolCalls) => {
          const { artifactData, toolCallData, cleanContent } = await processArtifactResponse(response, toolCalls);

          const finalContent = cleanContent.trim() || (toolCallData ? '[Tool call executed]' : '');

          const assistantMessage: MessageType = { 
            role: 'assistant', 
            content: finalContent,
            artifact: artifactData,
            toolCall: toolCallData,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingMessage('');
          setIsGeneratingArtifact(false);
          setArtifactLoadingInfo(null);
          setLoading(false);

          if (convId) {
            await saveMessage(convId, 'assistant', finalContent, undefined, artifactData, toolCallData);
          }
        },
        onError: () => {
          setLoading(false);
          setStreamingMessage('');
          setIsGeneratingArtifact(false);
          setArtifactLoadingInfo(null);
        },
      });
      
    } catch (error) {
      setLoading(false);
      setStreamingMessage('');
      setIsGeneratingArtifact(false);
      setArtifactLoadingInfo(null);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [
    messages,
    setMessages,
    model,
    currentConversationId,
    currentArtifact,
    libraryId,
    validateApiKey,
    validateModel,
    validateInput,
    validateTokens,
    createNewConversation,
    saveMessage,
    processAttachments,
    clearAttachments,
    buildUserMessageContent,
    buildApiMessages,
    sendMessage,
    processArtifactResponse,
    toast,
  ]);

  return {
    submitMessage,
    loading,
    streamingMessage,
    isGeneratingArtifact,
    artifactLoadingInfo,
    streamingArtifactCode,
    abortRequest,
  };
}

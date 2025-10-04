'use client';

import Link from '@/components/link/Link';
import { MistralModel, Message as MessageType, InspectedCodeAttachment } from '@/types/types';
import { ArtifactSidePanel, ArtifactToggleButton, ArtifactErrorBoundary } from '@/components/artifact';
import { estimateTokens, getMessageText } from '@/utils/messageHelpers';
import {
  Box,
  Flex,
  Img,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState, useRef, Suspense, useCallback, useMemo } from 'react';
import Bg from '../../public/img/chat/bg-image.png';
import { useSearchParams } from 'next/navigation';
import { getModelInfo } from '@/config/models';
import { useChatConversation } from '@/hooks/useChatConversation';
import { useAttachments } from '@/hooks/useAttachments';
import { useArtifactOperations } from '@/hooks/useArtifactOperations';
import { useMessageSubmit } from '@/hooks/useMessageSubmit';
import {
  ModelSelector,
  ChatMessages,
  ChatInput,
  TokenCounter,
  AttachmentPreview,
  InspectedCodePreview,
} from '@/components/chat';

function ChatContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('conversationId') || null;
  const toast = useToast();

  const [inputCode, setInputCode] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [model, setModel] = useState<MistralModel>('mistral-small-latest');
  const [inspectedCodeAttachment, setInspectedCodeAttachment] = useState<InspectedCodeAttachment | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    currentConversationId,
    setCurrentConversationId,
    isLoadingHistory,
    loadConversation,
    createNewConversation,
    saveMessage,
  } = useChatConversation();

  const {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    processAttachments,
  } = useAttachments();

  const {
    currentArtifact,
    isArtifactPanelOpen,
    setIsArtifactPanelOpen,
    processArtifactResponse,
    resetArtifacts,
  } = useArtifactOperations();

  const {
    submitMessage,
    loading,
    streamingMessage,
    isGeneratingArtifact,
    artifactLoadingInfo,
    abortRequest,
  } = useMessageSubmit({
    messages,
    setMessages,
    model,
    currentConversationId,
    currentArtifact,
    createNewConversation,
    saveMessage,
    processAttachments,
    processArtifactResponse,
    clearAttachments,
  });

  const currentTokens = useMemo(() => {
    let total = estimateTokens('You are Mistral AI...');
    messages.forEach(msg => {
      total += estimateTokens(getMessageText(msg.content));
    });
    total += estimateTokens(inputCode);
    return total;
  }, [messages, inputCode]);

  const modelInfo = getModelInfo(model);

  useEffect(() => {
    if (chatContainerRef.current && !isLoadingHistory) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, streamingMessage, isLoadingHistory]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId).then((loadedMessages) => {
        if (loadedMessages) {
          setMessages(loadedMessages);
          resetArtifacts();
        }
      });
      setCurrentConversationId(conversationId);
    } else {
      setMessages([]);
      setCurrentConversationId(null);
      resetArtifacts();
      setInputCode('');
      clearAttachments();
    }
  }, [conversationId, loadConversation, clearAttachments, setCurrentConversationId, resetArtifacts]);

  useEffect(() => {
    return () => {
      abortRequest();
    };
  }, [abortRequest]);

  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  const handleTranslate = async () => {
    await submitMessage({
      inputCode,
      inspectedCodeAttachment,
      hasAttachments: attachments.length > 0,
      onInputClear: () => setInputCode(''),
      onInspectedCodeClear: () => setInspectedCodeAttachment(null),
    });
  };

  const handleCodeAttach = useCallback(
    (attachment: InspectedCodeAttachment) => {
      setInspectedCodeAttachment(attachment);
      toast({
        title: 'Element Code Attached',
        description: `<${attachment.elementTag}> code ready to include in your next message`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    },
    [toast]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <>
      <Flex w="100%" h="100vh" pt={{ base: '70px', md: '0px' }} direction="column" position="relative">
      <Img
        src={Bg.src}
        position="absolute"
        w="350px"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        opacity={messages.length === 0 ? 1 : 0.3}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        h="100%"
        maxW="1000px"
      >
        <TokenCounter
          currentTokens={currentTokens}
          modelInfo={modelInfo}
          messagesCount={messages.length}
        />

        <ModelSelector
          selectedModel={model}
          onModelChange={setModel}
        />

        <Flex
          ref={chatContainerRef}
          direction="column"
          w="100%"
          mx="auto"
          flex="1"
          overflowY="auto"
          minH="0"
        >
          <ChatMessages
            messages={messages}
            streamingMessage={streamingMessage}
            isGeneratingArtifact={isGeneratingArtifact}
            artifactLoadingInfo={artifactLoadingInfo}
            messagesEndRef={messagesEndRef}
          />
        </Flex>

        <Flex
          ms={{ base: '0px', xl: '60px' }}
          mt="20px"
          mb="10px"
          flexShrink={0}
          direction="column"
          gap="10px"
        >
          <AttachmentPreview
            attachments={attachments}
            onRemove={removeAttachment}
          />

          {currentArtifact && (
            <Box mb={3}>
              <ArtifactToggleButton
                artifact={currentArtifact}
                isOpen={isArtifactPanelOpen}
                onClick={() => setIsArtifactPanelOpen(!isArtifactPanelOpen)}
              />
            </Box>
          )}

          {inspectedCodeAttachment && (
            <InspectedCodePreview
              attachment={inspectedCodeAttachment}
              onRemove={() => setInspectedCodeAttachment(null)}
            />
          )}

          <ChatInput
            value={inputCode}
            onChange={setInputCode}
            onSubmit={handleTranslate}
            onKeyPress={handleKeyPress}
            loading={loading}
            modelInfo={modelInfo}
            attachmentCount={attachments.length}
            onImageAttach={(file, preview) => addAttachment('image', file, preview)}
            onDocumentAttach={(file) => addAttachment('document', file)}
          />
        </Flex>

        <Flex
          justify="center"
          mt="10px"
          mb="10px"
          direction={{ base: 'column', md: 'row' }}
          alignItems="center"
          flexShrink={0}
        >
          <Text fontSize="xs" textAlign="center" color={gray}>
           AI can make mistakes.
          </Text>
          <Link href="https://docs.mistral.ai">
            <Text
              fontSize="xs"
              color={textColor}
              fontWeight="500"
              textDecoration="underline"
            >
              Mistral AI Docs
            </Text>
          </Link>
        </Flex>
      </Flex>
      </Flex>

      <ArtifactErrorBoundary onReset={resetArtifacts}>
        <ArtifactSidePanel
          artifact={currentArtifact}
          isOpen={isArtifactPanelOpen}
          onClose={() => setIsArtifactPanelOpen(false)}
          onCodeAttach={handleCodeAttach}
        />
      </ArtifactErrorBoundary>
    </>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<Flex w="100%" h="100vh" align="center" justify="center"><Text>Loading...</Text></Flex>}>
      <ChatContent />
    </Suspense>
  );
}

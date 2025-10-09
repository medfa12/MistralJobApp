'use client';

import Link from '@/components/link/Link';
import { MistralModel, Message as MessageType, InspectedCodeAttachment, ArtifactData } from '@/types/types';
import { ArtifactErrorBoundary } from '@/components/artifact';
import { ArtifactWorkspace, ArtifactWorkspaceRef } from '@/components/artifact/ArtifactWorkspace';
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
import { useSearchParams } from 'next/navigation';
import { getModelInfo } from '@/config/models';
import { useChatConversation } from '@/hooks/useChatConversation';
import { useAttachments } from '@/hooks/useAttachments';
import { useArtifactOperations } from '@/hooks/useArtifactOperations';
import { useMessageSubmit } from '@/hooks/useMessageSubmit';
import { useResizable } from '@/hooks/useResizable';
import { ChatStateProvider, useChatState } from '@/contexts/ChatStateContext';
import {
  ModelSelector,
  ChatMessages,
  ChatInput,
  TokenCounter,
  AttachmentPreview,
  InspectedCodePreview,
  ProjectSelector,
} from '@/components/chat';

function ChatContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('conversationId') || null;
  const toast = useToast();

  const [inputCode, setInputCode] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [model, setModel] = useState<MistralModel>('mistral-small-latest');
  const [inspectedCodeAttachment, setInspectedCodeAttachment] = useState<InspectedCodeAttachment | null>(null);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
    emoji?: string;
    documentCount?: number;
    mistralLibraryId: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastLoadedConversationIdRef = useRef<string | null>(null);

  // Use centralized chat state
  const {
    loading,
    setLoading,
    streamingMessage,
    setStreamingMessage,
    isGeneratingArtifact,
    setIsGeneratingArtifact,
    artifactLoadingInfo,
    setArtifactLoadingInfo,
    streamingArtifactCode,
    setStreamingArtifactCode,
    resetChatState,
  } = useChatState();

  const { size: splitSize, isDragging, containerRef, handleMouseDown } = useResizable({
    defaultSize: 60,
    minSize: 30,
    maxSize: 80,
  });

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
    artifacts,
    isArtifactPanelOpen,
    setIsArtifactPanelOpen,
    setCurrentConversationId: setArtifactConversationId,
    processArtifactResponse,
    resetArtifacts,
    restoreArtifact,
    switchArtifact,
    deleteArtifact,
    revertToVersion,
    updateCurrentDocument,
    saveCurrentArtifactVersion,
  } = useArtifactOperations();

  const {
    submitMessage,
    abortRequest,
  } = useMessageSubmit({
    messages,
    setMessages,
    model,
    currentConversationId,
    currentArtifact,
    libraryId: selectedProject?.mistralLibraryId,
    createNewConversation,
    saveMessage,
    processAttachments,
    processArtifactResponse,
    clearAttachments,
    setLoading,
    setStreamingMessage,
    setIsGeneratingArtifact,
    setArtifactLoadingInfo,
    setStreamingArtifactCode,
  });

  const currentTokens = useMemo(() => {
    let total = 0;

    // System prompt tokens (varies by model)
    const isReasoningModel = model.includes('magistral');
    if (isReasoningModel) {
      // Reasoning system prompt: ~9,759 chars = ~2,500 tokens
      total += 2500;
    } else {
      // Standard artifact system prompt: ~15,836 chars = ~4,000 tokens
      total += 4000;
    }

    // Tool definitions: ~4,221 chars = ~1,000 tokens
    total += 1000;

    // Message history
    messages.forEach(msg => {
      total += estimateTokens(getMessageText(msg.content));

      // Count attachments if present
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          if (att.type === 'image') {
            // Images: ~85-170 tokens per image (Mistral docs)
            total += 170;
          } else if (att.type === 'document') {
            // Documents: estimate based on content
            total += 500; // Conservative estimate
          }
        });
      }
    });

    // Current input
    total += estimateTokens(inputCode);

    // Inspected code attachment
    if (inspectedCodeAttachment) {
      total += estimateTokens(inspectedCodeAttachment.code || '');
    }

    // Regular attachments
    attachments.forEach(att => {
      if (att.type === 'image') {
        total += 170;
      } else if (att.type === 'document') {
        total += 500;
      }
    });

    // Current artifact context (when editing)
    if (currentArtifact) {
      total += estimateTokens(currentArtifact.code || '');
      total += estimateTokens(currentArtifact.title || '');
    }

    return total;
  }, [messages, inputCode, model, inspectedCodeAttachment, attachments, currentArtifact]);

  const modelInfo = getModelInfo(model);

  // Sync artifact conversation ID whenever the main conversation ID changes
  useEffect(() => {
    setArtifactConversationId(currentConversationId);
  }, [currentConversationId, setArtifactConversationId]);

  useEffect(() => {
    if (chatContainerRef.current && !isLoadingHistory) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, streamingMessage, isLoadingHistory]);

  useEffect(() => {
    if (!conversationId) {
      resetChatState();
      setMessages([]);
      setCurrentConversationId(null);
      setArtifactConversationId(null);
      resetArtifacts();
      setInputCode('');
      clearAttachments();
      lastLoadedConversationIdRef.current = null;
      return;
    }

    if (lastLoadedConversationIdRef.current === conversationId) {
      return;
    }

    lastLoadedConversationIdRef.current = conversationId;

    resetChatState();

    loadConversation(conversationId).then((loadedMessages) => {
      if (loadedMessages) {
        setMessages(loadedMessages);

        const messagesWithArtifacts = loadedMessages
          .filter(msg => msg.artifact)
          .map(msg => msg.artifact as ArtifactData);

        if (messagesWithArtifacts.length > 0) {
          messagesWithArtifacts.forEach(artifact => {
            restoreArtifact(artifact);
          });
        } else {
          resetArtifacts();
        }
      }
    });

    setCurrentConversationId(conversationId);
    setArtifactConversationId(conversationId);
  }, [conversationId, loadConversation, clearAttachments, setCurrentConversationId, setArtifactConversationId, resetArtifacts, restoreArtifact, resetChatState]);

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
      onInspectedCodeClear: () => {
        setInspectedCodeAttachment(null);
        artifactWorkspaceRef.current?.clearInspection();
      },
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

  const artifactWorkspaceRef = useRef<ArtifactWorkspaceRef>(null);

  const handleRemoveInspectedCode = useCallback(() => {
    setInspectedCodeAttachment(null);
    artifactWorkspaceRef.current?.clearInspection();
  }, []);

  const handleArtifactClick = useCallback((artifact: ArtifactData) => {
    restoreArtifact(artifact);
    setIsArtifactPanelOpen(true);
  }, [restoreArtifact, setIsArtifactPanelOpen]);

  const handleVersionChange = useCallback((version: number) => {
    if (revertToVersion) {
      revertToVersion(version);
    }
  }, [revertToVersion]);

  const handleRevertToVersion = useCallback((version: number) => {
    if (revertToVersion) {
      revertToVersion(version);
    }
  }, [revertToVersion]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const showArtifactPane = currentArtifact && isArtifactPanelOpen;

  return (
    <>
      <Flex 
        ref={containerRef}
        w="100%" 
        h="100vh" 
        pt={{ base: '70px', md: '0px' }} 
        position="relative"
        overflow="hidden"
      >
        {/* Chat Pane */}
        <Flex
          direction="column"
          w={showArtifactPane ? { base: '100%', lg: `${splitSize}%` } : '100%'}
          h="100%"
          maxW={showArtifactPane ? 'none' : '1000px'}
          mx={showArtifactPane ? '0' : 'auto'}
          position="relative"
          transition="width 0.3s ease"
        >
          
          <Flex
            direction="column"
            w="100%"
            h="100%"
            position="relative"
            zIndex={1}
          >
        <TokenCounter
          currentTokens={currentTokens}
          modelInfo={modelInfo}
          messagesCount={messages.length}
        />

        <Flex gap="10px" mb="10px" align="center" px="20px" flexWrap="wrap">
          <ModelSelector
            selectedModel={model}
            onModelChange={setModel}
          />
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        </Flex>

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
            streamingArtifactCode={streamingArtifactCode}
            messagesEndRef={messagesEndRef}
            currentArtifact={currentArtifact}
            isArtifactPanelOpen={isArtifactPanelOpen}
            onArtifactClick={handleArtifactClick}
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

          {inspectedCodeAttachment && (
            <InspectedCodePreview
              attachment={inspectedCodeAttachment}
              onRemove={handleRemoveInspectedCode}
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
            onAbort={abortRequest}
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

        {/* Resizable Divider */}
        {showArtifactPane && (
          <Box
            display={{ base: 'none', lg: 'block' }}
            w="4px"
            h="100%"
            bg={isDragging ? 'orange.400' : 'gray.300'}
            cursor="col-resize"
            onMouseDown={handleMouseDown}
            _hover={{ bg: 'orange.300' }}
            transition="background 0.2s"
            position="relative"
            zIndex={10}
          >
            <Box
              position="absolute"
              left="-4px"
              right="-4px"
              top="0"
              bottom="0"
            />
          </Box>
        )}

        {/* Artifact Workspace Pane */}
        {showArtifactPane && (
          <Box
            w={{ base: '100%', lg: `${100 - splitSize}%` }}
            h="100%"
            position={{ base: 'fixed', lg: 'relative' }}
            top={{ base: '70px', lg: '0' }}
            right={{ base: 0, lg: 'auto' }}
            bottom={{ base: 0, lg: 'auto' }}
            zIndex={{ base: 1000, lg: 1 }}
            display={isArtifactPanelOpen ? 'block' : 'none'}
          >
            <ArtifactErrorBoundary onReset={resetArtifacts}>
              <ArtifactWorkspace
                ref={artifactWorkspaceRef}
                artifact={currentArtifact}
                artifacts={artifacts}
                onClose={() => setIsArtifactPanelOpen(false)}
                onCodeAttach={handleCodeAttach}
                onClearInspection={handleRemoveInspectedCode}
                onVersionChange={handleVersionChange}
                onRevertToVersion={handleRevertToVersion}
                onArtifactSwitch={switchArtifact}
                onArtifactDelete={deleteArtifact}
                onDocumentChange={updateCurrentDocument}
                onSaveVersion={saveCurrentArtifactVersion}
              />
            </ArtifactErrorBoundary>
          </Box>
        )}
      </Flex>
    </>
  );
}

export default function Chat() {
  return (
    <ChatStateProvider>
      <Suspense fallback={<Flex w="100%" h="100vh" align="center" justify="center"><Text>Loading...</Text></Flex>}>
        <ChatContent />
      </Suspense>
    </ChatStateProvider>
  );
}

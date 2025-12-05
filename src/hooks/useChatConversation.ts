import { useState, useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { Message, Attachment, MistralModel, ArtifactData, ToolCall, InspectedCodeAttachment } from '@/types/types';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENTS_SIZE = 25 * 1024 * 1024;

async function fetchAttachmentWithSizeCheck(url: string, maxSize: number): Promise<Blob | null> {
  const response = await fetch(url);

  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return null;
  }

  const blob = await response.blob();
  if (blob.size > maxSize) {
    return null;
  }

  return blob;
}

export function useChatConversation() {
  const toast = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadConversation = useCallback(async (convId: string) => {
    setIsLoadingHistory(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/chat/messages?conversationId=${convId}`, {
        signal: abortControllerRef.current.signal,
      });
      if (response.ok) {
        const messagesData = await response.json();
        const formattedMessages = await Promise.all(
          messagesData.map(async (msg: any) => {
            const baseMessage: Message = {
              role: msg.role,
              content: msg.content,
              attachments: []
            };

            if (msg.attachments && msg.attachments.length > 0) {
              const content: any[] = [{ type: 'text', text: msg.content }];
              let totalSize = 0;

              const processedAttachments: { att: any; base64: string }[] = [];

              for (const att of msg.attachments) {
                if (totalSize >= MAX_TOTAL_ATTACHMENTS_SIZE) {
                  break;
                }

                const blob = await fetchAttachmentWithSizeCheck(att.cloudinaryUrl, MAX_ATTACHMENT_SIZE);
                if (!blob) {
                  continue;
                }

                totalSize += blob.size;
                if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
                  break;
                }

                const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                  };
                  reader.readAsDataURL(blob);
                });

                processedAttachments.push({ att, base64 });
              }

              processedAttachments.forEach(({ att, base64 }) => {
                if (att.type === 'image') {
                  content.push({
                    type: 'image_url',
                    image_url: `data:${att.mimeType};base64,${base64}`
                  });
                } else if (att.type === 'document') {
                  content.push({
                    type: 'document_url',
                    document_url: `data:${att.mimeType};base64,${base64}`
                  });
                }
              });

              baseMessage.content = content;
              baseMessage.attachments = msg.attachments;
            }

            if (msg.artifact) {
              baseMessage.artifact = msg.artifact as ArtifactData;
            }

            if (msg.toolCall) {
              baseMessage.toolCall = msg.toolCall as ToolCall;
            }

            if (msg.inspectedCodeAttachment) {
              baseMessage.inspectedCodeAttachment = msg.inspectedCodeAttachment as InspectedCodeAttachment;
            }

            return baseMessage;
          })
        );
        return formattedMessages;
      } else {
        toast({
          title: 'Failed to load conversation',
          description: 'Could not retrieve conversation history.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return null;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error loading conversation',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  const createNewConversation = async (firstMessage: string, model: MistralModel) => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, model }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setCurrentConversationId(conversation.id);
        window.history.pushState({}, '', `/chat?conversationId=${conversation.id}`);
        window.dispatchEvent(new CustomEvent('conversationUpdated'));
        return conversation.id;
      } else {
        const errorText = await response.text();
        console.error('Failed to create conversation:', errorText);
        toast({
          title: 'Failed to create conversation',
          description: 'Could not start a new conversation. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error creating conversation',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    return null;
  };

  const saveMessage = async (
    convId: string, 
    role: string, 
    content: string, 
    attachments?: Attachment[],
    artifact?: ArtifactData,
    toolCall?: ToolCall,
    inspectedCodeAttachment?: InspectedCodeAttachment
  ) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId: convId, 
          role, 
          content, 
          attachments,
          artifact,
          toolCall,
          inspectedCodeAttachment
        }),
      });

      if (!response.ok) {
        console.error('Failed to save message:', await response.text());
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  return {
    currentConversationId,
    setCurrentConversationId,
    isLoadingHistory,
    loadConversation,
    createNewConversation,
    saveMessage,
  };
}

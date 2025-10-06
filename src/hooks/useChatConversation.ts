import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Message, Attachment, MistralModel, ArtifactData, ToolCall, InspectedCodeAttachment } from '@/types/types';

export function useChatConversation() {
  const toast = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadConversation = useCallback(async (convId: string) => {
    setIsLoadingHistory(true);
    
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${convId}`);
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
              
              const attachmentPromises = msg.attachments.map(async (att: any) => {
                const fileResponse = await fetch(att.cloudinaryUrl);
                const blob = await fileResponse.blob();
                const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                  };
                  reader.readAsDataURL(blob);
                });
                return { att, base64 };
              });

              const attachmentResults = await Promise.all(attachmentPromises);
              
              attachmentResults.forEach(({ att, base64 }) => {
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


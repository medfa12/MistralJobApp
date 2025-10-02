'use client';

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBoxChat';
import { ChatBody, MistralModel, Message as MessageType, Attachment } from '@/types/types';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Img,
  Input,
  Text,
  useColorModeValue,
  useToast,
  Tooltip,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson, MdPsychology, MdExpandMore, MdExpandLess, MdImage, MdDescription, MdClose, MdAttachFile } from 'react-icons/md';
import Bg from '../../public/img/chat/bg-image.png';
import { useSearchParams, useRouter } from 'next/navigation';
import { MISTRAL_MODELS, getModelInfo, formatContextWindow, formatPricing } from '@/config/models';
import { ModelOverviewCard } from '@/components/ModelOverviewCard';

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams?.get('conversationId') || null;
  const toast = useToast();

  const [inputCode, setInputCode] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [model, setModel] = useState<MistralModel>('mistral-small-latest');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState<boolean>(false);
  const [hoveredModel, setHoveredModel] = useState<MistralModel | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | undefined>();
  const [attachments, setAttachments] = useState<Array<{ type: string; file: File; preview?: string }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  const getMessageText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(item => item.text || '').join(' ');
    }
    return '';
  };
  
  const getCurrentTokenCount = () => {
    let total = estimateTokens('You are Mistral AI...');
    messages.forEach(msg => {
      total += estimateTokens(getMessageText(msg.content));
    });
    total += estimateTokens(inputCode);
    return total;
  };

  const currentTokens = getCurrentTokenCount();
  const modelInfo = getModelInfo(model);
  const tokenPercentage = modelInfo ? (currentTokens / modelInfo.contextWindow) * 100 : 0;

  const loadConversation = useCallback(async (convId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${convId}`);
      if (response.ok) {
        const messagesData = await response.json();
        const formattedMessages = await Promise.all(
          messagesData.map(async (msg: any) => {
            if (msg.attachments && msg.attachments.length > 0) {
              const content: any[] = [{ type: 'text', text: msg.content }];
              
              for (const att of msg.attachments) {
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
              }

              return { role: msg.role, content, attachments: msg.attachments };
            }
            return { role: msg.role, content: msg.content, attachments: [] };
          })
        );
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
      setCurrentConversationId(conversationId);
    }
  }, [conversationId, loadConversation]);

  const createNewConversation = async (firstMessage: string) => {
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
        return conversation.id;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  const saveMessage = async (convId: string, role: string, content: string, attachments?: Attachment[]) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, role, content, attachments }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FFFAEB 0%, #FFF0C3 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const attachmentBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  
  const uploadToCloudinary = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/chat/upload-attachment', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleTranslate = async () => {
    let apiKey = localStorage.getItem('apiKey');
    const currentInput = inputCode.trim();

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
      return;
    }

    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a Mistral API key from https://console.mistral.ai/.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!currentInput) {
      toast({
        title: 'Message Required',
        description: 'Please enter your message.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let totalTokens = estimateTokens('You are Mistral AI...');
    messages.forEach(msg => {
      totalTokens += estimateTokens(getMessageText(msg.content));
    });
    totalTokens += estimateTokens(currentInput);

    const maxInputTokens = Math.floor(modelInfo.contextWindow * 0.8);
    
    if (totalTokens > maxInputTokens) {
      toast({
        title: 'Context Window Exceeded',
        description: `This conversation (≈${totalTokens.toLocaleString()} tokens) exceeds ${modelInfo.displayName}'s context limit of ${formatContextWindow(modelInfo.contextWindow)} tokens. Please start a new conversation or use a model with a larger context window.`,
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    const warningThreshold = Math.floor(modelInfo.contextWindow * 0.7);
    if (totalTokens > warningThreshold && totalTokens <= maxInputTokens) {
      toast({
        title: 'Approaching Context Limit',
        description: `You're using ≈${totalTokens.toLocaleString()} of ${formatContextWindow(modelInfo.contextWindow)} tokens (${Math.round((totalTokens / modelInfo.contextWindow) * 100)}%). Consider starting a new conversation soon.`,
        status: 'warning',
        duration: 6000,
        isClosable: true,
        position: 'top',
      });
    }

    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation(currentInput);
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

    let userMessageContent: any = currentInput;
    let uploadedAttachments: Attachment[] = [];
    
    if (attachments.length > 0) {
      const contentArray: any[] = [{ type: 'text', text: currentInput }];
      
      for (const attachment of attachments) {
        try {
          const uploadResult = await uploadToCloudinary(attachment.file, attachment.type);
          
          uploadedAttachments.push({
            type: uploadResult.type,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            mimeType: uploadResult.mimeType,
            cloudinaryPublicId: uploadResult.cloudinaryPublicId,
            cloudinaryUrl: uploadResult.cloudinaryUrl,
          });

          const base64 = await fileToBase64(attachment.file);
          if (attachment.type === 'image') {
            const mimeType = attachment.file.type;
            contentArray.push({
              type: 'image_url',
              image_url: `data:${mimeType};base64,${base64}`
            });
          } else if (attachment.type === 'document') {
            contentArray.push({
              type: 'document_url',
              document_url: `data:application/pdf;base64,${base64}`
            });
          }
        } catch (error) {
          console.error('Error uploading attachment:', error);
          toast({
            title: 'Upload Error',
            description: `Failed to upload ${attachment.file.name}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
          setLoading(false);
          return;
        }
      }
      
      userMessageContent = contentArray;
    }

    const userMessage: MessageType = { 
      role: 'user', 
      content: userMessageContent,
      attachments: uploadedAttachments
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputCode('');
    setStreamingMessage('');
    setLoading(true);

    const currentAttachments = [...attachments];
    setAttachments([]);
    currentAttachments.forEach(att => {
      if (att.preview) {
        URL.revokeObjectURL(att.preview);
      }
    });

    await saveMessage(convId, 'user', getMessageText(userMessageContent), uploadedAttachments);

    const controller = new AbortController();
    
    const apiMessages = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const body: ChatBody = {
      messages: apiMessages,
      model,
      apiKey,
    };

    try {
      const response = await fetch('../api/chatAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setLoading(false);
        const errorText = await response.text();
        let errorMessage = 'Something went wrong when fetching from the API. Make sure to use a valid API key.';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
        }
        
        toast({
          title: 'API Error',
          description: errorMessage,
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      const data = response.body;

      if (!data) {
        setLoading(false);
        toast({
          title: 'Error',
          description: 'No response data received from the API.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;
        setStreamingMessage(accumulatedResponse);
      }

      const assistantMessage: MessageType = { role: 'assistant', content: accumulatedResponse };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');
      setLoading(false);

      if (convId) {
        await saveMessage(convId, 'assistant', getMessageText(accumulatedResponse));
      }
    } catch (error) {
      setLoading(false);
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
  };

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setStreamingMessage('');
    setCurrentConversationId(null);
    router.push('/chat');
  };

  const handleModelHover = (modelId: MistralModel, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    };
    setHoverPosition(position);
    setHoveredModel(modelId);
  };

  const handleModelLeave = () => {
    setHoveredModel(null);
  };

  return (
    <Flex
      w="100%"
      h="100vh"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
    >
      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
        opacity={messages.length === 0 ? 1 : 0.3}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        h="100%"
        maxW="1000px"
      >
        <Flex direction={'column'} w="100%" mb="10px" flexShrink={0}>
          <Flex
            mx="auto"
            zIndex="2"
            w="100%"
            maxW="1000px"
            mb="10px"
            align="center"
            justify="space-between"
            flexWrap="wrap"
            gap="10px"
          >
            <Flex direction="column" align="flex-start">
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="600"
              >
                Selected: {getModelInfo(model)?.displayName || model}
              </Text>
              {messages.length > 0 && modelInfo && (
                <Text
                  color={tokenPercentage > 70 ? 'orange.500' : tokenPercentage > 50 ? 'yellow.600' : gray}
                  fontSize="xs"
                  fontWeight="500"
                >
                  {currentTokens.toLocaleString()} / {formatContextWindow(modelInfo.contextWindow)} tokens ({Math.round(tokenPercentage)}%)
                </Text>
              )}
            </Flex>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              rightIcon={<Icon as={isModelSelectorOpen ? MdExpandLess : MdExpandMore} />}
              color={textColor}
            >
              {isModelSelectorOpen ? 'Hide Models' : 'Change Model'}
            </Button>
          </Flex>
          <Collapse in={isModelSelectorOpen} animateOpacity>
            <Box position="relative">
              <Flex
                mx="auto"
                zIndex="2"
                w="max-content"
                mb="20px"
                borderRadius="60px"
                flexWrap="wrap"
                gap="10px"
              >
                <Flex
                  cursor={'pointer'}
                  transition="0.3s"
                  justify={'center'}
                  align="center"
                  bg={model === 'mistral-small-latest' ? buttonBg : 'transparent'}
                  w="174px"
                  h="70px"
                  boxShadow={model === 'mistral-small-latest' ? buttonShadow : 'none'}
                  borderRadius="14px"
                  color={textColor}
                  fontSize="18px"
                  fontWeight={'700'}
                  onClick={() => setModel('mistral-small-latest')}
                  onMouseEnter={(e) => handleModelHover('mistral-small-latest', e)}
                  onMouseLeave={handleModelLeave}
                  ref={(el) => (modelButtonRefs.current['mistral-small-latest'] = el)}
                >
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={bgIcon}
                    me="10px"
                    h="39px"
                    w="39px"
                  >
                    <Icon
                      as={MdAutoAwesome}
                      width="20px"
                      height="20px"
                      color={iconColor}
                    />
                  </Flex>
                  Mistral Small
                </Flex>
                <Flex
                  cursor={'pointer'}
                  transition="0.3s"
                  justify={'center'}
                  align="center"
                  bg={model === 'mistral-large-latest' ? buttonBg : 'transparent'}
                  w="164px"
                  h="70px"
                  boxShadow={model === 'mistral-large-latest' ? buttonShadow : 'none'}
                  borderRadius="14px"
                  color={textColor}
                  fontSize="18px"
                  fontWeight={'700'}
                  onClick={() => setModel('mistral-large-latest')}
                  onMouseEnter={(e) => handleModelHover('mistral-large-latest', e)}
                  onMouseLeave={handleModelLeave}
                  ref={(el) => (modelButtonRefs.current['mistral-large-latest'] = el)}
                >
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={bgIcon}
                    me="10px"
                    h="39px"
                    w="39px"
                  >
                    <Icon
                      as={MdBolt}
                      width="20px"
                      height="20px"
                      color={iconColor}
                    />
                  </Flex>
                  Mistral Large
                </Flex>
                <Flex
                  cursor={'pointer'}
                  transition="0.3s"
                  justify={'center'}
                  align="center"
                  bg={model === 'magistral-small-latest' ? buttonBg : 'transparent'}
                  w="200px"
                  h="70px"
                  boxShadow={model === 'magistral-small-latest' ? buttonShadow : 'none'}
                  borderRadius="14px"
                  color={textColor}
                  fontSize="18px"
                  fontWeight={'700'}
                  onClick={() => setModel('magistral-small-latest')}
                  onMouseEnter={(e) => handleModelHover('magistral-small-latest', e)}
                  onMouseLeave={handleModelLeave}
                  ref={(el) => (modelButtonRefs.current['magistral-small-latest'] = el)}
                >
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={bgIcon}
                    me="10px"
                    h="39px"
                    w="39px"
                  >
                    <Icon
                      as={MdPsychology}
                      width="20px"
                      height="20px"
                      color={iconColor}
                    />
                  </Flex>
                  Magistral Small
                </Flex>
                <Flex
                  cursor={'pointer'}
                  transition="0.3s"
                  justify={'center'}
                  align="center"
                  bg={model === 'magistral-medium-latest' ? buttonBg : 'transparent'}
                  w="220px"
                  h="70px"
                  boxShadow={model === 'magistral-medium-latest' ? buttonShadow : 'none'}
                  borderRadius="14px"
                  color={textColor}
                  fontSize="18px"
                  fontWeight={'700'}
                  onClick={() => setModel('magistral-medium-latest')}
                  onMouseEnter={(e) => handleModelHover('magistral-medium-latest', e)}
                  onMouseLeave={handleModelLeave}
                  ref={(el) => (modelButtonRefs.current['magistral-medium-latest'] = el)}
                >
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={bgIcon}
                    me="10px"
                    h="39px"
                    w="39px"
                  >
                    <Icon
                      as={MdPsychology}
                      width="20px"
                      height="20px"
                      color={iconColor}
                    />
                  </Flex>
                  Magistral Medium
                </Flex>
              </Flex>
              {hoveredModel && MISTRAL_MODELS[hoveredModel] && (
                <ModelOverviewCard
                  model={MISTRAL_MODELS[hoveredModel]}
                  isVisible={!!hoveredModel}
                  position={hoverPosition}
                />
              )}
            </Box>
          </Collapse>

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
          {messages.map((message, index) => (
            <Flex
              key={index}
              w="100%"
              mb="20px"
              direction="column"
            >
              {message.role === 'user' ? (
                <Flex w="100%" align={'center'}>
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={'transparent'}
                    border="1px solid"
                    borderColor={borderColor}
                    me="20px"
                    h="40px"
                    minH="40px"
                    minW="40px"
                  >
                    <Icon
                      as={MdPerson}
                      width="20px"
                      height="20px"
                      color={brandColor}
                    />
                  </Flex>
                  <Flex
                    p="22px"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="14px"
                    w="100%"
                    zIndex={'2'}
                  >
                    <Text
                      color={textColor}
                      fontWeight="600"
                      fontSize={{ base: 'sm', md: 'md' }}
                      lineHeight={{ base: '24px', md: '26px' }}
                    >
                      {getMessageText(message.content)}
                    </Text>
                  </Flex>
                </Flex>
              ) : (
                <Flex w="100%" align="flex-start">
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)'}
                    me="20px"
                    h="40px"
                    minH="40px"
                    minW="40px"
                  >
                    <Icon
                      as={MdAutoAwesome}
                      width="20px"
                      height="20px"
                      color="white"
                    />
                  </Flex>
                  <Box w="100%">
                    <MessageBoxChat 
                      output={getMessageText(message.content)} 
                      attachments={message.attachments}
                    />
                  </Box>
                </Flex>
              )}
            </Flex>
          ))}
          {streamingMessage && (
            <Flex w="100%" align="flex-start">
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg={'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)'}
                me="20px"
                h="40px"
                minH="40px"
                minW="40px"
              >
                <Icon
                  as={MdAutoAwesome}
                  width="20px"
                  height="20px"
                  color="white"
                />
              </Flex>
              <Box w="100%">
                <MessageBoxChat output={streamingMessage} />
              </Box>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </Flex>
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          mt="20px"
          mb="10px"
          flexShrink={0}
          direction="column"
          gap="10px"
        >
          {modelInfo && modelInfo.supportedAttachments.length > 0 && (
            <Flex gap="8px" align="center" flexWrap="wrap">
              <Icon as={MdAttachFile} color={textColor} boxSize="18px" />
              {modelInfo.supportedAttachments.includes('image') && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Icon as={MdImage} />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const preview = URL.createObjectURL(file);
                        setAttachments([...attachments, { type: 'image', file, preview }]);
                      }
                    };
                    input.click();
                  }}
                >
                  Image
                </Button>
              )}
              {modelInfo.supportedAttachments.includes('document') && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Icon as={MdDescription} />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'application/pdf';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setAttachments([...attachments, { type: 'document', file }]);
                      }
                    };
                    input.click();
                  }}
                >
                  PDF
                </Button>
              )}
              {attachments.length > 0 && (
                <Text fontSize="xs" color={textColor} ml="auto">
                  {attachments.length} file(s) attached
                </Text>
              )}
            </Flex>
          )}

          {attachments.length > 0 && (
            <Flex gap="8px" flexWrap="wrap">
              {attachments.map((attachment, index) => (
                <Flex
                  key={index}
                  bg={attachmentBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  p="8px"
                  align="center"
                  gap="8px"
                >
                  {attachment.preview ? (
                    <Box
                      as="img"
                      src={attachment.preview}
                      alt={attachment.file.name}
                      w="40px"
                      h="40px"
                      objectFit="cover"
                      borderRadius="4px"
                    />
                  ) : (
                    <Icon as={MdDescription} boxSize="20px" color={textColor} />
                  )}
                  <Box flex="1" minW="0">
                    <Text fontSize="xs" color={textColor} noOfLines={1}>
                      {attachment.file.name}
                    </Text>
                    <Text fontSize="xs" color={gray}>
                      {(attachment.file.size / 1024).toFixed(1)} KB
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Remove"
                    icon={<Icon as={MdClose} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      if (attachment.preview) {
                        URL.revokeObjectURL(attachment.preview);
                      }
                      setAttachments(attachments.filter((_, i) => i !== index));
                    }}
                  />
                </Flex>
              ))}
            </Flex>
          )}

          <Flex gap="10px">
              <Input
                minH="54px"
                h="100%"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="45px"
                p="15px 20px"
                me="10px"
                fontSize="sm"
                fontWeight="500"
                _focus={{ borderColor: 'none' }}
                color={inputColor}
                _placeholder={placeholderColor}
                placeholder="Type your message here..."
                value={inputCode}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="primary"
                py="20px"
                px="16px"
                fontSize="sm"
                borderRadius="45px"
                ms="auto"
                w={{ base: '160px', md: '210px' }}
                h="54px"
                _hover={{
                  boxShadow:
                    '0px 21px 27px -10px rgba(250, 80, 15, 0.48) !important',
                  bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%) !important',
                  _disabled: {
                    bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)',
                  },
                }}
                onClick={handleTranslate}
                isLoading={loading ? true : false}
              >
                Submit
              </Button>
            </Flex>
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
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<Flex w="100%" h="100vh" align="center" justify="center"><Text>Loading...</Text></Flex>}>
      <ChatContent />
    </Suspense>
  );
}

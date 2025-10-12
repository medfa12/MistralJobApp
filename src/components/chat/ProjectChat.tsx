'use client';

import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
  Button,
  IconButton,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import MessageBlock from './MessageBlock';
import { IoPaperPlane } from 'react-icons/io5';
import { MdTagFaces } from 'react-icons/md';

interface Message {
  id: string;
  content: string;
  side: 'left' | 'right';
  time: string;
  seen?: boolean;
}

interface ProjectChatProps {
  projectId: string;
  projectName: string;
}

export default function ProjectChat({
  projectId,
  projectName,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const inputColor = useColorModeValue('secondaryGray.700', 'secondaryGray.700');
  const inputText = useColorModeValue('gray.700', 'gray.100');
  const blockBg = useColorModeValue('secondaryGray.300', 'navy.700');
  const brandButton = useColorModeValue('brand.500', 'brand.400');
  const bgInput = useColorModeValue(
    'linear-gradient(1.02deg, #FFFFFF 49.52%, rgba(255, 255, 255, 0) 99.07%)',
    'linear-gradient(1.02deg, #111C44 49.52%, rgba(17, 28, 68, 0) 99.07%)',
  );
  const borderColor = useColorModeValue('secondaryGray.400', 'whiteAlpha.100');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      side: 'right',
      time: getCurrentTime(),
      seen: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const storedApiKey = typeof window !== 'undefined'
        ? localStorage.getItem('apiKey') || ''
        : '';

      if (!storedApiKey) {
        throw new Error('API key is required. Please set your Mistral API key in settings.');
      }

      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mistral-api-key': storedApiKey,
        },
        body: JSON.stringify({
          message: messageContent,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to get response: ${response.status} - ${errorData}`);
      }

      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = '';

      const aiMessageId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  aiMessageContent += content;

                  setMessages((prev) => {
                    const filtered = prev.filter((msg) => msg.id !== aiMessageId);
                    return [
                      ...filtered,
                      {
                        id: aiMessageId,
                        content: aiMessageContent,
                        side: 'left',
                        time: getCurrentTime(),
                      },
                    ];
                  });
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Sorry, I encountered an error. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `Error: ${errorMessage}`,
          side: 'left',
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputValue('');
    setConversationId(null);
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Flex
        px="34px"
        py="20px"
        borderBottom="1px solid"
        borderColor={borderColor}
        align="center"
        justify="space-between"
      >
        <Box>
          <Text
            color={textColor}
            fontSize={{ base: 'md', md: 'xl' }}
            fontWeight="700"
          >
            {projectName}
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
            Chat with your documents
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          onClick={handleNewConversation}
          isDisabled={messages.length === 0}
        >
          New Conversation
        </Button>
      </Flex>

      <Box
        flex="1"
        overflow="auto"
        px={{ base: '10px', md: '20px' }}
        py="20px"
        position="relative"
      >
        {messages.length === 0 ? (
          <Flex
            h="100%"
            align="center"
            justify="center"
            direction="column"
            color="gray.500"
          >
            <Text fontSize="lg" fontWeight="600" mb="10px">
              Start a conversation
            </Text>
            <Text fontSize="sm" textAlign="center" mb="10px">
              Ask questions about your documents in {projectName}
            </Text>
            <Text fontSize="xs" textAlign="center" color="gray.400" maxW="400px">
              Powered by Mistral RAG - Your uploaded documents will be automatically searched
            </Text>
          </Flex>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Flex
                key={msg.id}
                justify={msg.side === 'right' ? 'flex-end' : 'flex-start'}
                mb="10px"
              >
                <MessageBlock
                  content={msg.content}
                  time={msg.time}
                  side={msg.side}
                  seen={msg.seen}
                  isLast={index === messages.length - 1}
                />
              </Flex>
            ))}
            {isLoading && (
              <Flex justify="flex-start" mb="10px">
                <Flex
                  bg={blockBg}
                  borderRadius="0px 20px 20px 20px"
                  px="24px"
                  py="16px"
                  align="center"
                  gap="10px"
                >
                  <Spinner size="sm" />
                  <Text color={textColor}>Thinking...</Text>
                </Flex>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Box
        bg={bgInput}
        backdropFilter="blur(20px)"
        px={{ base: '10px', md: '20px' }}
        py="15px"
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <Flex align="center">
          <InputGroup flex="1" me="10px">
            <InputLeftElement h="50px">
              <IconButton
                aria-label="emoji"
                h="max-content"
                w="max-content"
                bg="inherit"
                borderRadius="inherit"
                _hover={{ bg: 'none' }}
                _active={{
                  bg: 'inherit',
                  transform: 'none',
                  borderColor: 'transparent',
                }}
                _focus={{
                  boxShadow: 'none',
                }}
                icon={<Icon as={MdTagFaces} color={inputColor} w="20px" h="20px" />}
              />
            </InputLeftElement>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="search"
              fontSize="md"
              pl="50px"
              h="50px"
              bg={blockBg}
              color={inputText}
              fontWeight="500"
              _placeholder={{ color: 'gray.400', fontSize: '14px' }}
              borderRadius="45px"
              placeholder="Ask about your documents..."
              disabled={isLoading}
            />
          </InputGroup>

          <Button
            onClick={handleSendMessage}
            isDisabled={!inputValue.trim() || isLoading}
            borderRadius="50%"
            bg={brandButton}
            w="50px"
            h="50px"
            minW="50px"
            minH="50px"
            variant="no-hover"
            _hover={{ opacity: 0.8 }}
          >
            <Icon as={IoPaperPlane} color="white" w="18px" h="18px" />
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

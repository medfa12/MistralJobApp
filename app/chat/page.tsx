'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBoxChat';
import { ChatBody, MistralModel, Message as MessageType } from '@/types/types';
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
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson, MdPsychology } from 'react-icons/md';
import Bg from '../../public/img/chat/bg-image.png';
import { useSearchParams, useRouter } from 'next/navigation';

// Using MessageType from types.ts

export default function Chat() {
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams?.get('conversationId') || null;

  // Input States
  const [inputCode, setInputCode] = useState<string>('');
  // Conversation history
  const [messages, setMessages] = useState<MessageType[]>([]);
  // Current streaming response
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  // ChatGPT model
  const [model, setModel] = useState<MistralModel>('mistral-small-latest');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  // Current conversation ID
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
      setCurrentConversationId(conversationId);
    }
  }, [conversationId]);

  // Load conversation from database
  const loadConversation = async (convId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${convId}`);
      if (response.ok) {
        const messagesData = await response.json();
        const formattedMessages = messagesData.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Create new conversation
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
        // Update URL without reloading
        window.history.pushState({}, '', `/chat?conversationId=${conversation.id}`);
        return conversation.id;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  // Save message to database
  const saveMessage = async (convId: string, role: string, content: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, role, content }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // API Key
  // const [apiKey, setApiKey] = useState<string>(apiKeyApp);
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
  const handleTranslate = async () => {
    let apiKey = localStorage.getItem('apiKey');
    const currentInput = inputCode.trim();

    // Chat post conditions(maximum number of characters, valid message etc.)
    const maxCodeLength = 4000;

    if (!apiKey) {
      alert('Please enter a Mistral API key from https://console.mistral.ai/.');
      return;
    }

    if (!currentInput) {
      alert('Please enter your message.');
      return;
    }

    if (currentInput.length > maxCodeLength) {
      alert(
      `Please enter a prompt shorter than ${maxCodeLength} characters. You are currently at ${currentInput.length} characters.`,
      );
      return;
    }

    // Create new conversation if not exists
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation(currentInput);
      if (!convId) {
        alert('Failed to create conversation');
        return;
      }
    }

    // Add user message to history
    const userMessage: MessageType = { role: 'user', content: currentInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputCode('');
    setStreamingMessage('');
    setLoading(true);

    // Save user message to database
    await saveMessage(convId, 'user', currentInput);

    const controller = new AbortController();
    const body: ChatBody = {
      messages: updatedMessages, // Send full conversation history
      model,
      // *** Initializing apiKey with .env.local/ .env value :
      // just remove the `apiKey` variable below
      apiKey,
    };

    // -------------- Fetch --------------
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
        alert(
          'Something went wrong when fetching from the API. Make sure to use a valid API key.',
        );
        return;
      }

      const data = response.body;

      if (!data) {
        setLoading(false);
        alert('Something went wrong');
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

      // Add assistant message to history
      const assistantMessage: MessageType = { role: 'assistant', content: accumulatedResponse };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');
      setLoading(false);

      // Save assistant message to database
      if (convId) {
        await saveMessage(convId, 'assistant', accumulatedResponse);
      }
    } catch (error) {
      setLoading(false);
      alert('An error occurred. Please try again.');
    }
  };
  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //   const el = document.createElement('textarea');
  //   el.value = text;
  //   document.body.appendChild(el);
  //   el.select();
  //   document.execCommand('copy');
  //   document.body.removeChild(el);
  // };

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  // Start new conversation (called when plus button is clicked)
  const startNewConversation = () => {
    setMessages([]);
    setStreamingMessage('');
    setCurrentConversationId(null);
    router.push('/chat');
  };

  return (
    <Flex
      w="100%"
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
        minH={{ base: '75vh', '2xl': '85vh' }}
        maxW="1000px"
      >
        {/* Model Change */}
        <Flex direction={'column'} w="100%" mb={messages.length > 0 ? '20px' : 'auto'}>
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

        </Flex>
        {/* Conversation History */}
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          mb={'auto'}
          overflowY="auto"
          maxH="calc(100vh - 350px)"
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
                      {message.content}
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
                    <MessageBoxChat output={message.content} />
                  </Box>
                </Flex>
              )}
            </Flex>
          ))}
          {/* Streaming Message */}
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
        {/* Chat Input */}
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          mt="20px"
          justifySelf={'flex-end'}
        >
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

        <Flex
          justify="center"
          mt="20px"
          direction={{ base: 'column', md: 'row' }}
          alignItems="center"
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

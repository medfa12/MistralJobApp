'use client';

import { Ref } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdPerson, MdAutoAwesome, MdDescription } from 'react-icons/md';
import { Message as MessageType } from '@/types/types';
import MessageBoxChat from '@/components/MessageBoxChat';
import { ArtifactLoadingCard } from '@/components/ArtifactLoadingCard';
import { getMessageText } from '@/utils/messageHelpers';

interface ChatMessagesProps {
  messages: MessageType[];
  streamingMessage: string;
  isGeneratingArtifact: boolean;
  artifactLoadingInfo: { operation: string; title?: string } | null;
  messagesEndRef: Ref<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  isGeneratingArtifact,
  artifactLoadingInfo,
  messagesEndRef,
}) => {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const brandColor = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const attachmentBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');

  return (
    <>
      {messages.map((message, index) => (
        <Flex key={index} w="100%" mb="20px" direction="column">
          {message.role === 'user' ? (
            <Flex w="100%" align="flex-start">
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg="transparent"
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
              <Flex direction="column" w="100%" gap="10px">
                {message.attachments && message.attachments.length > 0 && (
                  <Flex gap="8px" flexWrap="wrap">
                    {message.attachments.map((attachment, idx) => (
                      <Box key={idx}>
                        {attachment.type === 'image' ? (
                          <Box
                            borderRadius="12px"
                            overflow="hidden"
                            border="1px solid"
                            borderColor={borderColor}
                            cursor="pointer"
                            onClick={() => window.open(attachment.cloudinaryUrl, '_blank')}
                            _hover={{ opacity: 0.8 }}
                            transition="opacity 0.2s"
                            maxW="200px"
                          >
                            <Image
                              src={attachment.cloudinaryUrl}
                              alt={attachment.fileName}
                              w="100%"
                              h="150px"
                              objectFit="cover"
                            />
                          </Box>
                        ) : (
                          <Flex
                            p="10px"
                            bg={attachmentBg}
                            borderRadius="12px"
                            border="1px solid"
                            borderColor={borderColor}
                            align="center"
                            gap="8px"
                            cursor="pointer"
                            onClick={() => window.open(attachment.cloudinaryUrl, '_blank')}
                            _hover={{ opacity: 0.8 }}
                            transition="opacity 0.2s"
                            maxW="250px"
                          >
                            <Icon as={MdDescription} boxSize="24px" color="orange.500" />
                            <Box flex="1" minW="0">
                              <Text fontSize="xs" color={textColor} noOfLines={1} fontWeight="600">
                                {attachment.fileName}
                              </Text>
                              <Text fontSize="xs" color={gray}>
                                {(attachment.fileSize / 1024).toFixed(1)} KB
                              </Text>
                            </Box>
                          </Flex>
                        )}
                      </Box>
                    ))}
                  </Flex>
                )}
                <Flex
                  p="22px"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  w="100%"
                  zIndex="2"
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
            </Flex>
          ) : (
            <Flex w="100%" align="flex-start">
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
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
                  toolCall={message.toolCall}
                />
              </Box>
            </Flex>
          )}
        </Flex>
      ))}

      {isGeneratingArtifact && artifactLoadingInfo && (
        <Flex w="100%" align="flex-start">
          <Flex
            borderRadius="full"
            justify="center"
            align="center"
            bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
            me="20px"
            h="40px"
            minH="40px"
            minW="40px"
          >
            <Icon as={MdAutoAwesome} width="20px" height="20px" color="white" />
          </Flex>
          <Box w="100%">
            <ArtifactLoadingCard 
              operation={artifactLoadingInfo.operation}
              title={artifactLoadingInfo.title}
            />
          </Box>
        </Flex>
      )}

      {streamingMessage && !isGeneratingArtifact && (
        <Flex w="100%" align="flex-start">
          <Flex
            borderRadius="full"
            justify="center"
            align="center"
            bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
            me="20px"
            h="40px"
            minH="40px"
            minW="40px"
          >
            <Icon as={MdAutoAwesome} width="20px" height="20px" color="white" />
          </Flex>
          <Box w="100%">
            <MessageBoxChat output={streamingMessage} />
          </Box>
        </Flex>
      )}

      <div ref={messagesEndRef} />
    </>
  );
};


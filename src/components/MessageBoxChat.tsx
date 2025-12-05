'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useColorModeValue, Box, Text, Flex, Icon, Image, SimpleGrid, Badge, Collapse, Button } from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { useState, useEffect, Fragment } from 'react';
import { MdDescription, MdCode } from 'react-icons/md';
import { Attachment, ToolCall, ArtifactData, InspectedCodeAttachment } from '@/types/types';
import ToolCallBox from '@/components/ToolCallBox';
import CodeSnippet from '@/components/CodeSnippet';
import { processLatex } from '@/utils/latexProcessor';
import { ArtifactToggleButton } from '@/components/artifact';
import { useChatState } from '@/contexts/ChatStateContext';
import { MessageTokenBadge } from '@/components/chat/MessageTokenBadge';

export default function MessageBox(props: {
  output: string;
  attachments?: Attachment[];
  toolCall?: ToolCall;
  artifact?: ArtifactData;
  inspectedCodeAttachment?: InspectedCodeAttachment;
  onArtifactClick?: () => void;
  isArtifactOpen?: boolean;
  messageIndex?: number;
  metrics?: {
    tokens: number;
    time: number;
    speed: number;
  };
}) {
  const { output, attachments, toolCall, artifact, inspectedCodeAttachment, onArtifactClick, isArtifactOpen, messageIndex, metrics } = props
  const textColor = useColorModeValue('navy.700', 'white')
  const thinkingBg = useColorModeValue('orange.50', 'whiteAlpha.100')
  const thinkingBorder = useColorModeValue('orange.200', 'orange.500')
  const inspectedCodeBg = useColorModeValue('purple.50', 'purple.900')
  const inspectedCodeBorder = useColorModeValue('purple.300', 'purple.600')
  const [thinking, setThinking] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')

  const { thinkingExpanded, toggleThinking } = useChatState()
  const isExpanded = messageIndex !== undefined ? thinkingExpanded[messageIndex] : false

  const extractCodeSnippets = (text: string): { text: string; snippets: Array<{ language: string; code: string; index: number }> } => {
    const snippets: Array<{ language: string; code: string; index: number }> = [];
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    let match;
    let processedText = text;
    let index = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [fullMatch, language, code] = match;
      const supportedLanguages = ['python', 'rust', 'svelte', 'go', 'java', 'c', 'cpp', 'ruby', 'php', 'sql', 'kotlin', 'swift'];

      if (supportedLanguages.includes(language.toLowerCase())) {
        snippets.push({ language, code: code.trim(), index });
        processedText = processedText.replace(fullMatch, `__CODE_SNIPPET_${index}__`);
        index++;
      }
    }

    return { text: processedText, snippets };
  };

  useEffect(() => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const artifactRegex = /<artifact[^>]*>[\s\S]*?<\/artifact>/g;
    let processedOutput = output;

    processedOutput = processedOutput.replace(artifactRegex, '');

    const matches = processedOutput.match(thinkRegex);

    if (matches && matches.length > 0) {
      const thinkingContent = matches
        .map(match => match.replace(/<\/?think>/g, ''))
        .join('\n\n');
      setThinking(processLatex(thinkingContent));

      const cleanAnswer = processedOutput.replace(thinkRegex, '').trim();
      setAnswer(processLatex(cleanAnswer));
    } else {
      setThinking('');
      setAnswer(processLatex(processedOutput));
    }
  }, [output]);

  const attachmentBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const attachmentBorder = useColorModeValue('gray.200', 'whiteAlpha.200');

  const imageCount = attachments?.filter(a => a.type === 'image').length || 0;
  const documentCount = attachments?.filter(a => a.type === 'document').length || 0;

  return (
    <Card
      display={(output || inspectedCodeAttachment || thinking) ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      minH="auto"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
      flexDirection="column"
    >
      <Flex justify="flex-end" mb="10px">
        <MessageTokenBadge
          content={output}
          hasAttachments={(attachments && attachments.length > 0) || !!inspectedCodeAttachment}
          imageCount={imageCount}
          documentCount={documentCount}
          metrics={metrics}
        />
      </Flex>
      {attachments && attachments.length > 0 && (
        <Box mb="20px">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="12px">
            {attachments.map((attachment, index) => (
              <Box key={index}>
                {attachment.type === 'image' ? (
                  <Box
                    borderRadius="12px"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={attachmentBorder}
                    cursor="pointer"
                    onClick={() => window.open(attachment.cloudinaryUrl, '_blank')}
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                  >
                    <Image
                      src={attachment.cloudinaryUrl}
                      alt={attachment.fileName}
                      w="100%"
                      h="200px"
                      objectFit="cover"
                    />
                    <Text
                      fontSize="xs"
                      color={textColor}
                      p="8px"
                      bg={attachmentBg}
                      noOfLines={1}
                    >
                      {attachment.fileName}
                    </Text>
                  </Box>
                ) : (
                  <Flex
                    p="12px"
                    bg={attachmentBg}
                    borderRadius="12px"
                    border="1px solid"
                    borderColor={attachmentBorder}
                    align="center"
                    gap="10px"
                    cursor="pointer"
                    onClick={() => window.open(attachment.cloudinaryUrl, '_blank')}
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                  >
                    <Icon as={MdDescription} boxSize="32px" color="orange.500" />
                    <Box flex="1" minW="0">
                      <Text fontSize="sm" color={textColor} noOfLines={1} fontWeight="600">
                        {attachment.fileName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </Text>
                    </Box>
                  </Flex>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {inspectedCodeAttachment && (
        <Box mb="20px">
          <Flex
            bg={inspectedCodeBg}
            border="2px solid"
            borderColor={inspectedCodeBorder}
            borderRadius="12px"
            p={4}
            direction="column"
            gap={3}
          >
            <Flex align="center" gap={2} flexWrap="wrap">
              <Icon as={MdCode} boxSize={5} color="purple.500" />
              <Text fontWeight="bold" fontSize="sm" color={textColor}>
                Inspected Element: &lt;{inspectedCodeAttachment.elementTag}&gt;
                {inspectedCodeAttachment.elementId && ` #${inspectedCodeAttachment.elementId}`}
                {inspectedCodeAttachment.elementClasses && ` .${inspectedCodeAttachment.elementClasses.split(' ')[0]}`}
              </Text>
              <Badge colorScheme="purple" ml="auto">
                {inspectedCodeAttachment.sourceArtifactId}
              </Badge>
            </Flex>
            <CodeSnippet 
              code={inspectedCodeAttachment.code}
              language={inspectedCodeAttachment.sourceArtifactId.includes('react') ? 'jsx' : 'html'}
              title="Inspected Code"
            />
            {inspectedCodeAttachment.styles && (
              <Text fontSize="xs" color="gray.500">
                <strong>Computed Styles:</strong> {inspectedCodeAttachment.styles}
              </Text>
            )}
          </Flex>
        </Box>
      )}

      {toolCall && (
        <ToolCallBox 
          operation={toolCall.operation}
          artifactType={toolCall.artifactType}
          artifactTitle={toolCall.artifactTitle}
          revertToVersion={toolCall.revertToVersion}
        />
      )}

      {artifact && onArtifactClick && (
        <Box mb="10px">
          <ArtifactToggleButton
            artifact={artifact}
            isOpen={isArtifactOpen || false}
            onClick={onArtifactClick}
          />
        </Box>
      )}

      {thinking && (
        <Box
          mb="20px"
          borderRadius="14px"
          border="1px solid"
          borderColor={thinkingBorder}
          bgGradient="linear(to-r, orange.50, orange.100)"
          _dark={{ bgGradient: 'linear(to-r, whiteAlpha.100, orange.900)' }}
          p={4}
        >
          <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
            <Flex align="center" gap={3}>
              <Box
                w="40px"
                h="40px"
                borderRadius="full"
                display="grid"
                placeItems="center"
                bg="orange.500"
                color="white"
                fontWeight="700"
              >
                🧠
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="md" color={textColor}>
                  Thinking Trace
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Transparent reasoning — open to inspect, hidden by default.
                </Text>
              </Box>
            </Flex>
            <Button
              size="sm"
              variant="outline"
              colorScheme="orange"
              onClick={() => messageIndex !== undefined && toggleThinking(messageIndex)}
            >
              {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
            </Button>
          </Flex>
          <Collapse in={isExpanded} animateOpacity>
            <Box
              mt="12px"
              borderRadius="12px"
              border="1px solid"
              borderColor={thinkingBorder}
              bg={thinkingBg}
              p={3}
            >
              <ReactMarkdown
                className="font-medium"
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {thinking}
              </ReactMarkdown>
            </Box>
          </Collapse>
        </Box>
      )}

      {(() => {
        const { text: processedText, snippets } = extractCodeSnippets(answer);
        let renderedText = processedText;

        return (
          <>
            {snippets.map((snippet, idx) => {
              const placeholder = `__CODE_SNIPPET_${idx}__`;
              const parts = renderedText.split(placeholder);
              if (parts.length > 1) {
                renderedText = parts.slice(1).join(placeholder);
                return (
                  <Fragment key={idx}>
                    <ReactMarkdown
                      className="font-medium"
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {parts[0]}
                    </ReactMarkdown>
                    <CodeSnippet
                      code={snippet.code}
                      language={snippet.language}
                      title={`${snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)} Code`}
                    />
                  </Fragment>
                );
              }
              return null;
            })}
            <ReactMarkdown
              className="font-medium"
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {renderedText}
            </ReactMarkdown>
          </>
        );
      })()}
    </Card>
  )
}

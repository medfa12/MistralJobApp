'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  useColorModeValue, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Flex,
  Icon,
  Image,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { useState, useEffect, Fragment } from 'react';
import { MdDescription, MdCode } from 'react-icons/md';
import { Attachment, ToolCall, ArtifactData, InspectedCodeAttachment } from '@/types/types';
import ToolCallBox from '@/components/ToolCallBox';
import CodeSnippet from '@/components/CodeSnippet';
import { processLatex } from '@/utils/latexProcessor';
import { ArtifactToggleButton } from '@/components/artifact';
import { useChatState } from '@/contexts/ChatStateContext';

export default function MessageBox(props: {
  output: string;
  attachments?: Attachment[];
  toolCall?: ToolCall;
  artifact?: ArtifactData;
  inspectedCodeAttachment?: InspectedCodeAttachment;
  onArtifactClick?: () => void;
  isArtifactOpen?: boolean;
  messageIndex?: number;
}) {
  const { output, attachments, toolCall, artifact, inspectedCodeAttachment, onArtifactClick, isArtifactOpen, messageIndex } = props
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
        <Accordion
          allowToggle
          mb="20px"
          index={isExpanded ? [0] : []}
          onChange={() => messageIndex !== undefined && toggleThinking(messageIndex)}
        >
          <AccordionItem
            border="1px solid"
            borderColor={thinkingBorder}
            borderRadius="12px"
            bg={thinkingBg}
          >
            <AccordionButton
              _hover={{ bg: 'transparent' }}
              borderRadius="12px"
            >
              <Box flex="1" textAlign="left">
                <Flex align="center">
                  <Text
                    fontWeight="700"
                    fontSize="md"
                    color={textColor}
                    bgGradient="linear(to-r, orange.500, orange.400, orange.500)"
                    bgClip="text"
                    bgSize="200% auto"
                    animation="shimmer 3s linear infinite"
                    sx={{
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '0% center' },
                        '100%': { backgroundPosition: '200% center' },
                      },
                    }}
                  >
                    Thinking Process
                  </Text>
                  <Text ml="10px" fontSize="xs" color="gray.500">
                    (Click to expand)
                  </Text>
                </Flex>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <ReactMarkdown
                className="font-medium"
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {thinking}
              </ReactMarkdown>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
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

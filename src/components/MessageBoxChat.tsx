//@ts-ignore
import ReactMarkdown from 'react-markdown'
//@ts-ignore
import remarkMath from 'remark-math'
//@ts-ignore
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
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
  SimpleGrid
} from '@chakra-ui/react'
import Card from '@/components/card/Card'
import { useState, useEffect } from 'react'
import { MdImage, MdDescription } from 'react-icons/md'
import { Attachment, ArtifactData, InspectedCodeAttachment } from '@/types/types'

export default function MessageBox(props: { 
  output: string; 
  attachments?: Attachment[]; 
  artifact?: ArtifactData;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
}) {
  const { output, attachments, artifact, onCodeAttach } = props
  const textColor = useColorModeValue('navy.700', 'white')
  const thinkingBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const thinkingBorder = useColorModeValue('purple.200', 'purple.600')
  const [thinking, setThinking] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')

  const processLatex = (text: string) => {
    let processed = text;
    
    processed = processed.replace(/\\begin\{(pmatrix|bmatrix|matrix|align|equation)\}[\s\S]*?\\end\{\1\}/g, (match) => {
      if (match.startsWith('$$') || match.startsWith('\\[')) return match;
      return `$$\n${match}\n$$`;
    });
    
    processed = processed.replace(/^([^$\n]*\\(?:frac|sqrt|sum|prod|int|lim|binom|begin)\{[^}]*\}.*?)$/gm, (match) => {
      if (match.trim().startsWith('$') || match.trim().startsWith('\\(')) return match;
      const trimmed = match.trim();
      if (trimmed.includes('\n') || trimmed.length > 60) {
        return `$$${trimmed}$$`;
      }
      return `$${trimmed}$`;
    });
    
    processed = processed.replace(/^([^$\n]*[a-zA-Z0-9]\^\{?[^}]*\}?.*?)$/gm, (match) => {
      if (match.trim().startsWith('$') || match.includes('```') || match.includes('http')) return match;
      const trimmed = match.trim();
      if (/\\[a-zA-Z]+|[\^_]\{/.test(trimmed) && trimmed.length < 100) {
        return `$${trimmed}$`;
      }
      return match;
    });
    
    return processed;
  };

  useEffect(() => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g
    const matches = output.match(thinkRegex)
    
    if (matches && matches.length > 0) {
      const thinkingContent = matches
        .map(match => match.replace(/<\/?think>/g, ''))
        .join('\n\n')
      setThinking(processLatex(thinkingContent))
      
      const cleanAnswer = output.replace(thinkRegex, '').trim()
      setAnswer(processLatex(cleanAnswer))
    } else {
      setThinking('')
      setAnswer(processLatex(output))
    }
  }, [output])

  const attachmentBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const attachmentBorder = useColorModeValue('gray.200', 'whiteAlpha.200');

  return (
    <Card
      display={output ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      minH="450px"
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
      
      {thinking && (
        <Accordion allowToggle mb="20px">
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
                  <Text fontWeight="700" fontSize="md" color={textColor}>
                    🧠 Thinking Process
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
                remarkPlugins={[remarkMath] as any}
                rehypePlugins={[rehypeKatex] as any}
              >
                {thinking}
              </ReactMarkdown>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      
      <ReactMarkdown 
        className="font-medium"
        remarkPlugins={[remarkMath] as any}
        rehypePlugins={[rehypeKatex] as any}
      >
        {answer ? answer : ''}
      </ReactMarkdown>

      {/* Artifact reference removed - now shown in side panel */}
    </Card>
  )
}

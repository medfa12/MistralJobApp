//@ts-ignore
import ReactMarkdown from 'react-markdown'
import { 
  useColorModeValue, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Flex
} from '@chakra-ui/react'
import Card from '@/components/card/Card'
import { useState, useEffect } from 'react'

export default function MessageBox(props: { output: string }) {
  const { output } = props
  const textColor = useColorModeValue('navy.700', 'white')
  const thinkingBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const thinkingBorder = useColorModeValue('purple.200', 'purple.600')
  const [thinking, setThinking] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')

  useEffect(() => {
    // Parse the output to extract thinking and answer
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g
    const matches = output.match(thinkRegex)
    
    if (matches && matches.length > 0) {
      // Extract all thinking content
      const thinkingContent = matches
        .map(match => match.replace(/<\/?think>/g, ''))
        .join('\n\n')
      setThinking(thinkingContent)
      
      // Remove thinking tags from output to get the answer
      const cleanAnswer = output.replace(thinkRegex, '').trim()
      setAnswer(cleanAnswer)
    } else {
      // No thinking blocks, treat entire output as answer
      setThinking('')
      setAnswer(output)
    }
  }, [output])

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
              <ReactMarkdown className="font-medium">
                {thinking}
              </ReactMarkdown>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      
      <ReactMarkdown className="font-medium">
        {answer ? answer : ''}
      </ReactMarkdown>
    </Card>
  )
}

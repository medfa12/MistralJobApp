//@ts-ignore
import ReactMarkdown from 'react-markdown';
//@ts-ignore
import remarkMath from 'remark-math';
//@ts-ignore
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Flex, useColorModeValue } from '@chakra-ui/react';
export default function MessageBox(props: { output: string }) {
  const { output } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  
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

  const processedOutput = output ? processLatex(output) : 'Your generated response will appear here...';

  return (
    <Flex
      w="100%"
      maxW="100%"
      flexWrap="wrap"
      p="15px 20px"
      border="1px solid"
      color={textColor}
      borderColor={borderColor}
      borderRadius="10px"
      minH="564px"
      fontSize="md"
      fontWeight="500"
      mb="28px"
    >
      <ReactMarkdown 
        className="font-medium w-[100%]"
        remarkPlugins={[remarkMath] as any}
        rehypePlugins={[rehypeKatex] as any}
      >
        {processedOutput}
      </ReactMarkdown>
    </Flex>
  );
}

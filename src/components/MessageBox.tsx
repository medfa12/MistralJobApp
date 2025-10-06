'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Flex, useColorModeValue } from '@chakra-ui/react';
import { processLatex } from '@/utils/latexProcessor';

export default function MessageBox(props: { output: string }) {
  const { output } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

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
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {processedOutput}
      </ReactMarkdown>
    </Flex>
  );
}

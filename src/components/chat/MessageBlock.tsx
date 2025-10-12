'use client';

import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { MdDoneAll } from 'react-icons/md';
import { processLatex } from '@/utils/latexProcessor';

interface MessageBlockProps {
  content: ReactNode;
  time: string;
  side?: 'left' | 'right';
  isLast?: boolean;
  seen?: boolean;
}

export default function MessageBlock({
  content,
  time,
  side = 'right',
  isLast = false,
  seen = false,
}: MessageBlockProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const blockBg = useColorModeValue('secondaryGray.300', 'navy.700');
  const brandBlockBg = useColorModeValue('brand.500', 'brand.400');
  const brandColor = useColorModeValue('brand.500', 'white');
  const linkColor = useColorModeValue('brand.500', 'brand.200');

  const renderContent = () => {
    if (typeof content === 'string') {
      const processed = processLatex(content);
      return (
        <Box me="6px" mb="8px">
          <ReactMarkdown
          remarkPlugins={[remarkMath] as any}
          rehypePlugins={[rehypeKatex] as any}
          components={{
            p: ({ children }) => (
              <Text
                mb="8px"
                fontSize={{ base: 'md', '2xl': 'md' }}
                fontWeight="400"
                color={side === 'left' ? textColor : 'white'}
              >
                {children}
              </Text>
            ),
            a: ({ children, href }) => (
              <Text
                as="a"
                href={href}
                target="_blank"
                rel="noreferrer"
                color={linkColor}
                textDecoration="underline"
              >
                {children}
              </Text>
            ),
            ul: ({ children }) => (
              <Box
                as="ul"
                pl="20px"
                mb="8px"
                color={side === 'left' ? textColor : 'white'}
              >
                {children}
              </Box>
            ),
            ol: ({ children }) => (
              <Box
                as="ol"
                pl="20px"
                mb="8px"
                color={side === 'left' ? textColor : 'white'}
              >
                {children}
              </Box>
            ),
            li: ({ children }) => (
              <Text
                as="li"
                mb="4px"
                fontSize={{ base: 'md', '2xl': 'md' }}
                fontWeight="400"
                color={side === 'left' ? textColor : 'white'}
              >
                {children}
              </Text>
            ),
            code: ({ children }) => (
              <Box
                as="code"
                bg={side === 'left' ? 'blackAlpha.100' : 'whiteAlpha.300'}
                color={side === 'left' ? textColor : 'white'}
                px="6px"
                py="2px"
                borderRadius="md"
                fontSize="sm"
              >
                {children}
              </Box>
            ),
            strong: ({ children }) => (
              <Text as="strong" fontWeight="700">
                {children}
              </Text>
            ),
          }}
        >
          {processed}
          </ReactMarkdown>
        </Box>
      );
    }

    return (
      <Text
        color={side === 'left' ? textColor : 'white'}
        fontSize={{ base: 'md', '2xl': 'md' }}
        me="6px"
        mb="8px"
        fontWeight="400"
      >
        {content}
      </Text>
    );
  };

  return (
    <Box
      borderRadius={side === 'left' ? '0px 20px 20px 20px' : '20px 0px 20px 20px'}
      bg={side === 'left' ? blockBg : brandBlockBg}
      justifyContent="center"
      alignItems="center"
      px="24px"
      py="16px"
      w="max-content"
      maxW={{ base: '100%', lg: '65%', xl: '52%' }}
      mb={isLast ? { base: '40px', md: 'none' } : { base: '20px' }}
    >
      {}
      {renderContent()}

      {}
      <Flex align="center">
        <Icon
          display={seen ? 'flex' : 'none'}
          as={MdDoneAll}
          color={side === 'left' ? brandColor : 'white'}
          w="18px"
          h="18px"
          me="8px"
        />
        <Text
          color={side === 'left' ? 'secondaryGray.600' : 'white'}
          fontSize={{ base: 'xs', '2xl': 'md' }}
          fontWeight="500"
        >
          {time}
        </Text>
      </Flex>
    </Box>
  );
}

'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownViewProps {
  markdown: string;
}

export function MarkdownView({ markdown }: MarkdownViewProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={8}
      maxW="900px"
      mx="auto"
      boxShadow="lg"
      sx={{
        '& h1': {
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: 'gray.900',
          _dark: { color: 'white' },
          mb: 6,
          pb: 3,
          borderBottom: '2px solid',
          borderColor: 'orange.500',
        },
        '& h2': {
          fontSize: '1.875rem',
          fontWeight: '600',
          color: 'gray.800',
          _dark: { color: 'gray.100' },
          mb: 4,
          pb: 2,
          borderLeft: '4px solid',
          borderColor: 'orange.400',
          pl: 4,
        },
        '& h3': {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'gray.800',
          _dark: { color: 'gray.100' },
          mb: 3,
          borderLeft: '2px solid',
          borderColor: 'orange.300',
          pl: 3,
        },
        '& h4, & h5, & h6': {
          fontWeight: '500',
          color: 'gray.700',
          _dark: { color: 'gray.200' },
          mb: 2,
        },
        '& p': {
          color: 'gray.700',
          _dark: { color: 'gray.300' },
          mb: 4,
          lineHeight: 1.7,
        },
        '& strong': {
          fontWeight: '600',
          color: 'gray.900',
          _dark: { color: 'white' },
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& code': {
          bg: 'orange.50',
          color: 'orange.600',
          px: 1.5,
          py: 0.5,
          borderRadius: 'md',
          fontSize: '0.875rem',
          fontFamily: 'mono',
        },
        '& pre': {
          bg: 'gray.900',
          color: 'gray.100',
          p: 4,
          borderRadius: 'lg',
          fontSize: '0.875rem',
          overflowX: 'auto',
          my: 4,
          borderLeft: '4px solid',
          borderColor: 'orange.500',
        },
        '& pre code': {
          bg: 'transparent',
          color: 'inherit',
          p: 0,
        },
        '& a': {
          color: 'orange.500',
          textDecoration: 'underline',
          '&:hover': {
            color: 'orange.600',
          },
        },
        '& ul, & ol': {
          ml: 4,
          mb: 4,
          color: 'gray.700',
        },
        '& li': {
          mb: 1,
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'orange.400',
          pl: 4,
          fontStyle: 'italic',
          color: 'gray.600',
          my: 4,
          bg: 'orange.50',
          py: 3,
          pr: 3,
          borderRadius: '0 8px 8px 0',
        },
        '& table': {
          width: '100%',
          my: 6,
          borderCollapse: 'collapse',
          overflow: 'hidden',
          borderRadius: 'lg',
          boxShadow: 'sm',
        },
        '& th': {
          bg: 'orange.500',
          color: 'white',
          fontWeight: '600',
          px: 4,
          py: 2,
          textAlign: 'left',
          border: '1px solid',
          borderColor: 'orange.600',
        },
        '& td': {
          px: 4,
          py: 2,
          textAlign: 'left',
          border: '1px solid',
          borderColor: 'gray.300',
          color: 'gray.700',
        },
        '& img': {
          maxW: '100%',
          height: 'auto',
          borderRadius: 'lg',
          my: 4,
        },
        '& hr': {
          my: 6,
          borderColor: 'orange.200',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
}


'use client';

import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownViewProps {
  markdown: string;
}

export function MarkdownView({ markdown }: MarkdownViewProps) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="#E5E7EB"
      p={8}
      maxW="900px"
      mx="auto"
      boxShadow="lg"
      sx={{
        '& h1': {
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#111827',
          mb: 6,
          pb: 3,
          borderBottom: '2px solid',
          borderColor: '#FF9559',
        },
        '& h2': {
          fontSize: '1.875rem',
          fontWeight: '600',
          color: '#1F2937',
          mb: 4,
          pb: 2,
          borderLeft: '4px solid',
          borderColor: '#FF9559',
          pl: 4,
        },
        '& h3': {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1F2937',
          mb: 3,
          borderLeft: '2px solid',
          borderColor: '#FFB380',
          pl: 3,
        },
        '& h4, & h5, & h6': {
          fontWeight: '500',
          color: '#374151',
          mb: 2,
        },
        '& p': {
          color: '#374151',
          mb: 4,
          lineHeight: 1.7,
        },
        '& strong': {
          fontWeight: '600',
          color: '#111827',
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& code': {
          bg: '#FFF5EE',
          color: '#E06020',
          px: 1.5,
          py: 0.5,
          borderRadius: 'md',
          fontSize: '0.875rem',
          fontFamily: 'mono',
        },
        '& pre': {
          bg: '#1F2937',
          color: '#F3F4F6',
          p: 4,
          borderRadius: 'lg',
          fontSize: '0.875rem',
          overflowX: 'auto',
          my: 4,
          borderLeft: '4px solid',
          borderColor: '#FF9559',
        },
        '& pre code': {
          bg: 'transparent',
          color: 'inherit',
          p: 0,
        },
        '& a': {
          color: '#FF9559',
          textDecoration: 'underline',
          '&:hover': {
            color: '#E06020',
          },
        },
        '& ul, & ol': {
          ml: 4,
          mb: 4,
          color: '#374151',
        },
        '& li': {
          mb: 1,
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: '#FF9559',
          pl: 4,
          fontStyle: 'italic',
          color: '#4B5563',
          my: 4,
          bg: '#FFF5EE',
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
          bg: '#FF9559',
          color: 'white',
          fontWeight: '600',
          px: 4,
          py: 2,
          textAlign: 'left',
          border: '1px solid',
          borderColor: '#E06020',
        },
        '& td': {
          px: 4,
          py: 2,
          textAlign: 'left',
          border: '1px solid',
          borderColor: '#E5E7EB',
          color: '#374151',
        },
        '& img': {
          maxW: '100%',
          height: 'auto',
          borderRadius: 'lg',
          my: 4,
        },
        '& hr': {
          my: 6,
          borderColor: '#FFD5BD',
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


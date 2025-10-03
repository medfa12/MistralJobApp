'use client';

import { FC, useState } from 'react';
import { Box, Button, Flex, Icon, useToast, useColorModeValue, Badge, Text } from '@chakra-ui/react';
import { MdContentCopy, MdCheck, MdCode } from 'react-icons/md';
import { motion } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';

interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
}

const MotionButton = motion(Button);

export const CodeSnippet: FC<CodeSnippetProps> = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: 'Code copied!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'python':
      case 'py':
        return [python()];
      case 'rust':
      case 'rs':
        return [rust()];
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'sql':
        return [sql()];
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
      case 'tsx':
      default:
        return [javascript({ jsx: true, typescript: true })];
    }
  };

  const getLanguageColor = () => {
    switch (language.toLowerCase()) {
      case 'python':
      case 'py':
        return 'blue';
      case 'rust':
      case 'rs':
        return 'orange';
      case 'javascript':
      case 'js':
      case 'jsx':
        return 'yellow';
      case 'typescript':
      case 'ts':
      case 'tsx':
        return 'blue';
      case 'html':
        return 'red';
      case 'css':
        return 'purple';
      case 'sql':
        return 'teal';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      w="100%"
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="md"
      my={3}
    >
      {/* Header */}
      <Flex
        bg={headerBg}
        p={3}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex align="center" gap={2}>
          <Icon as={MdCode} boxSize={5} color="orange.500" />
          {title && (
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              {title}
            </Text>
          )}
          <Badge colorScheme={getLanguageColor()} fontSize="xs">
            {language.toUpperCase()}
          </Badge>
        </Flex>
        <MotionButton
          size="sm"
          onClick={handleCopy}
          leftIcon={<Icon as={copied ? MdCheck : MdContentCopy} />}
          colorScheme={copied ? 'green' : 'gray'}
          variant="ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </MotionButton>
      </Flex>

      {/* Code */}
      <Box position="relative">
        <CodeMirror
          value={code}
          height="auto"
          maxHeight="500px"
          theme={tokyoNight}
          extensions={getLanguageExtension()}
          editable={false}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: false,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
          }}
        />
      </Box>
    </Box>
  );
};

export default CodeSnippet;



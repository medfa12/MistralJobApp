'use client';

import { StreamLanguage } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import CodeMirror from '@uiw/react-codemirror';
import { FC, useState } from 'react';
import { Box, Button, Flex, Icon, useToast } from '@chakra-ui/react';
import { MdContentCopy, MdCheck } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ArtifactData } from './types';

interface Props {
  artifact: ArtifactData;
}

const MotionButton = motion(Button);

export const CodeView: FC<Props> = ({ artifact }) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.code);
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
    switch (artifact.type) {
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'javascript':
      case 'react':
      case 'vue':
      default:
        return [javascript({ jsx: true, typescript: true })];
    }
  };

  return (
    <Box position="relative" w="100%" h="100%">
      <Flex position="absolute" top="10px" right="10px" zIndex={10}>
        <MotionButton
          size="sm"
          onClick={handleCopy}
          leftIcon={<Icon as={copied ? MdCheck : MdContentCopy} />}
          colorScheme={copied ? 'green' : 'gray'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </MotionButton>
      </Flex>
      <CodeMirror
        value={artifact.code}
        height="600px"
        theme={tokyoNight}
        extensions={getLanguageExtension()}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        className="rounded-lg overflow-hidden"
      />
    </Box>
  );
};


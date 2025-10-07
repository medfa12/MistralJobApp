'use client';

import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { EditorState } from 'lexical';
import { MISTRAL_LEXICAL_THEME } from './MistralLexicalTheme';
import { ToolbarPlugin } from './ToolbarPlugin';

interface LexicalEditorProps {
  initialMarkdown: string;
  onContentChange?: (markdown: string) => void;
  readOnly?: boolean;
}

function MarkdownImportPlugin({ initialMarkdown }: { initialMarkdown: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialMarkdown) {
      editor.update(() => {
        $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
      });
    }
  }, [initialMarkdown, editor]);

  return null;
}

export function LexicalEditor({ initialMarkdown, onContentChange, readOnly = false }: LexicalEditorProps) {
  const editorBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const initialConfig = {
    namespace: 'MistralDocumentEditor',
    theme: MISTRAL_LEXICAL_THEME,
    onError: (error: Error) => console.error(error),
    editable: !readOnly,
    nodes: [],
  };

  const handleEditorChange = (editorState: EditorState) => {
    if (readOnly || !onContentChange) return;

    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      onContentChange(markdown);
    });
  };

  return (
    <Box 
      borderRadius="xl" 
      overflow="hidden"
      border="1px solid"
      borderColor={borderColor}
      bg={editorBg}
      boxShadow="lg"
    >
      <LexicalComposer initialConfig={initialConfig}>
        {!readOnly && <ToolbarPlugin />}
        <Box
          p={6}
          minH="500px"
          maxH="800px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FF9559',
              borderRadius: '4px',
            },
          }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="lexical-content-editable"
                style={{
                  outline: 'none',
                  minHeight: '500px',
                  maxWidth: '900px',
                  margin: '0 auto',
                }}
              />
            }
            placeholder={
              <Box 
                color="gray.400" 
                position="absolute" 
                top="6" 
                left="6"
                pointerEvents="none"
              >
                Start writing your document...
              </Box>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          <MarkdownImportPlugin initialMarkdown={initialMarkdown} />
        </Box>
      </LexicalComposer>
    </Box>
  );
}


'use client';

import { useEffect, useRef } from 'react';
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
// Lexical nodes required for Markdown transformers
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
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
      try {
        editor.update(() => {
          $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
        });
      } catch (e) {
        console.error('Failed to import markdown into editor:', e);
        // Leave editor empty rather than crashing
      }
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
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
      AutoLinkNode,
      HorizontalRuleNode,
    ],
  };

  const debounceRef = useRef<number | undefined>(undefined);

  const handleEditorChange = (editorState: EditorState) => {
    if (readOnly || !onContentChange) return;

    try {
      // Debounce conversions to avoid save storms
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        try {
          editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            onContentChange(markdown);
          });
        } catch (e) {
          console.error('Failed to convert editor state to markdown:', e);
        }
      }, 500);
    } catch (e) {
      console.error('Editor onChange error:', e);
    }
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

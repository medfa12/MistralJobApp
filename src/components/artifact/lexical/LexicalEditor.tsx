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
import { Box } from '@chakra-ui/react';
import { EditorState } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { MISTRAL_LEXICAL_THEME } from './MistralLexicalTheme';
import { ToolbarPlugin } from './ToolbarPlugin';
import './lexical-editor.css';

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
      }
    }
  }, [initialMarkdown, editor]);

  return null;
}

export function LexicalEditor({ initialMarkdown, onContentChange, readOnly = false }: LexicalEditorProps) {
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
      borderColor="#E5E7EB"
      bg="white"
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
                color="#9CA3AF"
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

'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $getNodeByKey,
} from 'lexical';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, $createQuoteNode, HeadingTagType, QuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createCodeNode } from '@lexical/code';
import {
  Box,
  Flex,
  IconButton,
  Divider,
  Select,
  Tooltip,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdCode,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdUndo,
  MdRedo,
  MdLink,
  MdLinkOff,
  MdFormatQuote,
  MdHorizontalRule,
} from 'react-icons/md';

const LowPriority = 1;

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const { isOpen: isLinkModalOpen, onOpen: onLinkModalOpen, onClose: onLinkModalClose } = useDisclosure();

  const toolbarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = 'orange.500';
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('orange.50', 'orange.900');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    } else {
      formatParagraph();
    }
  };

  const formatCodeBlock = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    } else {
      formatParagraph();
    }
  };

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      setLinkUrl('');
      setLinkText('');
      onLinkModalClose();
    }
  };

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  return (
    <Flex
      p={2}
      gap={1}
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={toolbarBg}
      flexWrap="wrap"
      alignItems="center"
      position="sticky"
      top={0}
      zIndex={10}
    >
      {}
      <Tooltip label="Undo">
        <IconButton
          aria-label="Undo"
          icon={<MdUndo />}
          size="sm"
          variant="ghost"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Redo">
        <IconButton
          aria-label="Redo"
          icon={<MdRedo />}
          size="sm"
          variant="ghost"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" mx={1} />

      {}
      <Select
        size="sm"
        w="140px"
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            formatParagraph();
          } else if (value.startsWith('h')) {
            formatHeading(value as HeadingTagType);
          }
        }}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </Select>

      <Divider orientation="vertical" h="24px" mx={1} />

      {}
      <Tooltip label="Bold">
        <IconButton
          aria-label="Format Bold"
          icon={<MdFormatBold />}
          size="sm"
          variant="ghost"
          color={isBold ? activeColor : undefined}
          bg={isBold ? activeBg : undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Italic">
        <IconButton
          aria-label="Format Italic"
          icon={<MdFormatItalic />}
          size="sm"
          variant="ghost"
          color={isItalic ? activeColor : undefined}
          bg={isItalic ? activeBg : undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Underline">
        <IconButton
          aria-label="Format Underline"
          icon={<MdFormatUnderlined />}
          size="sm"
          variant="ghost"
          color={isUnderline ? activeColor : undefined}
          bg={isUnderline ? activeBg : undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Strikethrough">
        <IconButton
          aria-label="Format Strikethrough"
          icon={<MdStrikethroughS />}
          size="sm"
          variant="ghost"
          color={isStrikethrough ? activeColor : undefined}
          bg={isStrikethrough ? activeBg : undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Code">
        <IconButton
          aria-label="Format Code"
          icon={<MdCode />}
          size="sm"
          variant="ghost"
          color={isCode ? activeColor : undefined}
          bg={isCode ? activeBg : undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" mx={1} />

      {}
      <Tooltip label="Bullet List">
        <IconButton
          aria-label="Bullet List"
          icon={<MdFormatListBulleted />}
          size="sm"
          variant="ghost"
          color={blockType === 'ul' ? activeColor : undefined}
          bg={blockType === 'ul' ? activeBg : undefined}
          onClick={formatBulletList}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>
      <Tooltip label="Numbered List">
        <IconButton
          aria-label="Numbered List"
          icon={<MdFormatListNumbered />}
          size="sm"
          variant="ghost"
          color={blockType === 'ol' ? activeColor : undefined}
          bg={blockType === 'ol' ? activeBg : undefined}
          onClick={formatNumberedList}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" mx={1} />

      <Tooltip label="Quote">
        <IconButton
          aria-label="Quote"
          icon={<MdFormatQuote />}
          size="sm"
          variant="ghost"
          color={blockType === 'quote' ? activeColor : undefined}
          bg={blockType === 'quote' ? activeBg : undefined}
          onClick={formatQuote}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Tooltip label="Code Block">
        <IconButton
          aria-label="Code Block"
          icon={<MdCode />}
          size="sm"
          variant="ghost"
          color={blockType === 'code' ? activeColor : undefined}
          bg={blockType === 'code' ? activeBg : undefined}
          onClick={formatCodeBlock}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" mx={1} />

      <Tooltip label="Insert Link">
        <IconButton
          aria-label="Insert Link"
          icon={<MdLink />}
          size="sm"
          variant="ghost"
          onClick={onLinkModalOpen}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Tooltip label="Remove Link">
        <IconButton
          aria-label="Remove Link"
          icon={<MdLinkOff />}
          size="sm"
          variant="ghost"
          onClick={removeLink}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Tooltip label="Horizontal Rule">
        <IconButton
          aria-label="Horizontal Rule"
          icon={<MdHorizontalRule />}
          size="sm"
          variant="ghost"
          onClick={insertHorizontalRule}
          _hover={{ bg: hoverBg }}
        />
      </Tooltip>

      <Modal isOpen={isLinkModalOpen} onClose={onLinkModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insert Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>URL</FormLabel>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertLink();
                  }
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Link Text (optional)</FormLabel>
              <Input
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLinkModalClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={handleInsertLink}>
              Insert
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

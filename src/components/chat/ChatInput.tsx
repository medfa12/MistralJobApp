'use client';

import {
  Flex,
  Input,
  Button,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAttachFile, MdImage, MdDescription } from 'react-icons/md';
import { ModelInfo } from '@/config/models';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  loading: boolean;
  modelInfo: ModelInfo | undefined;
  attachmentCount: number;
  onImageAttach: (file: File, preview: string) => void;
  onDocumentAttach: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  loading,
  modelInfo,
  attachmentCount,
  onImageAttach,
  onDocumentAttach,
}) => {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        onImageAttach(file, preview);
      }
    };
    input.click();
  };

  const handleDocumentSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onDocumentAttach(file);
      }
    };
    input.click();
  };

  return (
    <Flex direction="column" gap="10px" flexShrink={0}>
      {modelInfo && modelInfo.supportedAttachments.length > 0 && (
        <Flex gap="8px" align="center" flexWrap="wrap">
          <Icon as={MdAttachFile} color={textColor} boxSize="18px" />
          {modelInfo.supportedAttachments.includes('image') && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={MdImage} />}
              onClick={handleImageSelect}
            >
              Image
            </Button>
          )}
          {modelInfo.supportedAttachments.includes('document') && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={MdDescription} />}
              onClick={handleDocumentSelect}
            >
              PDF
            </Button>
          )}
          {attachmentCount > 0 && (
            <Text fontSize="xs" color={textColor} ml="auto">
              {attachmentCount} file(s) attached
            </Text>
          )}
        </Flex>
      )}

      <Flex gap="10px">
        <Input
          minH="54px"
          h="100%"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="45px"
          p="15px 20px"
          me="10px"
          fontSize="sm"
          fontWeight="500"
          _focus={{ borderColor: 'none' }}
          color={inputColor}
          _placeholder={placeholderColor}
          placeholder="Type your message here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
        />
        <Button
          variant="primary"
          py="20px"
          px="16px"
          fontSize="sm"
          borderRadius="45px"
          ms="auto"
          w={{ base: '160px', md: '210px' }}
          h="54px"
          _hover={{
            boxShadow:
              '0px 21px 27px -10px rgba(250, 80, 15, 0.48) !important',
            bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%) !important',
            _disabled: {
              bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)',
            },
          }}
          onClick={onSubmit}
          isLoading={loading}
        >
          Submit
        </Button>
      </Flex>
    </Flex>
  );
};


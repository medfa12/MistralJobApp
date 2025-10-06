'use client';

import { Flex, Box, Text, Icon, IconButton, useColorModeValue } from '@chakra-ui/react';
import { MdDescription, MdClose } from 'react-icons/md';

interface AttachmentPreviewProps {
  attachments: Array<{ type: string; file: File; preview?: string }>;
  onRemove: (index: number) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
}) => {
  const attachmentBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  if (attachments.length === 0) return null;

  return (
    <Flex gap="8px" flexWrap="wrap">
      {attachments.map((attachment, index) => (
        <Flex
          key={index}
          bg={attachmentBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          p="8px"
          align="center"
          gap="8px"
        >
          {attachment.preview ? (
            <Box
              as="img"
              src={attachment.preview}
              alt={attachment.file.name}
              w="40px"
              h="40px"
              objectFit="cover"
              borderRadius="4px"
            />
          ) : (
            <Icon as={MdDescription} boxSize="20px" color={textColor} />
          )}
          <Box flex="1" minW="0">
            <Text fontSize="xs" color={textColor} noOfLines={1}>
              {attachment.file.name}
            </Text>
            <Text fontSize="xs" color={gray}>
              {(attachment.file.size / 1024).toFixed(1)} KB
            </Text>
          </Box>
          <IconButton
            aria-label="Remove"
            icon={<Icon as={MdClose} />}
            size="xs"
            variant="ghost"
            onClick={() => onRemove(index)}
          />
        </Flex>
      ))}
    </Flex>
  );
};


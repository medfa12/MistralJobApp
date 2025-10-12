'use client';

import { Flex, Box, Text, Icon, IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { MdCode, MdClose } from 'react-icons/md';
import { InspectedCodeAttachment } from '@/types/types';

interface InspectedCodePreviewProps {
  attachment: InspectedCodeAttachment;
  onRemove: () => void;
}

export const InspectedCodePreview: React.FC<InspectedCodePreviewProps> = ({
  attachment,
  onRemove,
}) => {
  const inspectedCodeBg = useColorModeValue('purple.50', 'purple.900');
  const inspectedCodeBorder = useColorModeValue('purple.300', 'purple.600');
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  return (
    <Flex
      bg={inspectedCodeBg}
      border="2px solid"
      borderColor={inspectedCodeBorder}
      borderRadius="12px"
      p={3}
      align="center"
      gap={3}
    >
      <Flex
        bg="purple.500"
        borderRadius="full"
        p={2}
        color="white"
      >
        <Icon as={MdCode} boxSize={5} />
      </Flex>
      <Box flex={1} minW="0">
        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={1}>
          Inspected: &lt;{attachment.elementTag}&gt;
          {attachment.elementId && ` #${attachment.elementId}`}
          {attachment.elementClasses && ` .${attachment.elementClasses.split(' ')[0]}`}
        </Text>
        <Text fontSize="xs" color={gray} noOfLines={2} fontFamily="mono">
          {attachment.code.slice(0, 100)}
          {attachment.code.length > 100 ? '...' : ''}
        </Text>
      </Box>
      <Tooltip label="Remove attachment">
        <IconButton
          aria-label="Remove inspected code"
          icon={<Icon as={MdClose} />}
          size="sm"
          variant="ghost"
          colorScheme="purple"
          onClick={onRemove}
        />
      </Tooltip>
    </Flex>
  );
};

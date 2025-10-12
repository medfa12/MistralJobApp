'use client';

import {
  Flex,
  Text,
  Button,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdClose } from 'react-icons/md';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface TranscribingIndicatorProps {
  onCancel: () => void;
}

export const TranscribingIndicator: React.FC<TranscribingIndicatorProps> = ({
  onCancel,
}) => {
  return (
    <Flex
      w="100%"
      maxW="920px"
      h="54px"
      px="20px"
      borderRadius="45px"
      bg="linear-gradient(to right, #1a1b1e 0%, #2a2b2e 50%, #1a1b1e 100%)"
      backgroundSize="2000px 100%"
      animation={`${shimmer} 2s linear infinite`}
      align="center"
      justify="space-between"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Text
        fontSize="sm"
        fontWeight="500"
        color="whiteAlpha.800"
        bgGradient="linear(to-r, whiteAlpha.600, white, whiteAlpha.600)"
        backgroundSize="200% auto"
        animation={`${shimmer} 2s linear infinite`}
        bgClip="text"
      >
        Transcribing...
      </Text>

      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        _hover={{ bg: 'whiteAlpha.100' }}
        leftIcon={<Icon as={MdClose} />}
      >
        Cancel
      </Button>
    </Flex>
  );
};

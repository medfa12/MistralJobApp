import { Flex, Text, Badge, Icon, useColorModeValue } from '@chakra-ui/react';
import { MdSpeed } from 'react-icons/md';
import { motion } from 'framer-motion';

interface StreamingSpeedIndicatorProps {
  tokensPerSecond: number;
  totalTokens: number;
  elapsedTime: number;
  isStreaming: boolean;
}

const MotionFlex = motion(Flex);

export const StreamingSpeedIndicator: React.FC<StreamingSpeedIndicatorProps> = ({
  tokensPerSecond,
  totalTokens,
  elapsedTime,
  isStreaming,
}) => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('blue.700', 'blue.100');
  const speedColor = useColorModeValue('green.600', 'green.300');

  if (!isStreaming && totalTokens === 0) return null;

  const getSpeedColor = () => {
    if (tokensPerSecond >= 100) return 'green';
    if (tokensPerSecond >= 50) return 'blue';
    if (tokensPerSecond >= 20) return 'yellow';
    return 'orange';
  };

  return (
    <MotionFlex
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      // @ts-ignore - framer-motion types conflict with chakra
      transition={{ duration: 0.2 }}
      align="center"
      gap={3}
      p={2}
      px={3}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      fontSize="sm"
    >
      <Icon as={MdSpeed} color={textColor} boxSize={4} />

      <Flex align="center" gap={2}>
        <Badge colorScheme={getSpeedColor()} fontSize="xs" px={2}>
          {tokensPerSecond.toFixed(1)} tok/s
        </Badge>

        <Text color={textColor} fontSize="xs" fontWeight="500">
          {totalTokens} tokens
        </Text>

        <Text color={textColor} fontSize="xs" opacity={0.7}>
          {elapsedTime.toFixed(1)}s
        </Text>

        {isStreaming && (
          <Badge colorScheme="purple" fontSize="xs" variant="subtle">
            Streaming
          </Badge>
        )}
      </Flex>
    </MotionFlex>
  );
};

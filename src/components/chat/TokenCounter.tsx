'use client';

import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { ModelInfo, formatContextWindow } from '@/config/models';

interface TokenCounterProps {
  currentTokens: number;
  modelInfo: ModelInfo | undefined;
  messagesCount: number;
}

export const TokenCounter: React.FC<TokenCounterProps> = ({
  currentTokens,
  modelInfo,
  messagesCount,
}) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  if (!modelInfo || messagesCount === 0) return null;

  const tokenPercentage = (currentTokens / modelInfo.contextWindow) * 100;
  const textColorByUsage = tokenPercentage > 70 ? 'orange.500' : tokenPercentage > 50 ? 'yellow.600' : gray;

  return (
    <Flex direction="column" align="flex-start">
      <Text
        color={textColor}
        fontSize="sm"
        fontWeight="600"
      >
        Selected: {modelInfo.displayName}
      </Text>
      <Text
        color={textColorByUsage}
        fontSize="xs"
        fontWeight="500"
      >
        {currentTokens.toLocaleString()} / {formatContextWindow(modelInfo.contextWindow)} tokens ({Math.round(tokenPercentage)}%)
      </Text>
    </Flex>
  );
};

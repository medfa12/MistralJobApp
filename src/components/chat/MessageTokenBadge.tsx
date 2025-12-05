'use client';

import { Badge, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { estimateTokens } from '@/utils/messageHelpers';
import { useMemo } from 'react';

interface MessageTokenBadgeProps {
  content: string;
  hasAttachments?: boolean;
  imageCount?: number;
  documentCount?: number;
  metrics?: {
    tokens: number;
    time: number;
    speed: number;
  };
}

export const MessageTokenBadge: React.FC<MessageTokenBadgeProps> = ({
  content,
  hasAttachments = false,
  imageCount = 0,
  documentCount = 0,
  metrics,
}) => {
  const badgeBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const badgeColor = useColorModeValue('gray.700', 'gray.300');

  const estimatedTokens = useMemo(() => {
    let total = estimateTokens(content);

    // Add estimated tokens for attachments
    total += imageCount * 170; // ~170 tokens per image
    total += documentCount * 500; // ~500 tokens per document

    return total;
  }, [content, imageCount, documentCount]);

  const tooltipLabel = useMemo(() => {
    if (metrics) {
      return `Generated ${metrics.tokens} tokens in ${metrics.time}s (${metrics.speed} tokens/sec)`;
    }
    const parts = [`${estimatedTokens} tokens from text`];
    if (imageCount > 0) parts.push(`${imageCount} image(s) (~${imageCount * 170} tokens)`);
    if (documentCount > 0) parts.push(`${documentCount} document(s) (~${documentCount * 500} tokens)`);
    return parts.join(' + ');
  }, [estimatedTokens, imageCount, documentCount, metrics]);

  return (
    <Tooltip label={tooltipLabel} placement="top" hasArrow>
      <Badge
        bg={badgeBg}
        color={badgeColor}
        fontSize="xs"
        px={2}
        py={1}
        borderRadius="md"
        fontWeight="500"
        cursor="help"
      >
        {metrics ? (
          `${metrics.tokens.toLocaleString()} tokens • ${metrics.time}s • ${metrics.speed} t/s`
        ) : (
          `~${estimatedTokens.toLocaleString()} tokens`
        )}
      </Badge>
    </Tooltip>
  );
};

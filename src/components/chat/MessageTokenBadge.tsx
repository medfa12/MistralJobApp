'use client';

import { Badge, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { estimateTokens } from '@/utils/messageHelpers';
import { useMemo } from 'react';

interface MessageTokenBadgeProps {
  content: string;
  hasAttachments?: boolean;
  imageCount?: number;
  documentCount?: number;
}

export const MessageTokenBadge: React.FC<MessageTokenBadgeProps> = ({
  content,
  hasAttachments = false,
  imageCount = 0,
  documentCount = 0,
}) => {
  const badgeBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const badgeColor = useColorModeValue('gray.700', 'gray.300');

  const tokens = useMemo(() => {
    let total = estimateTokens(content);

    // Add estimated tokens for attachments
    total += imageCount * 170; // ~170 tokens per image
    total += documentCount * 500; // ~500 tokens per document

    return total;
  }, [content, imageCount, documentCount]);

  const tooltipLabel = useMemo(() => {
    const parts = [`${tokens} tokens from text`];
    if (imageCount > 0) parts.push(`${imageCount} image(s) (~${imageCount * 170} tokens)`);
    if (documentCount > 0) parts.push(`${documentCount} document(s) (~${documentCount * 500} tokens)`);
    return parts.join(' + ');
  }, [tokens, imageCount, documentCount]);

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
        ~{tokens.toLocaleString()} tokens
      </Badge>
    </Tooltip>
  );
};

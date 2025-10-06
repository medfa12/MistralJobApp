import { Text, Flex } from '@chakra-ui/react';
import { formatPrice, formatInterval } from '../../utils/formatters';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  interval?: 'month' | 'year';
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({
  amount,
  currency = 'usd',
  interval,
  size = 'md',
}: PriceDisplayProps) {
  const fontSize = {
    sm: 'xl',
    md: '3xl',
    lg: '4xl',
  }[size];

  const intervalSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }[size];

  return (
    <Flex align="baseline" gap={1}>
      <Text fontSize={fontSize} fontWeight="bold">
        {formatPrice(amount, currency)}
      </Text>
      {interval && (
        <Text fontSize={intervalSize} color="gray.600">
          {formatInterval(interval)}
        </Text>
      )}
    </Flex>
  );
}


import { Badge } from '@chakra-ui/react';
import { getStatusColor, getStatusLabel } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
  cancelAtPeriodEnd?: boolean;
}

export function StatusBadge({ status, cancelAtPeriodEnd = false }: StatusBadgeProps) {
  return (
    <Badge
      colorScheme={getStatusColor(status)}
      fontSize="sm"
      px={3}
      py={1}
      borderRadius="full"
      fontWeight="bold"
    >
      {getStatusLabel(status, cancelAtPeriodEnd)}
    </Badge>
  );
}


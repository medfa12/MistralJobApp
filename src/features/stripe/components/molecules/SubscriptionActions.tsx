import { Button, Flex } from '@chakra-ui/react';

interface SubscriptionActionsProps {
  isCanceling: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onReactivate: () => void;
  onManage: () => void;
}

export function SubscriptionActions({
  isCanceling,
  isLoading,
  onCancel,
  onReactivate,
  onManage,
}: SubscriptionActionsProps) {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      gap={4}
      w="full"
    >
      {isCanceling ? (
        <Button
          variant="primary"
          onClick={onReactivate}
          isLoading={isLoading}
          w={{ base: 'full', md: '210px' }}
          h="54px"
          borderRadius="45px"
        >
          Reactivate
        </Button>
      ) : (
        <Button
          variant="red"
          onClick={onCancel}
          isLoading={isLoading}
          w={{ base: 'full', md: '210px' }}
          h="54px"
          borderRadius="45px"
        >
          Cancel Subscription
        </Button>
      )}

      <Button
        variant="primary"
        onClick={onManage}
        isLoading={isLoading}
        w={{ base: 'full', md: '210px' }}
        h="54px"
        borderRadius="45px"
      >
        Manage Billing
      </Button>
    </Flex>
  );
}


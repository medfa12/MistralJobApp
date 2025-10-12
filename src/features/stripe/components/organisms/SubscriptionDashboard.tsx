import { useState } from 'react';
import { Box, Flex, Text, VStack, Spinner, Button, Alert, AlertIcon, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../../hooks/useSubscription';
import { StatusBadge } from '../atoms/StatusBadge';
import { PriceDisplay } from '../atoms/PriceDisplay';
import { SubscriptionActions } from '../molecules/SubscriptionActions';
import { formatDate, calculateDaysRemaining } from '../../utils/formatters';
import Card from '@/components/card/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export function SubscriptionDashboard() {
  const router = useRouter();
  const { data, loading, actionLoading, cancel, reactivate, openPortal } = useSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  if (loading) {
    return (
      <Card mt={{ base: '70px', md: '0px' }} maxW="920px" mx="auto">
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Card>
    );
  }

  if (!data?.hasSubscription) {
    return (
      <Card mt={{ base: '70px', md: '0px' }} maxW="920px" mx="auto">
        <VStack spacing={6} p={10} align="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>No Active Subscription</Text>
          <Text color={mutedColor} textAlign="center">
            Subscribe to access premium features
          </Text>
          <Button variant="primary" onClick={() => router.push('/subscription')}>
            View Plans
          </Button>
        </VStack>
      </Card>
    );
  }

  const { subscription, plan } = data;
  const daysRemaining = subscription
    ? calculateDaysRemaining(subscription.currentPeriodEnd)
    : 0;

  const handleCancel = async () => {
    if (actionLoading) return;
    try {
      await cancel();
      setCancelDialogOpen(false);
    } catch (error) {
      setCancelDialogOpen(false);
    }
  };

  return (
    <Card mt={{ base: '70px', md: '0px' }} maxW="920px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box
          p={8}
          borderRadius="16px"
          bgGradient="linear(to-r, #FA500F, #FF8205)"
          color="white"
        >
          <VStack align="start" spacing={4}>
            <StatusBadge
              status={subscription?.status || ''}
              cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd}
            />
            <Text fontSize="3xl" fontWeight="bold">{plan?.productName}</Text>
            {plan?.description && (
              <Text fontSize="md" opacity={0.9}>
                {plan.description}
              </Text>
            )}
            {plan && (
              <PriceDisplay
                amount={plan.amount}
                currency={plan.currency}
                interval={plan.interval}
                size="lg"
              />
            )}
          </VStack>
        </Box>

        {subscription?.cancelAtPeriodEnd && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Subscription ends on {formatDate(subscription.currentPeriodEnd)}
          </Alert>
        )}

        <Card p={6} bg={cardBg}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            <VStack align="start" flex={1} spacing={1}>
              <Text fontSize="sm" color={mutedColor}>Status</Text>
              <Text fontSize="lg" fontWeight="bold" textTransform="capitalize" color={textColor}>
                {subscription?.status}
              </Text>
            </VStack>
            <VStack align="start" flex={1} spacing={1}>
              <Text fontSize="sm" color={mutedColor}>Billing Period</Text>
              <Text fontSize="lg" fontWeight="bold" textTransform="capitalize" color={textColor}>
                {plan?.interval}
              </Text>
            </VStack>
            <VStack align="start" flex={1} spacing={1}>
              <Text fontSize="sm" color={mutedColor}>Next Billing</Text>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {subscription ? formatDate(subscription.currentPeriodEnd) : 'N/A'}
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                {daysRemaining > 0 && `${daysRemaining} days remaining`}
              </Text>
            </VStack>
          </Flex>
        </Card>

        <SubscriptionActions
          isCanceling={subscription?.cancelAtPeriodEnd || false}
          isLoading={actionLoading}
          onCancel={() => setCancelDialogOpen(true)}
          onReactivate={reactivate}
          onManage={openPortal}
        />
      </VStack>

      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          if (!actionLoading) {
            setCancelDialogOpen(false);
          }
        }}
        onConfirm={handleCancel}
        title="Cancel subscription"
        description="Your subscription will remain active until the end of this billing period."
        confirmLabel="Cancel Subscription"
        cancelLabel="Keep Subscription"
        isLoading={actionLoading}
        colorScheme="orange"
      />
    </Card>
  );
}

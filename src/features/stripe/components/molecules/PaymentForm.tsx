import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { MdLock } from 'react-icons/md';
import { useStripePayment } from '../../hooks/useStripePayment';

interface PaymentFormProps {
  onSuccess?: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const { confirmPayment, processing, ready } = useStripePayment({ onSuccess });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await confirmPayment();
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box
          p={6}
          borderRadius="16px"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <PaymentElement options={{ layout: 'tabs' }} />
        </Box>

        <Button
          type="submit"
          isLoading={processing}
          isDisabled={!ready}
          w="full"
          h="54px"
          fontSize="md"
          fontWeight="bold"
          borderRadius="45px"
          bgGradient="linear(to-r, #FA500F, #FF8205)"
          color="white"
          _hover={{
            bgGradient: 'linear(to-r, #FF8205, #FA500F)',
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
        >
          <Flex align="center" gap={2}>
            <Icon as={MdLock} />
            <Text>Complete Payment</Text>
          </Flex>
        </Button>

        <Flex justify="center" align="center" gap={2} color="gray.500" fontSize="sm">
          <Icon as={MdLock} />
          <Text>Secured by Stripe</Text>
        </Flex>
      </VStack>
    </form>
  );
}


import { Box, Container, Heading, Text, VStack, Spinner, Flex, Button } from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { getStripe, stripeElementsAppearance } from '../../api/stripeConfig';
import { useCheckout } from '../../hooks/useCheckout';
import { PaymentForm } from '../molecules/PaymentForm';
import { PriceDisplay } from '../atoms/PriceDisplay';
import Card from '@/components/card/Card';

interface CheckoutContainerProps {
  priceId: string;
}

export function CheckoutContainer({ priceId }: CheckoutContainerProps) {
  const router = useRouter();
  const { clientSecret, planData, loading, error } = useCheckout(priceId);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#FA500F" thickness="4px" />
          <Text>Preparing checkout...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error || !clientSecret) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Card p={8}>
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">Unable to Initialize Checkout</Text>
            <Text color="red.500">{error}</Text>
            <Button variant="primary" onClick={() => router.push('/subscription')}>
              Back to Plans
            </Button>
          </VStack>
        </Card>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="600px">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading
              bgGradient="linear(to-r, #FA500F, #FF8205)"
              bgClip="text"
              fontSize="4xl"
              mb={2}
            >
              Complete Your Subscription
            </Heading>
            <Text color="gray.600">Secure payment powered by Stripe</Text>
          </Box>

          {planData && (
            <Card p={6}>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Selected Plan</Text>
                <Heading size="md">{planData.productName}</Heading>
                <PriceDisplay
                  amount={planData.amount}
                  currency={planData.currency}
                  interval={planData.interval}
                  size="lg"
                />
              </VStack>
            </Card>
          )}

          <Card p={8}>
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: stripeElementsAppearance,
              }}
            >
              <PaymentForm onSuccess={() => router.push('/my-plan?success=true')} />
            </Elements>
          </Card>

          <Flex justify="center">
            <Button variant="ghost" onClick={() => router.push('/subscription')}>
              ← Back to Plans
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}


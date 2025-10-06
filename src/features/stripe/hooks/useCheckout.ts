import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { subscriptionApi } from '../api/subscriptionApi';

interface CheckoutState {
  clientSecret: string | null;
  planData: any | null;
  loading: boolean;
  error: string | null;
}

export function useCheckout(priceId: string) {
  const [state, setState] = useState<CheckoutState>({
    clientSecret: null,
    planData: null,
    loading: true,
    error: null,
  });
  const toast = useToast();

  useEffect(() => {
    if (!priceId) return;

    const initialize = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [checkout, details] = await Promise.all([
          subscriptionApi.createCheckoutSession(priceId),
          subscriptionApi.getPriceDetails(priceId),
        ]);

        setState({
          clientSecret: checkout.clientSecret,
          planData: details,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to initialize checkout';
        setState({
          clientSecret: null,
          planData: null,
          loading: false,
          error: errorMessage,
        });
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initialize();
  }, [priceId, toast]);

  return state;
}


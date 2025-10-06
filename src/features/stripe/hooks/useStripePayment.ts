import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@chakra-ui/react';

interface PaymentOptions {
  returnUrl?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useStripePayment(options: PaymentOptions = {}) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);

  const confirmPayment = async () => {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized');
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:
            options.returnUrl || `${window.location.origin}/my-plan?success=true`,
        },
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        options.onError?.(new Error(error.message));
        return { success: false, error };
      }

      options.onSuccess?.();
      return { success: true, error: null };
    } catch (err: any) {
      const error = new Error(err.message || 'Payment failed');
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      options.onError?.(error);
      return { success: false, error };
    } finally {
      setProcessing(false);
    }
  };

  return {
    confirmPayment,
    processing,
    ready: Boolean(stripe && elements),
  };
}


import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionData {
  hasSubscription: boolean;
  user: {
    email: string;
    isActive: boolean;
  };
  subscription?: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    created: number;
  };
  plan?: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/subscription-status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscriptionData(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subscription data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cancelSubscription = useCallback(async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will be canceled at the end of the billing period',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh subscription data
      await fetchSubscriptionStatus();
      
      return data;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [toast, fetchSubscriptionStatus]);

  const reactivateSubscription = useCallback(async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      const data = await response.json();

      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been reactivated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh subscription data
      await fetchSubscriptionStatus();
      
      return data;
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [toast, fetchSubscriptionStatus]);

  const openBillingPortal = useCallback(async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to open billing portal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setActionLoading(false);
      throw error;
    }
  }, [toast]);

  const subscribe = useCallback(async (
    productId: string,
    priceId: string,
    user: { name?: string; email?: string }
  ) => {
    try {
      setActionLoading(true);
      
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          productId,
          priceId,
          recurring: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await res.json();
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setActionLoading(false);
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    subscriptionData,
    loading,
    actionLoading,
    fetchSubscriptionStatus,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
    subscribe,
  };
}


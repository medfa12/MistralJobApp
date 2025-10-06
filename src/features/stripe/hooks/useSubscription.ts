import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { subscriptionApi } from '../api/subscriptionApi';
import type { SubscriptionData } from '../types/stripe.types';

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await subscriptionApi.getSubscriptionStatus();
      setData(result);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cancel = useCallback(async () => {
    try {
      setActionLoading(true);
      await subscriptionApi.cancelSubscription();
      toast({
        title: 'Subscription Canceled',
        description: 'Active until end of billing period',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [toast, fetchStatus]);

  const reactivate = useCallback(async () => {
    try {
      setActionLoading(true);
      await subscriptionApi.reactivateSubscription();
      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription is now active',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [toast, fetchStatus]);

  const openPortal = useCallback(async () => {
    try {
      setActionLoading(true);
      const { url } = await subscriptionApi.createPortalSession();
      window.location.href = url;
    } catch (error: any) {
      const isPortalNotConfigured = error.message?.includes('Portal not configured') || 
                                      error.message?.includes('not yet configured');
      
      toast({
        title: isPortalNotConfigured ? 'Feature Not Available' : 'Error',
        description: isPortalNotConfigured 
          ? 'The billing portal is being set up. You can manage your subscription from this page.' 
          : error.message,
        status: isPortalNotConfigured ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      });
      setActionLoading(false);
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    loading,
    actionLoading,
    refetch: fetchStatus,
    cancel,
    reactivate,
    openPortal,
  };
}


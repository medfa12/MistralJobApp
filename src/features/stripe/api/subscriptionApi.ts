import type { SubscriptionData, CheckoutSession } from '../types/stripe.types';

class SubscriptionAPI {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.message || error.error || `Request failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getSubscriptionStatus(): Promise<SubscriptionData> {
    return this.request<SubscriptionData>('/api/stripe/subscription-status');
  }

  async createCheckoutSession(priceId: string): Promise<CheckoutSession> {
    return this.request<CheckoutSession>('/api/stripe/create-subscription-intent', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });
  }

  async cancelSubscription(): Promise<{ success: boolean }> {
    return this.request('/api/stripe/cancel-subscription', {
      method: 'POST',
    });
  }

  async reactivateSubscription(): Promise<{ success: boolean }> {
    return this.request('/api/stripe/reactivate-subscription', {
      method: 'POST',
    });
  }

  async createPortalSession(): Promise<{ url: string }> {
    return this.request('/api/stripe/create-portal-session', {
      method: 'POST',
    });
  }

  async getPriceDetails(priceId: string) {
    return this.request(`/api/stripe/price-details?priceId=${priceId}`);
  }
}

export const subscriptionApi = new SubscriptionAPI();


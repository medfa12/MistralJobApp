export interface Price {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  default_price: string;
  prices?: Price[];
}

export interface SubscriptionPlan {
  priceId: string;
  productId: string;
  productName: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  created: number;
}

export interface SubscriptionData {
  hasSubscription: boolean;
  user: {
    email: string;
    isActive: boolean;
  };
  subscription?: Subscription;
  plan?: SubscriptionPlan;
}

export interface CheckoutSession {
  subscriptionId: string;
  clientSecret: string;
}

export type SubscriptionAction = 'cancel' | 'reactivate' | 'portal';


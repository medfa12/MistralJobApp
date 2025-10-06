import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Missing Stripe publishable key');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const stripeElementsAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#FA500F',
    colorBackground: '#ffffff',
    colorText: '#2D3748',
    colorDanger: '#E53E3E',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '12px',
  },
  rules: {
    '.Input': {
      border: '1px solid #E2E8F0',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #FA500F',
      boxShadow: '0 0 0 3px rgba(250, 80, 15, 0.1)',
    },
    '.Label': {
      fontWeight: '600',
      marginBottom: '8px',
    },
  },
};


export const PLAN_COLORS = {
  free: {
    border: '#718096',
    gradient: 'linear-gradient(135deg, #718096 0%, #A0AEC0 100%)',
    name: 'Free',
  },
  basic: {
    border: '#3182CE',
    gradient: 'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)',
    name: 'Basic',
  },
  premium: {
    border: '#FA500F',
    gradient: 'linear-gradient(135deg, #FA500F 0%, #FF8205 100%)',
    name: 'Premium',
  },
  enterprise: {
    border: '#805AD5',
    gradient: 'linear-gradient(135deg, #805AD5 0%, #D6BCFA 100%)',
    name: 'Enterprise',
  },
} as const;

export type PlanTier = keyof typeof PLAN_COLORS;

export function getPlanFromPriceId(priceId?: string | null): PlanTier {
  if (!priceId) return 'free';
  
  const priceLower = priceId.toLowerCase();
  
  if (priceLower.includes('basic')) return 'basic';
  if (priceLower.includes('premium') || priceLower.includes('pro')) return 'premium';
  if (priceLower.includes('enterprise') || priceLower.includes('business')) return 'enterprise';
  
  return 'free';
}

export function getPlanColor(stripePriceId?: string | null, isActive?: boolean): {
  border: string;
  gradient: string;
  name: string;
} {
  if (!isActive || !stripePriceId) {
    return PLAN_COLORS.free;
  }
  
  const plan = getPlanFromPriceId(stripePriceId);
  return PLAN_COLORS[plan];
}


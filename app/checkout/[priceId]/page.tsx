'use client';

import { useParams } from 'next/navigation';
import { CheckoutContainer } from '@/features/stripe';

export default function CheckoutPage() {
  const params = useParams();
  const priceId = params?.priceId as string;

  if (!priceId) {
    return null;
  }

  return <CheckoutContainer priceId={priceId} />;
}

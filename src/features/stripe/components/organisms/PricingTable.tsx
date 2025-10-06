import { SimpleGrid } from '@chakra-ui/react';
import { PlanCard } from '../molecules/PlanCard';
import type { Product } from '../../types/stripe.types';

interface PricingTableProps {
  products: Product[];
  onSelectPlan: (priceId: string) => void;
  isLoading?: boolean;
}

export function PricingTable({ products, onSelectPlan, isLoading }: PricingTableProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
      {products.map((product) => (
        <PlanCard
          key={product.id}
          product={product}
          onSelect={onSelectPlan}
          isLoading={isLoading}
        />
      ))}
    </SimpleGrid>
  );
}


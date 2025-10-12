'use client';

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PricingTable } from '@/features/stripe';
import type { Product } from '@/features/stripe/types/stripe.types';

export default function SubscriptionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/stripe/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSelectPlan = (priceId: string) => {
    router.push(`/checkout/${priceId}`);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={16}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Box textAlign="center">
            <Heading
              fontSize="5xl"
              bgGradient="linear(to-r, #FA500F, #FF8205)"
              bgClip="text"
              mb={4}
            >
              Choose Your Plan
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
              Select the perfect plan for your needs. All plans include full access to
              Mistral AI models.
            </Text>
          </Box>

          <PricingTable
            products={products}
            onSelectPlan={handleSelectPlan}
            isLoading={loading}
          />
        </VStack>
      </Container>
    </Box>
  );
}

import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { PriceDisplay } from '../atoms/PriceDisplay';
import type { Product } from '../../types/stripe.types';

interface PlanCardProps {
  product: Product;
  onSelect: (priceId: string) => void;
  isLoading?: boolean;
}

export function PlanCard({ product, onSelect, isLoading }: PlanCardProps) {
  const priceId = typeof product.default_price === 'string' 
    ? product.default_price 
    : (product.default_price as any)?.id;

  return (
    <Box
      borderRadius="16px"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
      bg="white"
      shadow="lg"
      transition="all 0.3s"
      _hover={{
        shadow: 'xl',
        transform: 'translateY(-4px)',
      }}
    >
      <Box
        bgGradient="linear(to-br, #000000, #2D3748)"
        p={8}
        color="white"
        minH="200px"
      >
        <VStack align="start" spacing={4} h="full" justify="space-between">
          <Box>
            <Heading size="md" mb={2}>
              {product.name}
            </Heading>
            <Text fontSize="sm" opacity={0.9}>
              {product.description}
            </Text>
          </Box>
        </VStack>
      </Box>

      <Box p={6}>
        <Button
          onClick={() => onSelect(priceId)}
          isLoading={isLoading}
          w="full"
          h="50px"
          borderRadius="45px"
          bgGradient="linear(to-r, #FA500F, #FF8205)"
          color="white"
          fontWeight="bold"
          _hover={{
            bgGradient: 'linear(to-r, #FF8205, #FA500F)',
            transform: 'scale(1.02)',
          }}
          _active={{
            transform: 'scale(0.98)',
          }}
        >
          Subscribe
        </Button>
      </Box>
    </Box>
  );
}


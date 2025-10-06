'use client';

import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Card from '@/components/card/Card';

interface ContentProps {
  userName?: string;
  userAddress?: string;
  planPrice?: string;
  onCancel?: () => void;
  onChangePlan?: () => void;
  isLoading?: boolean;
}

export default function Content({
  userName = 'User',
  userAddress = 'Address not available',
  planPrice = '$0.00',
  onCancel,
  onChangePlan,
  isLoading = false,
}: ContentProps) {
  const textColor = useColorModeValue('navy.700', 'white');
  const textSecondaryColor = useColorModeValue('gray.500', 'white');
  const bgCard = useColorModeValue('white', 'navy.700');

  return (
    <Flex direction="column" p={{ base: '10px', md: '60px' }}>
      <Card bg={bgCard} backgroundRepeat="no-repeat" p="30px" mb="30px" mt="-100px">
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Flex direction="column" me="auto">
            <Text color={textColor} fontSize="xl" fontWeight="700">
              {userName}
            </Text>
            <Text
              w="max-content"
              mb="10px"
              fontSize="md"
              color={textSecondaryColor}
              fontWeight="400"
              lineHeight="24px"
            >
              {userAddress}
            </Text>
          </Flex>
          <Text my="auto" color={textColor} fontSize="36px" fontWeight="700">
            {planPrice}
          </Text>
        </Flex>
      </Card>

      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="right"
        mt="50px"
      >
        {onCancel && (
          <Button
            variant="red"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            w={{ base: '100%', md: '210px' }}
            h="54px"
            onClick={onCancel}
            isLoading={isLoading}
          >
            Cancel Subscription
          </Button>
        )}
        {onChangePlan && (
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            mt={{ base: '20px', md: '0px' }}
            w={{ base: '100%', md: '210px' }}
            h="54px"
            onClick={onChangePlan}
            isLoading={isLoading}
          >
            Change Plan
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

'use client';

import { FC } from 'react';
import { Box, Flex, Text, useColorModeValue, Icon, Spinner } from '@chakra-ui/react';
import { MdCode } from 'react-icons/md';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface ArtifactLoadingCardProps {
  operation?: string;
  title?: string;
}

export const ArtifactLoadingCard: FC<ArtifactLoadingCardProps> = ({ 
  operation = 'create',
  title = 'artifact'
}) => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const getLoadingText = () => {
    switch (operation) {
      case 'create':
        return 'Crafting artifact...';
      case 'edit':
        return 'Updating artifact...';
      case 'revert':
        return 'Reverting artifact...';
      default:
        return 'Processing...';
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // @ts-ignore
      transition={{ duration: 0.3 }}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="12px"
      p="16px"
      mb="10px"
    >
      <Flex align="center" gap="12px">
        <Flex
          bg="blue.500"
          borderRadius="8px"
          w="40px"
          h="40px"
          align="center"
          justify="center"
          position="relative"
        >
          <Icon as={MdCode} color="white" boxSize="20px" />
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            bg="white"
            borderRadius="full"
            p="2px"
          >
            <Spinner size="xs" color="blue.500" thickness="2px" speed="0.8s" />
          </Box>
        </Flex>

        <Box flex="1">
          <Text fontSize="sm" fontWeight="600" color={textColor} mb="2px">
            {getLoadingText()}
          </Text>
          {title && (
            <Text fontSize="xs" color={subtextColor} noOfLines={1}>
              {title}
            </Text>
          )}
        </Box>
      </Flex>
    </MotionBox>
  );
};

export default ArtifactLoadingCard;

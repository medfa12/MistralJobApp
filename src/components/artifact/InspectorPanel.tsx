'use client';

import { FC } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { inspectorPanelVariants } from './animations';
import { InspectedElement } from './PreviewView';

interface Props {
  element: InspectedElement | null;
  isVisible: boolean;
}

const MotionBox = motion(Box);

export const InspectorPanel: FC<Props> = ({ element, isVisible }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const classBgColor = useColorModeValue('gray.100', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <AnimatePresence>
      {isVisible && element && (
        <MotionBox
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          w="300px"
          bg={bgColor}
          borderLeft="1px solid"
          borderColor={borderColor}
          p={4}
          overflowY="auto"
          zIndex={1000}
          variants={inspectorPanelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <VStack align="stretch" spacing={4}>
            {}
            <Box>
              <Text fontSize="xs" color={labelColor} mb={1}>
                Selected Element
              </Text>
              <Badge
                colorScheme="orange"
                fontSize="md"
                px={2}
                py={1}
                borderRadius="md"
              >
                {element.tagName}
              </Badge>
            </Box>

            <Divider />

            {}
            {element.id && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={1}>
                  ID
                </Text>
                <Text fontSize="sm" color={textColor} fontFamily="mono">
                  #{element.id}
                </Text>
              </Box>
            )}

            {}
            {element.className && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Classes
                </Text>
                <VStack align="stretch" spacing={1}>
                  {element.className.split(' ').filter(Boolean).map((cls, idx) => (
                    <Text
                      key={idx}
                      fontSize="sm"
                      color={textColor}
                      fontFamily="mono"
                      bg={classBgColor}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      .{cls}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            <Divider />

            {}
            {element.dimensions && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Dimensions
                </Text>
                <VStack align="stretch" spacing={1}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={labelColor}>
                      Width:
                    </Text>
                    <Text fontSize="sm" color={textColor} fontFamily="mono">
                      {element.dimensions.width.toFixed(2)}px
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={labelColor}>
                      Height:
                    </Text>
                    <Text fontSize="sm" color={textColor} fontFamily="mono">
                      {element.dimensions.height.toFixed(2)}px
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            {}
            {element.position && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Position
                </Text>
                <VStack align="stretch" spacing={1}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={labelColor}>
                      X:
                    </Text>
                    <Text fontSize="sm" color={textColor} fontFamily="mono">
                      {element.position.x.toFixed(2)}px
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={labelColor}>
                      Y:
                    </Text>
                    <Text fontSize="sm" color={textColor} fontFamily="mono">
                      {element.position.y.toFixed(2)}px
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            <Divider />

            {}
            {element.styles && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Computed Styles
                </Text>
                <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                  {['color', 'backgroundColor', 'fontSize', 'fontWeight', 'display', 'padding', 'margin'].map(
                    (prop) => {
                      const value = element.styles?.[prop as any];
                      if (!value || value === 'none' || value === '') return null;
                      return (
                        <HStack key={prop} justify="space-between" fontSize="xs">
                          <Text color={labelColor}>{prop}:</Text>
                          <Text
                            color={textColor}
                            fontFamily="mono"
                            maxW="150px"
                            isTruncated
                          >
                            {value}
                          </Text>
                        </HStack>
                      );
                    }
                  )}
                </VStack>
              </Box>
            )}

            {}
            {element.path && element.path.length > 0 && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Element Path
                </Text>
                <Text fontSize="xs" color={textColor} fontFamily="mono" wordBreak="break-all">
                  {element.path.join(' > ')}
                </Text>
              </Box>
            )}
          </VStack>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

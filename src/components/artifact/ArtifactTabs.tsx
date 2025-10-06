'use client';

import React, { FC } from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  IconButton,
  Badge,
  Tooltip,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { MdClose, MdPushPin, MdCode } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactInstance } from '@/hooks/useMultipleArtifacts';

interface Props {
  artifacts: ArtifactInstance[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const MotionBox = motion(Box);

export const ArtifactTabs: FC<Props> = ({
  artifacts,
  activeId,
  onSelect,
  onClose,
  onTogglePin,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('orange.50', 'orange.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  if (artifacts.length === 0) return null;

  const getArtifactBadgeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      react: 'blue',
      html: 'green',
      javascript: 'yellow',
      vue: 'teal',
    };
    return colorMap[type] || 'gray';
  };

  return (
    <Flex
      overflowX="auto"
      overflowY="hidden"
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={bgColor}
      py={1}
      px={2}
      gap={2}
      css={{
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: borderColor,
          borderRadius: '3px',
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {artifacts.map((instance) => {
          const isActive = instance.artifact.identifier === activeId;
          
          return (
            <MotionBox
              key={instance.artifact.identifier}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              // @ts-ignore - Framer Motion transition prop conflicts with Chakra
              transition={{ duration: 0.2 }}
            >
              <Flex
                align="center"
                gap={2}
                px={3}
                py={2}
                borderRadius="md"
                bg={isActive ? activeBg : 'transparent'}
                _hover={{ bg: isActive ? activeBg : hoverBg }}
                cursor="pointer"
                onClick={() => onSelect(instance.artifact.identifier)}
                border="1px solid"
                borderColor={isActive ? 'orange.400' : 'transparent'}
                minW="150px"
                maxW="250px"
                position="relative"
              >
                {/* Artifact Icon */}
                <Icon 
                  as={MdCode} 
                  boxSize={4} 
                  color={isActive ? 'orange.500' : 'gray.500'}
                  flexShrink={0}
                />

                {/* Artifact Info */}
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? 'bold' : 'medium'}
                    color={textColor}
                    noOfLines={1}
                  >
                    {instance.artifact.title}
                  </Text>
                  <HStack spacing={1} mt={0.5}>
                    <Badge
                      colorScheme={getArtifactBadgeColor(instance.artifact.type)}
                      fontSize="xs"
                      px={1}
                    >
                      {instance.artifact.type}
                    </Badge>
                    {instance.artifact.versions && instance.artifact.versions.length > 0 && (
                      <Badge colorScheme="purple" fontSize="xs" px={1}>
                        v{(instance.artifact.versions.length + 1)}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                {/* Pin Button */}
                <Tooltip label={instance.isPinned ? 'Unpin' : 'Pin'}>
                  <IconButton
                    aria-label={instance.isPinned ? 'Unpin artifact' : 'Pin artifact'}
                    icon={<Icon as={MdPushPin} />}
                    size="xs"
                    variant="ghost"
                    color={instance.isPinned ? 'orange.500' : 'gray.400'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(instance.artifact.identifier);
                    }}
                    flexShrink={0}
                  />
                </Tooltip>

                {/* Close Button */}
                <Tooltip label="Close">
                  <IconButton
                    aria-label="Close artifact"
                    icon={<Icon as={MdClose} boxSize={3} />}
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(instance.artifact.identifier);
                    }}
                    flexShrink={0}
                  />
                </Tooltip>

                {/* Active Indicator */}
                {isActive && (
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="2px"
                    bg="orange.500"
                  />
                )}
              </Flex>
            </MotionBox>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
};


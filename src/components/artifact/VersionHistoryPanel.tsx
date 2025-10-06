'use client';

import React, { FC } from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { MdHistory, MdRestore, MdCheck, MdCode } from 'react-icons/md';
import { ArtifactData, ArtifactVersion } from '@/types/types';
import { motion } from 'framer-motion';

interface Props {
  artifact: ArtifactData;
  onVersionSelect: (version: number) => void;
  currentVersion?: number;
}

const MotionBox = motion(Box);

export const VersionHistoryPanel: FC<Props> = ({ 
  artifact, 
  onVersionSelect,
  currentVersion 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('orange.50', 'orange.900');
  const activeBorder = useColorModeValue('orange.400', 'orange.500');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const versions = artifact.versions || [];
  const totalVersions = versions.length + 1;
  const activeVersion = currentVersion || artifact.currentVersion || totalVersions;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const getVersionDiff = (version: ArtifactVersion, prevVersion?: ArtifactVersion | null) => {
    if (!prevVersion) return { added: 0, removed: 0 };
    
    const currentLines = version.code.split('\n').length;
    const prevLines = prevVersion.code.split('\n').length;
    const diff = currentLines - prevLines;
    
    return {
      added: diff > 0 ? diff : 0,
      removed: diff < 0 ? Math.abs(diff) : 0,
    };
  };

  const allVersions = [
    ...versions.map((v, index) => ({
      number: index + 1,
      data: v,
      isCurrent: false,
    })),
    {
      number: totalVersions,
      data: {
        code: artifact.code,
        timestamp: artifact.updatedAt || artifact.createdAt,
        language: artifact.language,
        description: 'Current version',
      } as ArtifactVersion,
      isCurrent: true,
    },
  ].reverse();

  return (
    <VStack spacing={0} align="stretch" h="100%">
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={bgColor}
        align="center"
        gap={2}
      >
        <Icon as={MdHistory} boxSize={5} color="orange.500" />
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Version History
        </Text>
        <Badge colorScheme="orange" ml="auto">
          {totalVersions} Version{totalVersions > 1 ? 's' : ''}
        </Badge>
      </Flex>

      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={3} align="stretch">
          {allVersions.map((version, index) => {
            const isActive = version.number === activeVersion;
            const prevVersion = index < allVersions.length - 1 
              ? allVersions[index + 1].data 
              : null;
            const diff = getVersionDiff(version.data, prevVersion);

            return (
              <MotionBox
                key={version.number}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  p={4}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={isActive ? activeBorder : borderColor}
                  bg={isActive ? activeBg : bgColor}
                  cursor="pointer"
                  onClick={() => onVersionSelect(version.number)}
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? activeBg : hoverBg }}
                  position="relative"
                >
                  {/* Version Badge */}
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={isActive ? 'orange' : 'gray'}
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        v{version.number}
                      </Badge>
                      {version.isCurrent && (
                        <Badge colorScheme="green" fontSize="xs">
                          <HStack spacing={1}>
                            <Icon as={MdCheck} boxSize={3} />
                            <Text>LATEST</Text>
                          </HStack>
                        </Badge>
                      )}
                    </HStack>

                    {!version.isCurrent && (
                      <Tooltip label="Revert to this version">
                        <IconButton
                          aria-label="Revert to version"
                          icon={<Icon as={MdRestore} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVersionSelect(version.number);
                          }}
                        />
                      </Tooltip>
                    )}
                  </Flex>

                  {/* Timestamp */}
                  <Text fontSize="xs" color={mutedColor} mb={2}>
                    {formatDate(version.data.timestamp)}
                  </Text>

                  {/* Code Stats */}
                  <HStack spacing={4} fontSize="xs" color={textColor}>
                    <HStack spacing={1}>
                      <Icon as={MdCode} boxSize={3} />
                      <Text>{version.data.code.split('\n').length} lines</Text>
                    </HStack>
                    
                    {(diff.added > 0 || diff.removed > 0) && (
                      <>
                        {diff.added > 0 && (
                          <Badge colorScheme="green" fontSize="xs">
                            +{diff.added}
                          </Badge>
                        )}
                        {diff.removed > 0 && (
                          <Badge colorScheme="red" fontSize="xs">
                            -{diff.removed}
                          </Badge>
                        )}
                      </>
                    )}
                  </HStack>

                  {/* Active Indicator */}
                  {isActive && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg="orange.500"
                    />
                  )}
                </Box>
              </MotionBox>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};


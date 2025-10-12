'use client';

import React, { FC, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Grid,
  VStack,
  Code,
} from '@chakra-ui/react';
import { MdCompare, MdArrowForward } from 'react-icons/md';
import { ArtifactData, ArtifactVersion } from '@/types/types';

interface Props {
  artifact: ArtifactData;
  versionA: number;
  versionB: number;
}

export const VersionComparison: FC<Props> = ({ artifact, versionA, versionB }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const codeBg = useColorModeValue('gray.50', 'gray.900');

  const versions = artifact.versions || [];
  const totalVersions = versions.length + 1;

  const getVersionData = (versionNum: number): { code: string; timestamp: Date | string } => {
    if (versionNum === totalVersions) {
      return {
        code: artifact.code,
        timestamp: artifact.updatedAt || artifact.createdAt,
      };
    }
    return versions[versionNum - 1];
  };

  const versionAData = getVersionData(versionA);
  const versionBData = getVersionData(versionB);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const diff = useMemo(() => {
    const linesA = versionAData.code.split('\n').length;
    const linesB = versionBData.code.split('\n').length;
    const sizeDiff = linesB - linesA;

    return {
      lines: sizeDiff,
      added: sizeDiff > 0 ? sizeDiff : 0,
      removed: sizeDiff < 0 ? Math.abs(sizeDiff) : 0,
    };
  }, [versionAData, versionBData]);

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {}
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={bgColor}
        align="center"
        gap={3}
      >
        <Icon as={MdCompare} boxSize={5} color="orange.500" />
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Compare Versions
        </Text>

        <Flex align="center" gap={2} ml="auto">
          <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
            v{versionA}
          </Badge>
          <Icon as={MdArrowForward} color="gray.500" />
          <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
            v{versionB}
          </Badge>
        </Flex>
      </Flex>

      {}
      <Flex gap={4} px={4}>
        {diff.added > 0 && (
          <Badge colorScheme="green" fontSize="sm" px={3} py={2}>
            +{diff.added} lines added
          </Badge>
        )}
        {diff.removed > 0 && (
          <Badge colorScheme="red" fontSize="sm" px={3} py={2}>
            -{diff.removed} lines removed
          </Badge>
        )}
        {diff.lines === 0 && (
          <Badge colorScheme="gray" fontSize="sm" px={3} py={2}>
            No size change
          </Badge>
        )}
      </Flex>

      {}
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={4}
        flex={1}
        overflow="hidden"
        px={4}
        pb={4}
      >
        {}
        <Box
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Flex
            p={3}
            bg={bgColor}
            borderBottom="1px solid"
            borderColor={borderColor}
            justify="space-between"
            align="center"
          >
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              Version {versionA}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(versionAData.timestamp)}
            </Text>
          </Flex>
          <Box 
            flex={1} 
            overflow="auto" 
            bg={codeBg}
            p={4}
            fontFamily="mono"
            fontSize="sm"
            whiteSpace="pre-wrap"
          >
            <Code
              display="block"
              whiteSpace="pre"
              overflowX="auto"
              p={0}
              bg="transparent"
            >
              {versionAData.code}
            </Code>
          </Box>
        </Box>

        {}
        <Box
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Flex
            p={3}
            bg={bgColor}
            borderBottom="1px solid"
            borderColor={borderColor}
            justify="space-between"
            align="center"
          >
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              Version {versionB}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(versionBData.timestamp)}
            </Text>
          </Flex>
          <Box 
            flex={1} 
            overflow="auto" 
            bg={codeBg}
            p={4}
            fontFamily="mono"
            fontSize="sm"
            whiteSpace="pre-wrap"
          >
            <Code
              display="block"
              whiteSpace="pre"
              overflowX="auto"
              p={0}
              bg="transparent"
            >
              {versionBData.code}
            </Code>
          </Box>
        </Box>
      </Grid>
    </VStack>
  );
};

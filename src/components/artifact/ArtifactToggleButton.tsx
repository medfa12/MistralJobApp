'use client';

import { FC } from 'react';
import {
  Button,
  Flex,
  Text,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdCode, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ArtifactData } from '@/types/types';

interface Props {
  artifact: ArtifactData;
  isOpen: boolean;
  onClick: () => void;
}

const MotionButton = motion(Button);

export const ArtifactToggleButton: FC<Props> = ({ artifact, isOpen, onClick }) => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.300', 'blue.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('blue.100', 'blue.800');

  const badgeColor = getArtifactBadgeColor(artifact.type);

  return (
    <MotionButton
      onClick={onClick}
      bg={bgColor}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="12px"
      p={4}
      w="100%"
      h="auto"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      _hover={{ bg: hoverBg }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 } as any}
    >
      <Flex align="center" gap={3} flex={1} minW={0}>
        <Icon as={MdCode} boxSize={5} color="orange.500" flexShrink={0} />
        <Flex direction="column" align="start" flex={1} minW={0}>
          <Text
            fontWeight="bold"
            fontSize="sm"
            color={textColor}
            noOfLines={1}
            textAlign="left"
          >
            {artifact.title}
          </Text>
          <Flex gap={2} mt={1}>
            <Badge colorScheme={badgeColor} fontSize="xs">
              {artifact.type.toUpperCase()}
            </Badge>
            {artifact.updatedAt && (
              <Badge colorScheme="orange" fontSize="xs">
                UPDATED
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Icon
        as={isOpen ? MdExpandLess : MdExpandMore}
        boxSize={6}
        color={textColor}
        flexShrink={0}
        ml={2}
      />
    </MotionButton>
  );
};

function getArtifactBadgeColor(type: string): string {
  const colorMap: Record<string, string> = {
    react: 'blue',
    html: 'green',
    javascript: 'yellow',
    vue: 'teal',
  };
  return colorMap[type] || 'gray';
}

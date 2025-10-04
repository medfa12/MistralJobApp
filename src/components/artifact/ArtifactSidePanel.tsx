'use client';

import { FC } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { MdClose, MdCode } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactData, InspectedCodeAttachment } from '@/types/types';
import { ArtifactRenderer } from './ArtifactRenderer';

interface Props {
  artifact: ArtifactData | null;
  isOpen: boolean;
  onClose: () => void;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
}

const MotionBox = motion(Box);

export const ArtifactSidePanel: FC<Props> = ({ artifact, isOpen, onClose, onCodeAttach }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const overlayBg = 'blackAlpha.600';

  const badgeColor = artifact ? getArtifactBadgeColor(artifact.type) : 'gray';

  if (!artifact) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={overlayBg}
            zIndex={998}
            display={{ base: 'block', lg: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 } as any}
            onClick={onClose}
          />

          <MotionBox
            position="fixed"
            top={{ base: 0, lg: '80px' }}
            right={0}
            bottom={0}
            width={{ base: '100%', md: '90%', lg: '50%', xl: '45%' }}
            bg={bgColor}
            borderLeft={{ base: 'none', lg: '1px solid' }}
            borderLeftColor={borderColor}
            boxShadow={{ base: 'none', lg: '0 0 20px rgba(0, 0, 0, 0.1)' }}
            zIndex={999}
            display="flex"
            flexDirection="column"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            } as any}
          >
            <Flex
              p={4}
              borderBottom="1px solid"
              borderColor={borderColor}
              bg={headerBg}
              align="center"
              justify="space-between"
              flexShrink={0}
            >
              <Flex align="center" gap={3} flex={1} minW={0}>
                <Icon as={MdCode} boxSize={6} color="orange.500" flexShrink={0} />
                <Box flex={1} minW={0}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: 'md', md: 'lg' }}
                    color={textColor}
                    noOfLines={1}
                  >
                    {artifact.title}
                  </Text>
                  <Flex gap={2} mt={1} flexWrap="wrap">
                    <Badge colorScheme={badgeColor} fontSize="xs">
                      {artifact.type.toUpperCase()}
                    </Badge>
                    {artifact.updatedAt && (
                      <Badge colorScheme="orange" fontSize="xs">
                        UPDATED
                      </Badge>
                    )}
                    {artifact.versions && artifact.versions.length > 0 && (
                      <Badge colorScheme="purple" fontSize="xs">
                        V{artifact.currentVersion || artifact.versions.length + 1} 
                        ({artifact.versions.length + 1} version{artifact.versions.length + 1 === 1 ? '' : 's'})
                      </Badge>
                    )}
                  </Flex>
                </Box>
              </Flex>
              <IconButton
                aria-label="Close artifact panel"
                icon={<Icon as={MdClose} boxSize={5} />}
                onClick={onClose}
                variant="ghost"
                size="md"
                flexShrink={0}
                ml={2}
              />
            </Flex>

            <Box flex={1} overflow="hidden">
              <ArtifactRenderer artifact={artifact} onCodeAttach={onCodeAttach} />
            </Box>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
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


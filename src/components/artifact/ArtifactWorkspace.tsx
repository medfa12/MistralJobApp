'use client';

import { forwardRef, useState, useRef, useImperativeHandle, useId } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Text,
  Badge,
  useColorModeValue,
  Icon,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
} from '@chakra-ui/react';
import { MdClose, MdCode, MdChevronLeft, MdChevronRight, MdMoreVert, MdHistory, MdCompare, MdRestore, MdDescription, MdAdd, MdViewModule, MdCheck, MdSave } from 'react-icons/md';
import { ArtifactData, InspectedCodeAttachment } from '@/types/types';
import { ArtifactRenderer, ArtifactRendererRef } from './ArtifactRenderer';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { VersionComparison } from './VersionComparison';
import { motion } from 'framer-motion';

interface Props {
  artifact: ArtifactData | null;
  artifacts?: ArtifactData[];
  onClose: () => void;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
  onClearInspection?: () => void;
  onVersionChange?: (version: number) => void;
  onRevertToVersion?: (version: number) => void;
  onArtifactSwitch?: (identifier: string) => void;
  onArtifactDelete?: (identifier: string) => void;
  onDocumentChange?: (markdown: string) => void;
  onSaveVersion?: () => void;
}

export interface ArtifactWorkspaceRef {
  clearInspection: () => void;
}

const MotionBox = motion(Box);

export const ArtifactWorkspace = forwardRef<ArtifactWorkspaceRef, Props>(({ 
  artifact,
  artifacts = [],
  onClose,
  onCodeAttach,
  onClearInspection,
  onVersionChange,
  onRevertToVersion,
  onArtifactSwitch,
  onArtifactDelete,
  onDocumentChange,
  onSaveVersion
}, ref) => {
  const artifactRendererRef = useRef<ArtifactRendererRef>(null);
  const versionMenuId = useId();

  useImperativeHandle(ref, () => ({
    clearInspection: () => {
      artifactRendererRef.current?.clearInspection();
    }
  }), []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  // Hoisted color mode values to comply with Rules of Hooks
  const selectorBg = useColorModeValue('gray.50', 'gray.900');
  const switchHoverBg = useColorModeValue('orange.50', 'orange.900');
  const switchActiveBg = useColorModeValue('orange.100', 'orange.800');
  const menuBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const scrollThumbBg = useColorModeValue('gray.300', 'gray.600');
  const itemActiveBg = useColorModeValue('orange.50', 'orange.900');
  const itemActiveHoverBg = useColorModeValue('orange.100', 'orange.800');
  const itemInactiveHoverBg = useColorModeValue('gray.100', 'gray.700');

  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isCompareOpen, onOpen: onCompareOpen, onClose: onCompareClose } = useDisclosure();
  const [compareVersions, setCompareVersions] = useState<[number, number]>([1, 2]);

  const badgeColor = artifact ? getArtifactBadgeColor(artifact.type) : 'gray';

  if (!artifact) {
    return (
      <Flex
        h="100%"
        align="center"
        justify="center"
        bg={bgColor}
        direction="column"
        gap={4}
      >
        <Icon as={MdCode} boxSize={16} color="gray.400" />
        <Text color="gray.500" fontSize="lg">
          No artifact selected
        </Text>
        <Text color="gray.400" fontSize="sm">
          Create or select an artifact to view it here
        </Text>
      </Flex>
    );
  }
  const currentVersion = artifact.currentVersion || (artifact.versions ? artifact.versions.length + 1 : 1);
  const totalVersions = (artifact.versions?.length || 0) + 1;
  const hasVersionHistory = totalVersions > 1;

  const handleVersionSelect = (version: number) => {
    if (onRevertToVersion) {
      onRevertToVersion(version);
    }
    onHistoryClose();
  };

  const navigateVersion = (version: number) => {
    if (onRevertToVersion && version >= 1 && version <= totalVersions) {
      onRevertToVersion(version);
    }
  };

  const handleCompareVersions = () => {
    if (totalVersions >= 2) {
      setCompareVersions([Math.max(1, totalVersions - 1), totalVersions]);
      onCompareOpen();
    }
  };

  return (
    <Flex direction="column" h="100%" bg={bgColor}>
      {/* Header */}
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
              {hasVersionHistory && (
                <Badge colorScheme="purple" fontSize="xs">
                  V{currentVersion} / {totalVersions}
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>

        {/* Version Navigation */}
        {hasVersionHistory && (
          <HStack spacing={1} mr={2}>
            <Tooltip label="Previous Version">
              <IconButton
                aria-label="Previous version"
                icon={<Icon as={MdChevronLeft} />}
                size="sm"
                variant="ghost"
                isDisabled={currentVersion === 1}
                onClick={() => navigateVersion(currentVersion - 1)}
              />
            </Tooltip>

            <Text fontSize="sm" fontFamily="mono" minW="60px" textAlign="center">
              {currentVersion} / {totalVersions}
            </Text>

            <Tooltip label="Next Version">
              <IconButton
                aria-label="Next version"
                icon={<Icon as={MdChevronRight} />}
                size="sm"
                variant="ghost"
                isDisabled={currentVersion === totalVersions}
                onClick={() => navigateVersion(currentVersion + 1)}
              />
            </Tooltip>

            <Menu id={versionMenuId}>
              <MenuButton
                as={IconButton}
                icon={<Icon as={MdMoreVert} />}
                size="sm"
                variant="ghost"
                aria-label="Version options"
              />
              <MenuList>
                <MenuItem icon={<MdHistory />} onClick={onHistoryOpen}>
                  View Full History
                </MenuItem>
                <MenuItem 
                  icon={<MdCompare />} 
                  onClick={handleCompareVersions}
                  isDisabled={!hasVersionHistory}
                >
                  Compare Versions
                </MenuItem>
                <MenuItem 
                  icon={<MdRestore />} 
                  isDisabled={currentVersion === totalVersions}
                  onClick={() => onRevertToVersion && onRevertToVersion(currentVersion)}
                >
                  Revert to This Version
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        )}

        {/* Save Version for document artifacts */}
        {artifact.type === 'document' && (
          <Tooltip label="Save Version Snapshot">
            <IconButton
              aria-label="Save version"
              icon={<Icon as={MdSave} />}
              onClick={() => onSaveVersion?.()}
              variant="solid"
              size="sm"
              colorScheme="orange"
              mr={2}
            />
          </Tooltip>
        )}

        <IconButton
          aria-label="Close artifact workspace"
          icon={<Icon as={MdClose} boxSize={5} />}
          onClick={onClose}
          variant="ghost"
          size="md"
          flexShrink={0}
        />
      </Flex>

      {/* Artifact Selector - Show only if multiple artifacts */}
      {artifacts.length > 1 && (
        <Flex
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor={borderColor}
          bg={selectorBg}
          align="center"
          gap={2}
        >
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<Icon as={MdViewModule} />}
              rightIcon={<Icon as={MdChevronRight} transform="rotate(90deg)" />}
              size="sm"
              variant="outline"
              borderColor="orange.400"
              color={textColor}
              _hover={{ bg: switchHoverBg }}
              _active={{ bg: switchActiveBg }}
            >
              Switch Artifacts ({artifacts.length})
            </MenuButton>
            <MenuList
              maxH="400px"
              overflowY="auto"
              p={3}
              borderRadius="xl"
              boxShadow="2xl"
              bg={menuBg}
              border="1px solid"
              borderColor={borderColor}
              backdropFilter="blur(20px) saturate(180%)"
              position="relative"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: scrollThumbBg,
                  borderRadius: '3px',
                },
              }}
            >
              {artifacts.map((art, index) => {
                const isActive = art.identifier === artifact?.identifier;
                const artIcon = art.type === 'markdown' || art.type === 'document' ? MdDescription : MdCode;
                const activeIndex = artifacts.findIndex(a => a.identifier === artifact?.identifier);
                const distance = Math.abs(activeIndex - index);
                const opacity = Math.max(0.3, 1 - (distance * 0.15));

                return (
                  <MenuItem
                    key={art.identifier}
                    onClick={() => onArtifactSwitch?.(art.identifier)}
                    borderRadius="lg"
                    mb={2}
                    p={3}
                    bg={isActive ? itemActiveBg : 'transparent'}
                    _hover={{
                      bg: isActive ? itemActiveHoverBg : itemInactiveHoverBg,
                      transform: 'translateX(4px)',
                      opacity: 1,
                    }}
                    position="relative"
                    opacity={opacity}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    transform={isActive ? 'scale(1.02)' : 'scale(1)'}
                    boxShadow={isActive ? '0 4px 12px rgba(251, 146, 60, 0.3)' : 'none'}
                  >
                    <Flex align="center" gap={3} w="100%">
                      <Icon
                        as={artIcon}
                        boxSize={5}
                        color={isActive ? 'orange.500' : 'gray.500'}
                      />
                      <Box flex={1} minW={0}>
                        <Text
                          fontSize="sm"
                          fontWeight={isActive ? '600' : '500'}
                          color={isActive ? 'orange.500' : textColor}
                          noOfLines={1}
                        >
                          {art.title}
                        </Text>
                        <Flex gap={2} mt={1}>
                          <Badge colorScheme={isActive ? 'orange' : 'gray'} fontSize="xs">
                            {art.type}
                          </Badge>
                          {art.currentVersion && (
                            <Badge colorScheme="purple" fontSize="xs">
                              v{art.currentVersion}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                      {isActive && (
                        <Icon as={MdCheck} boxSize={5} color="orange.500" />
                      )}
                      <IconButton
                        aria-label="Delete artifact"
                        icon={<Icon as={MdClose} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${art.title}"?`)) {
                            onArtifactDelete?.(art.identifier);
                          }
                        }}
                      />
                    </Flex>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Text fontSize="xs" color="gray.500">
            {artifact?.title}
          </Text>
        </Flex>
      )}

      {/* Artifact Content */}
      <Box flex={1} overflow="hidden">
        <ArtifactRenderer
          ref={artifactRendererRef}
          artifact={artifact}
          onCodeAttach={onCodeAttach}
          onClearInspection={onClearInspection}
          onDocumentChange={onDocumentChange}
        />
      </Box>

      {/* Version History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>Version History</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <VersionHistoryPanel
              artifact={artifact}
              onVersionSelect={handleVersionSelect}
              currentVersion={currentVersion}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Version Comparison Modal */}
      <Modal isOpen={isCompareOpen} onClose={onCompareClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compare Versions</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <VersionComparison
              artifact={artifact}
              versionA={compareVersions[0]}
              versionB={compareVersions[1]}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
});

ArtifactWorkspace.displayName = 'ArtifactWorkspace';

function getArtifactBadgeColor(type: string): string {
  const colorMap: Record<string, string> = {
    react: 'blue',
    html: 'green',
    javascript: 'yellow',
    vue: 'teal',
    markdown: 'orange',
    document: 'purple',
  };
  return colorMap[type] || 'gray';
}

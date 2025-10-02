'use client';

import { FC, useState } from 'react';
import { Box, Flex, Icon, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCode, MdVisibility } from 'react-icons/md';
import { ArtifactData, InspectedCodeAttachment } from '@/types/types';
import { ArtifactTab } from './types';
import { CodeView } from './CodeView';
import { PreviewView } from './PreviewView';
import { tabContentVariants } from './animations';

interface Props {
  artifact: ArtifactData;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
}

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const ArtifactRenderer: FC<Props> = ({ artifact, onCodeAttach }) => {
  const [activeTab, setActiveTab] = useState<ArtifactTab>('code');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const activeTabBg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const activeIconColor = useColorModeValue('orange.500', 'orange.300');

  const tabs: { id: ArtifactTab; icon: any; label: string }[] = [
    { id: 'code', icon: MdCode, label: 'Code View' },
    { id: 'preview', icon: MdVisibility, label: 'Preview' },
  ];

  return (
    <Box
      w="100%"
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="lg"
    >
      {/* Tab Navigation */}
      <Flex
        bg={tabBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        p={2}
        gap={2}
      >
        {tabs.map((tab) => (
          <Tooltip key={tab.id} label={tab.label} placement="top">
            <MotionFlex
              align="center"
              justify="center"
              w="50px"
              h="50px"
              borderRadius="lg"
              cursor="pointer"
              bg={activeTab === tab.id ? activeTabBg : 'transparent'}
              color={activeTab === tab.id ? activeIconColor : iconColor}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              // @ts-ignore - framer-motion transition
              transition={{ duration: 0.2 }}
              boxShadow={
                activeTab === tab.id
                  ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                  : 'none'
              }
            >
              <Icon as={tab.icon} boxSize={6} />
            </MotionFlex>
          </Tooltip>
        ))}
      </Flex>

      {/* Tab Content */}
      <Box position="relative" minH="600px">
        <AnimatePresence mode="wait">
          {activeTab === 'code' && (
            <MotionBox
              key="code"
              p={4}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CodeView artifact={artifact} />
            </MotionBox>
          )}

          {activeTab === 'preview' && (
            <MotionBox
              key="preview"
              p={4}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PreviewView artifact={artifact} onCodeAttach={onCodeAttach} />
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};


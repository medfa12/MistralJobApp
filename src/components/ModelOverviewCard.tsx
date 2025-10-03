'use client';

import { ModelInfo, AttachmentType } from '@/config/models';
import { Box, Flex, Text, Icon, Badge, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdImage, MdAudiotrack, MdDescription, MdCheck } from 'react-icons/md';

interface ModelOverviewCardProps {
  model: ModelInfo;
  isVisible: boolean;
  position?: { x: number; y: number };
}

const MotionBox = motion(Box);

const getAttachmentIcon = (type: AttachmentType) => {
  switch (type) {
    case 'image':
      return MdImage;
    case 'audio':
      return MdAudiotrack;
    case 'document':
      return MdDescription;
  }
};

const getAttachmentLabel = (type: AttachmentType) => {
  switch (type) {
    case 'image':
      return 'Images';
    case 'audio':
      return 'Audio';
    case 'document':
      return 'Documents';
  }
};

export const ModelOverviewCard: React.FC<ModelOverviewCardProps> = ({
  model,
  isVisible,
  position,
}) => {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const badgeBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const accentColor = useColorModeValue('orange.500', 'orange.300');

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          // @ts-ignore
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          position="fixed"
          top={position?.y ? `${position.y + 10}px` : '100%'}
          left={position?.x ? `${position.x}px` : '50%'}
          transform="translateX(-50%)"
          zIndex="9999"
          pointerEvents="none"
          bg={cardBg}
          borderRadius="16px"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0px 18px 40px rgba(112, 144, 176, 0.25)"
          p="20px"
          minW="320px"
          maxW="400px"
          mt="10px"
        >
          <Flex align="center" mb="12px">
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={model.color}
              h="36px"
              w="36px"
              minW="36px"
              me="12px"
            >
              <Icon as={model.icon} width="18px" height="18px" color="white" />
            </Flex>
            <Box flex="1">
              <Text fontSize="lg" fontWeight="700" color={textColor} lineHeight="1.2">
                {model.displayName}
              </Text>
              <Text fontSize="xs" color={secondaryText}>
                v{model.version} • {model.apiEndpoint}
              </Text>
            </Box>
          </Flex>

          <Text fontSize="sm" color={secondaryText} mb="12px">
            {model.description}
          </Text>

          <Flex gap="8px" mb="12px" flexWrap="wrap">
            <Badge
              bg={badgeBg}
              color={textColor}
              fontSize="xs"
              px="8px"
              py="4px"
              borderRadius="6px"
            >
              {(model.contextWindow / 1000).toFixed(0)}K context
            </Badge>
            <Badge
              bg={badgeBg}
              color={textColor}
              fontSize="xs"
              px="8px"
              py="4px"
              borderRadius="6px"
            >
              {(model.maxOutput / 1000).toFixed(0)}K output
            </Badge>
          </Flex>

          <Box mb="12px" pb="12px" borderBottom="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" color={secondaryText} mb="4px">
              Pricing (per 1M tokens)
            </Text>
            <Flex gap="12px">
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="600">
                  ${model.pricing.input.toFixed(2)}
                </Text>{' '}
                input
              </Text>
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="600">
                  ${model.pricing.output.toFixed(2)}
                </Text>{' '}
                output
              </Text>
            </Flex>
          </Box>

          {model.supportedAttachments.length > 0 && (
            <Box mb="12px" pb="12px" borderBottom="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" color={secondaryText} mb="6px" fontWeight="600">
                Supported Attachments
              </Text>
              <Flex direction="column" gap="4px">
                {model.supportedAttachments.map((type) => {
                  const limits = model.attachmentLimits?.[type];
                  return (
                    <Flex key={type} align="center">
                      <Icon
                        as={getAttachmentIcon(type)}
                        color={accentColor}
                        boxSize="16px"
                        me="6px"
                      />
                      <Text fontSize="xs" color={textColor} flex="1">
                        {getAttachmentLabel(type)}
                      </Text>
                      {limits && (
                        <Text fontSize="xs" color={secondaryText}>
                          {limits.supportedFormats.join(', ')} • {limits.maxSize}MB
                        </Text>
                      )}
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          )}

          <Box>
            <Text fontSize="xs" color={secondaryText} mb="6px" fontWeight="600">
              Key Features
            </Text>
            <Flex direction="column" gap="4px">
              {model.features.slice(0, 4).map((feature, index) => (
                <Flex key={index} align="center">
                  <Icon as={MdCheck} color={accentColor} boxSize="14px" me="6px" />
                  <Text fontSize="xs" color={textColor}>
                    {feature}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};


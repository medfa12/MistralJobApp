'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Collapse,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAutoAwesome, MdBolt, MdPsychology, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { MistralModel } from '@/types/types';
import { MISTRAL_MODELS, getModelInfo } from '@/config/models';
import { ModelOverviewCard } from '@/components/ModelOverviewCard';

interface ModelSelectorProps {
  selectedModel: MistralModel;
  onModelChange: (model: MistralModel) => void;
}

const modelConfigs = [
  { id: 'mistral-small-latest' as MistralModel, label: 'Mistral Small', icon: MdAutoAwesome, width: '174px' },
  { id: 'mistral-large-latest' as MistralModel, label: 'Mistral Large', icon: MdBolt, width: '164px' },
  { id: 'magistral-small-latest' as MistralModel, label: 'Magistral Small', icon: MdPsychology, width: '200px' },
  { id: 'magistral-medium-latest' as MistralModel, label: 'Magistral Medium', icon: MdPsychology, width: '220px' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<MistralModel | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | undefined>();
  const modelButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const textColor = useColorModeValue('navy.700', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const buttonShadow = useColorModeValue('14px 27px 45px rgba(112, 144, 176, 0.2)', 'none');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FFFAEB 0%, #FFF0C3 100%)',
    'whiteAlpha.200',
  );
  const iconColor = useColorModeValue('brand.500', 'white');

  const handleModelHover = (modelId: MistralModel, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    };
    setHoverPosition(position);
    setHoveredModel(modelId);
  };

  const handleModelLeave = () => {
    setHoveredModel(null);
  };

  return (
    <Flex direction="column" w="100%" mb="10px" flexShrink={0}>
      <Flex
        mx="auto"
        zIndex="2"
        w="100%"
        maxW="1000px"
        mb="10px"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap="10px"
      >
        <Text color={textColor} fontSize="sm" fontWeight="600">
          Selected: {getModelInfo(selectedModel)?.displayName || selectedModel}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          rightIcon={<Icon as={isOpen ? MdExpandLess : MdExpandMore} />}
          color={textColor}
        >
          {isOpen ? 'Hide Models' : 'Change Model'}
        </Button>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box position="relative">
          <Flex
            mx="auto"
            zIndex="2"
            w="max-content"
            mb="20px"
            borderRadius="60px"
            flexWrap="wrap"
            gap="10px"
          >
            {modelConfigs.map((config) => (
              <Flex
                key={config.id}
                cursor="pointer"
                transition="0.3s"
                justify="center"
                align="center"
                bg={selectedModel === config.id ? buttonBg : 'transparent'}
                w={config.width}
                h="70px"
                boxShadow={selectedModel === config.id ? buttonShadow : 'none'}
                borderRadius="14px"
                color={textColor}
                fontSize="18px"
                fontWeight="700"
                onClick={() => onModelChange(config.id)}
                onMouseEnter={(e) => handleModelHover(config.id, e)}
                onMouseLeave={handleModelLeave}
                ref={(el) => (modelButtonRefs.current[config.id] = el)}
              >
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg={bgIcon}
                  me="10px"
                  h="39px"
                  w="39px"
                >
                  <Icon as={config.icon} width="20px" height="20px" color={iconColor} />
                </Flex>
                {config.label}
              </Flex>
            ))}
          </Flex>
          {hoveredModel && MISTRAL_MODELS[hoveredModel] && (
            <ModelOverviewCard
              model={MISTRAL_MODELS[hoveredModel]}
              isVisible={!!hoveredModel}
              position={hoverPosition}
            />
          )}
        </Box>
      </Collapse>
    </Flex>
  );
};


import { Box, Flex, Text, Icon, useColorModeValue, Badge } from '@chakra-ui/react';
import { MdCode, MdEdit, MdDelete, MdHistory, MdAdd } from 'react-icons/md';
import { ArtifactOperation, ArtifactType } from '@/types/types';

interface ToolCallBoxProps {
  operation: ArtifactOperation | string;
  artifactType?: ArtifactType;
  artifactTitle?: string;
  revertToVersion?: number;
}

const operationConfig: Record<string, { icon: any; label: string; colorScheme: string }> = {
  create: {
    icon: MdCode,
    label: 'Create Artifact',
    colorScheme: 'green',
  },
  edit: {
    icon: MdEdit,
    label: 'Edit Artifact',
    colorScheme: 'blue',
  },
  delete: {
    icon: MdDelete,
    label: 'Delete Artifact',
    colorScheme: 'red',
  },
  revert: {
    icon: MdHistory,
    label: 'Revert Artifact',
    colorScheme: 'purple',
  },
  insert_section: {
    icon: MdAdd,
    label: 'Add Section',
    colorScheme: 'green',
  },
  update_section: {
    icon: MdEdit,
    label: 'Update Section',
    colorScheme: 'blue',
  },
  delete_section: {
    icon: MdDelete,
    label: 'Remove Section',
    colorScheme: 'red',
  },
  apply_formatting: {
    icon: MdEdit,
    label: 'Format Text',
    colorScheme: 'orange',
  },
};

export default function ToolCallBox({ operation, artifactType, artifactTitle, revertToVersion }: ToolCallBoxProps) {
  const bgColor = useColorModeValue('orange.50', 'orange.900');
  const borderColor = useColorModeValue('orange.300', 'orange.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const config = operationConfig[operation] || operationConfig.edit;

  return (
    <Flex
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="12px"
      p="12px"
      gap="12px"
      align="center"
      mb="10px"
    >
      <Flex
        bg={`${config.colorScheme}.500`}
        borderRadius="8px"
        w="40px"
        h="40px"
        align="center"
        justify="center"
      >
        <Icon as={config.icon} color="white" boxSize="20px" />
      </Flex>
      
      <Box flex="1" minW="0">
        <Flex align="center" gap="8px" mb="4px">
          <Text fontSize="sm" fontWeight="600" color={textColor}>
            {config.label}
          </Text>
          <Badge colorScheme={config.colorScheme} fontSize="xs">
            {operation}
          </Badge>
        </Flex>
        
        {artifactTitle && (
          <Text fontSize="xs" color={subtextColor} noOfLines={1}>
            {artifactTitle}
          </Text>
        )}
        
        {artifactType && operation !== 'delete' && operation !== 'revert' && (
          <Text fontSize="xs" color={subtextColor}>
            Type: {artifactType}
          </Text>
        )}
        
        {operation === 'revert' && revertToVersion !== undefined && (
          <Text fontSize="xs" color={subtextColor}>
            Reverting to version {revertToVersion}
          </Text>
        )}
      </Box>
    </Flex>
  );
}


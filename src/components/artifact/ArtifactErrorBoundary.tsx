'use client';

import React, { Component, ReactNode } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  VStack,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdError, MdRefresh } from 'react-icons/md';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ArtifactErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Artifact Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('red.300', 'red.600');
  const textColor = useColorModeValue('red.800', 'red.100');
  const codeBlockBg = useColorModeValue('red.100', 'red.800');

  return (
    <Box
      p={6}
      bg={bgColor}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="xl"
      w="100%"
      minH="400px"
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center" gap={3}>
          <Icon as={MdError} boxSize={8} color="red.500" />
          <Box>
            <Text fontWeight="bold" fontSize="xl" color={textColor}>
              Artifact Rendering Failed
            </Text>
            <Text fontSize="sm" color={textColor} opacity={0.8}>
              Something went wrong while rendering this artifact
            </Text>
          </Box>
        </Flex>

        {error && (
          <Box
            p={4}
            bg={codeBlockBg}
            borderRadius="md"
            maxH="200px"
            overflow="auto"
          >
            <Text fontSize="xs" fontWeight="bold" color={textColor} mb={2}>
              Error Details:
            </Text>
            <Code
              fontSize="xs"
              colorScheme="red"
              bg="transparent"
              color={textColor}
              display="block"
              whiteSpace="pre-wrap"
              wordBreak="break-word"
            >
              {error.message}
            </Code>
          </Box>
        )}

        <Flex gap={3} mt={4}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={onReset}
            colorScheme="red"
            variant="solid"
            size="md"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            colorScheme="red"
            variant="outline"
            size="md"
          >
            Reload Page
          </Button>
        </Flex>

        <Box
          mt={4}
          p={3}
          bg={codeBlockBg}
          borderRadius="md"
          fontSize="xs"
          color={textColor}
          opacity={0.8}
        >
          <Text fontWeight="bold" mb={2}>
            💡 Troubleshooting Tips:
          </Text>
          <VStack align="stretch" spacing={1} pl={3}>
            <Text>• Check if the artifact code contains syntax errors</Text>
            <Text>• Ensure React components export as window.App</Text>
            <Text>• Verify HTML artifacts have valid structure</Text>
            <Text>• Try creating a new artifact</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default ArtifactErrorBoundary;



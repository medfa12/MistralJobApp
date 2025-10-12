/**
 * 🐛 Debug Component for Project Chat
 * Helps debug document deletion and conversation state issues
 */

'use client';

import {
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  Code,
  useColorModeValue,
  Collapse,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { MdBugReport, MdClose } from 'react-icons/md';

interface DebugPanelProps {
  projectId: string;
  conversationId: string | null;
  documentCount: number;
  messages: any[];
  mistralLibraryId?: string;
  onForceReset: () => void;
}

export default function DebugPanel({
  projectId,
  conversationId,
  documentCount,
  messages,
  mistralLibraryId,
  onForceReset,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [libraryInfo, setLibraryInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bgColor = useColorModeValue('orange.50', 'orange.900');
  const borderColor = useColorModeValue('orange.300', 'orange.600');
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  // Monitor polling
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setLastPollTime(new Date());
      setPollCount((prev) => prev + 1);
    }, 10000); // Match your polling interval

    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch library info from your API
  const fetchLibraryInfo = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/get`);
      const data = await response.json();
      if (data.success) {
        setLibraryInfo(data.project);
      }
    } catch (error) {
      console.error('Failed to fetch library info:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibraryInfo();
    }
  }, [isOpen, projectId]);

  // Test Mistral connection
  const testMistralConnection = async () => {
    if (!mistralLibraryId) {
      alert('No library ID available');
      return;
    }

    const apiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('apiKey') 
      : null;

    if (!apiKey) {
      alert('No API key found in localStorage. Please set your API key in settings.');
      return;
    }

    try {
      const response = await fetch(
        `https://api.mistral.ai/v1/libraries/${mistralLibraryId}/documents`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Mistral API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('📚 Mistral Library Documents:', data);
      alert(`✅ Connected to Mistral!\n\nFound ${data.data?.length || 0} documents in library`);
    } catch (error) {
      console.error('❌ Mistral API Error:', error);
      alert(`❌ Failed to connect to Mistral API\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Log debug state to console
  const logDebugState = () => {
    const debugState = {
      projectId,
      conversationId,
      documentCount,
      messageCount: messages.length,
      mistralLibraryId,
      lastPollTime,
      pollCount,
      libraryInfo,
      timestamp: new Date().toISOString(),
    };
    console.log('🐛 Debug State:', debugState);
    alert('Debug state logged to console (F12)');
  };

  return (
    <Box
      position="fixed"
      top="100px"
      right="20px"
      zIndex={9999}
      width={isOpen ? '350px' : 'auto'}
    >
      {/* Toggle Button */}
      {!isOpen ? (
        <Tooltip label="Open Debug Panel" placement="left">
          <IconButton
            aria-label="Toggle Debug Panel"
            icon={<MdBugReport />}
            colorScheme="orange"
            onClick={() => setIsOpen(true)}
            size="lg"
            boxShadow="lg"
          />
        </Tooltip>
      ) : (
        <Box
          bg={bgColor}
          border="2px solid"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
          boxShadow="xl"
          maxH="calc(100vh - 120px)"
          overflowY="auto"
        >
          <VStack align="stretch" spacing={3}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack>
                <MdBugReport />
                <Text fontWeight="bold" fontSize="lg">
                  Debug Panel
                </Text>
              </HStack>
              <HStack>
                <Badge colorScheme="orange" fontSize="xs">DEV</Badge>
                <IconButton
                  aria-label="Close Debug Panel"
                  icon={<MdClose />}
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </HStack>

            <Divider />

            {/* Project Info */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                📁 Project ID
              </Text>
              <Code fontSize="xs" p={2} borderRadius="md" w="100%" bg={codeBg}>
                {projectId}
              </Code>
            </Box>

            {/* Library Info */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                📚 Mistral Library ID
              </Text>
              <Code fontSize="xs" p={2} borderRadius="md" w="100%" bg={codeBg} noOfLines={1}>
                {mistralLibraryId || 'Not set'}
              </Code>
            </Box>

            {/* Conversation State */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                💬 Conversation Status
              </Text>
              <HStack>
                <Badge
                  colorScheme={conversationId ? 'green' : 'gray'}
                  fontSize="xs"
                >
                  {conversationId ? 'Active' : 'New'}
                </Badge>
                {conversationId && (
                  <Tooltip label={conversationId} placement="top">
                    <Code fontSize="xs" bg={codeBg} noOfLines={1}>
                      {conversationId.slice(0, 15)}...
                    </Code>
                  </Tooltip>
                )}
              </HStack>
            </Box>

            {/* Document Count */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                📄 Documents in Project
              </Text>
              <HStack>
                <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                  {documentCount}
                </Badge>
                <Text fontSize="xs" color="gray.600">
                  {documentCount === 0
                    ? 'No documents'
                    : documentCount === 1
                    ? '1 document'
                    : `${documentCount} documents`}
                </Text>
              </HStack>
              {libraryInfo && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Total size: {(libraryInfo.totalSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </Box>

            {/* Message Count */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                📨 Messages in Chat
              </Text>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                {messages.length}
              </Badge>
            </Box>

            {/* Polling Info */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                🔄 Auto-Reset Polling
              </Text>
              <VStack align="stretch" spacing={1} fontSize="xs">
                <HStack>
                  <Text fontWeight="bold">Last Check:</Text>
                  <Text color="gray.600">
                    {lastPollTime
                      ? lastPollTime.toLocaleTimeString()
                      : 'Not started'}
                  </Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Total Checks:</Text>
                  <Badge size="sm">{pollCount}</Badge>
                </HStack>
                <Text color="gray.500" fontStyle="italic">
                  Checks every 10 seconds for doc changes
                </Text>
              </VStack>
            </Box>

            <Divider />

            {/* Actions */}
            <VStack spacing={2}>
              <Button
                size="sm"
                width="100%"
                colorScheme="red"
                onClick={onForceReset}
                leftIcon={<Text>🔄</Text>}
              >
                Force Reset Conversation
              </Button>

              <Button
                size="sm"
                width="100%"
                colorScheme="blue"
                onClick={fetchLibraryInfo}
                isLoading={isRefreshing}
                leftIcon={<Text>📊</Text>}
              >
                Refresh Library Info
              </Button>

              <Button
                size="sm"
                width="100%"
                colorScheme="green"
                onClick={testMistralConnection}
                isDisabled={!mistralLibraryId}
                leftIcon={<Text>🧪</Text>}
              >
                Test Mistral API
              </Button>

              <Button
                size="sm"
                width="100%"
                variant="outline"
                onClick={logDebugState}
                leftIcon={<Text>📋</Text>}
              >
                Log State to Console
              </Button>
            </VStack>

            {/* Instructions */}
            <Box bg="whiteAlpha.700" p={3} borderRadius="md" fontSize="xs">
              <Text fontWeight="bold" mb={2}>
                💡 Testing Document Deletion:
              </Text>
              <VStack align="stretch" spacing={1}>
                <Text>1. Note current doc count above</Text>
                <Text>2. Delete a document</Text>
                <Text>3. Wait 10 seconds for auto-reset</Text>
                <Text>4. Check if conversation clears</Text>
                <Text>5. Send new message</Text>
                <Text>6. Verify doc is gone from AI</Text>
              </VStack>
            </Box>

            {/* Library Info Details */}
            {libraryInfo && (
              <Box bg="whiteAlpha.700" p={3} borderRadius="md" fontSize="xs">
                <Text fontWeight="bold" mb={2}>
                  📊 Library Details:
                </Text>
                <VStack align="stretch" spacing={1}>
                  <HStack justify="space-between">
                    <Text>Name:</Text>
                    <Text fontWeight="bold">{libraryInfo.name}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Documents:</Text>
                    <Badge>{libraryInfo.documentCount}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Created:</Text>
                    <Text>{new Date(libraryInfo.createdAt).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}


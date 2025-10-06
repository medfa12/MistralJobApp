'use client';

import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Badge,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { MdSearch, MdMessage, MdMoreVert, MdEdit, MdDelete, MdVisibility, MdAttachFile } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
    artifacts?: number;
  };
  messages?: Array<{
    attachments: any[];
  }>;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

export default function History() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bgHover = useColorModeValue('gray.50', 'whiteAlpha.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
    page: 1,
    totalPages: 1,
  });

  const fetchConversations = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : pagination.offset + pagination.limit;
      const url = new URL('/api/chat/conversations', window.location.origin);
      url.searchParams.set('limit', '20');
      url.searchParams.set('offset', offset.toString());
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setConversations(data.conversations);
          setFilteredConversations(data.conversations);
        } else {
          const updatedConversations = [...conversations, ...data.conversations];
          setConversations(updatedConversations);
          setFilteredConversations(updatedConversations);
        }
        
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Failed to load conversations',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast, pagination, conversations, searchQuery]);

  const loadMoreConversations = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchConversations(false);
    }
  }, [fetchConversations, loadingMore, pagination.hasMore]);

  useEffect(() => {
    fetchConversations(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger search when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConversations(true);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleView = (conversationId: string) => {
    router.push(`/chat?conversationId=${conversationId}`);
  };

  const handleRenameClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewTitle(conversation.title);
    onOpen();
  };

  const handleRename = async () => {
    if (!selectedConversation || !newTitle.trim()) return;

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        toast({
          title: 'Conversation renamed',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
        fetchConversations();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Failed to rename conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Conversation deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
        fetchConversations();
      }
    } catch (error) {
      toast({
        title: 'Failed to delete conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <Flex justify="space-between" align="center" mb="20px" flexWrap="wrap" gap="10px">
        <Text fontSize="2xl" fontWeight="700" color={textColor}>
          Chat History
        </Text>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderColor={borderColor}
          />
        </InputGroup>
      </Flex>

      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="150px" borderRadius="20px" />
          ))}
        </SimpleGrid>
      ) : filteredConversations.length === 0 ? (
        <Card p="40px" textAlign="center">
          <Icon as={MdMessage} boxSize="60px" color="gray.400" mb="20px" mx="auto" />
          <Text fontSize="lg" fontWeight="600" color={textColor} mb="10px">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </Text>
          <Text color={secondaryText} mb="20px">
            {searchQuery
              ? 'Try a different search term'
              : 'Start a new chat to see your conversation history'}
          </Text>
          {!searchQuery && (
            <Button
              bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={() => router.push('/chat')}
            >
              Start New Chat
            </Button>
          )}
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              p="20px"
              cursor="pointer"
              _hover={{ bg: bgHover, transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              position="relative"
              role="group"
            >
              <Flex justify="space-between" align="flex-start" mb="15px">
                <Flex align="center" flex="1" onClick={() => handleView(conversation.id)}>
                  <Icon as={MdMessage} boxSize="20px" color="brand.500" mr="10px" />
                  <Text
                    fontSize="md"
                    fontWeight="700"
                    color={textColor}
                    noOfLines={2}
                    flex="1"
                  >
                    {conversation.title}
                  </Text>
                </Flex>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Icon as={MdMoreVert} />}
                    variant="ghost"
                    size="sm"
                    aria-label="Options"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                  />
                  <MenuList>
                    <MenuItem
                      icon={<Icon as={MdVisibility} />}
                      onClick={() => handleView(conversation.id)}
                    >
                      View
                    </MenuItem>
                    <MenuItem
                      icon={<Icon as={MdEdit} />}
                      onClick={() => handleRenameClick(conversation)}
                    >
                      Rename
                    </MenuItem>
                    <MenuItem
                      icon={<Icon as={MdDelete} />}
                      onClick={() => handleDelete(conversation.id)}
                      color="red.500"
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>

              <Flex align="center" gap="10px" mb="10px" onClick={() => handleView(conversation.id)}>
                <Badge colorScheme="orange" fontSize="xs">
                  {conversation.model}
                </Badge>
                <Text fontSize="xs" color={secondaryText}>
                  {formatDate(conversation.updatedAt)}
                </Text>
              </Flex>

              <Flex align="center" gap="10px" onClick={() => handleView(conversation.id)}>
                <Text fontSize="sm" color={secondaryText}>
                  Created {formatDate(conversation.createdAt)}
                </Text>
                {conversation._count?.artifacts && conversation._count.artifacts > 0 && (
                  <Badge colorScheme="purple" fontSize="xs">
                    {conversation._count.artifacts} {conversation._count.artifacts === 1 ? 'Artifact' : 'Artifacts'}
                  </Badge>
                )}
                {conversation.messages && conversation.messages.some(m => m.attachments?.length > 0) && (
                  <Flex align="center" gap="4px">
                    <Icon as={MdAttachFile} boxSize="14px" color="gray.500" />
                    <Text fontSize="xs" color="gray.500">
                      {conversation.messages.reduce((sum, m) => sum + (m.attachments?.length || 0), 0)}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Load More Button */}
      {!loading && pagination.hasMore && (
        <Flex justify="center" mt="20px">
          <Button
            onClick={loadMoreConversations}
            isLoading={loadingMore}
            loadingText="Loading..."
            bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
            color="white"
            _hover={{ opacity: 0.9 }}
            size="md"
          >
            Load More ({pagination.total - filteredConversations.length} remaining)
          </Button>
        </Flex>
      )}

      {/* Pagination Info */}
      {!loading && filteredConversations.length > 0 && (
        <Flex justify="center" mt="10px">
          <Text fontSize="sm" color={secondaryText}>
            Showing {filteredConversations.length} of {pagination.total} conversations
          </Text>
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={useColorModeValue('white', 'navy.800')}
          color={useColorModeValue('navy.700', 'white')}
          borderRadius="20px"
          boxShadow="xl"
        >
          <ModalHeader>Rename Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new name"
              bg={useColorModeValue('white', 'navy.700')}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
              _focus={{
                borderColor: useColorModeValue('brand.500', 'brand.400'),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)"
              color="white"
              _hover={{
                bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)',
                opacity: 0.9,
              }}
              onClick={handleRename}
              isDisabled={!newTitle.trim()}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

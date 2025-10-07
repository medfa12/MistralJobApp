'use client';
/* eslint-disable */

// chakra imports
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Text,
  List,
  Icon,
  ListItem,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Button,
  Portal,
  Tooltip,
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import NavLink from '@/components/link/NavLink';
import { IRoute } from '@/types/navigation';
import { PropsWithChildren, useCallback, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MdMessage, MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  isCollapsed?: boolean;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const getCurrentConversationId = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('conversationId');
    }
    return null;
  };
  
  // Call all useColorModeValue hooks at the top level
  const activeColor = useColorModeValue('navy.700', 'white');
  const inactiveColor = useColorModeValue('gray.500', 'gray.500');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const activeIcon = useColorModeValue('brand.500', 'white');
  const iconColor = useColorModeValue('navy.700', 'white');
  const collapsedBgActive = useColorModeValue('brand.50', 'whiteAlpha.200');
  const collapsedBgHover = useColorModeValue('gray.100', 'whiteAlpha.200');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const scrollbarThumb = useColorModeValue('gray.300', 'whiteAlpha.300');
  const scrollbarThumbHover = useColorModeValue('gray.400', 'whiteAlpha.400');
  const modalBg = useColorModeValue('white', 'navy.800');
  const modalColor = useColorModeValue('navy.700', 'white');
  const inputBg = useColorModeValue('white', 'navy.700');
  const inputBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputFocusBorderColor = useColorModeValue('brand.500', 'brand.400');

  const { routes, isCollapsed = false } = props;
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchConversations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch('/api/chat/conversations?limit=20');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => fetchConversations(false), 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    const handleFocus = () => {
      fetchConversations(false);
    };
    
    window.addEventListener('focus', handleFocus);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchConversations(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const handleConversationUpdate = () => {
      fetchConversations(false);
    };
    
    window.addEventListener('conversationUpdated', handleConversationUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('conversationUpdated', handleConversationUpdate);
    };
  }, [fetchConversations]);

  const handleRenameClick = (conversation: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        onClose();
        
        window.dispatchEvent(new CustomEvent('conversationUpdated'));
      } else {
        throw new Error('Failed to rename');
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

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    const currentConversationId = getCurrentConversationId();
    const isCurrentConversation = currentConversationId === conversationId;

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
        
        if (isCurrentConversation) {
          router.push('/chat');
        }
        
        window.dispatchEvent(new CustomEvent('conversationUpdated'));
      } else {
        throw new Error('Failed to delete');
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

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname],
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      if (route.collapse && !route.invisible && !isCollapsed) {
        return (
          <Accordion allowToggle key={key}>
            <AccordionItem border="none" mb="14px">
              <AccordionButton
                display="flex"
                alignItems="center"
                mb="4px"
                justifyContent="center"
                _hover={{
                  bg: 'unset',
                }}
                _focus={{
                  boxShadow: 'none',
                }}
                borderRadius="8px"
                w="100%"
                py="0px"
                ms={0}
              >
                {route.icon ? (
                  <Flex
                    key={key}
                    align="center"
                    justifyContent="space-between"
                    w="100%"
                  >
                    <HStack
                      spacing={
                        activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                      }
                    >
                      <Flex
                        w="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box
                          color={
                            activeRoute(route.path.toLowerCase())
                              ? activeIcon
                              : inactiveColor
                          }
                          me="12px"
                          mt="6px"
                        >
                          {route.icon}
                        </Box>
                        <Text
                          me="auto"
                          color={
                            activeRoute(route.path.toLowerCase())
                              ? activeColor
                              : 'gray.500'
                          }
                          fontWeight="500"
                          letterSpacing="0px"
                          fontSize="sm"
                        >
                          {route.name}
                        </Text>
                      </Flex>
                    </HStack>
                    <AccordionIcon ms="auto" color={'gray.500'} />
                  </Flex>
                ) : (
                  <Flex pt="0px" pb="10px" alignItems="center" w="100%">
                    <HStack
                      spacing={
                        activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                      }
                      ps="32px"
                    >
                      <Text
                        me="auto"
                        color={
                          activeRoute(route.path.toLowerCase())
                            ? activeColor
                            : inactiveColor
                        }
                        fontWeight="500"
                        letterSpacing="0px"
                        fontSize="sm"
                      >
                        {route.name}
                      </Text>
                    </HStack>
                    <AccordionIcon ms="auto" color={'gray.500'} />
                  </Flex>
                )}
              </AccordionButton>
              <AccordionPanel py="0px" ps={'8px'}>
                <List>
                  {
                    route.icon && route.items
                      ? createLinks(route.items) // for bullet accordion links
                      : route.items
                      ? createAccordionLinks(route.items)
                      : '' // for non-bullet accordion links
                  }
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        );
      } else if (!route.invisible) {
        return (
          <div key={key}>
            {route.icon ? (
              isCollapsed ? (
                // Collapsed view - icon only with tooltip
                <Flex
                  align="center"
                  justifyContent="center"
                  w="100%"
                  mb="14px"
                  key={key}
                >
                  <Tooltip label={route.name} placement="right" hasArrow>
                    <Box>
                      <NavLink
                        href={route.layout ? route.layout + route.path : route.path}
                        styles={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          w="40px"
                          h="40px"
                          borderRadius="10px"
                          bg={activeRoute(route.path.toLowerCase()) ? collapsedBgActive : 'transparent'}
                          _hover={{
                            bg: collapsedBgHover,
                          }}
                        >
                          <Box
                            color={
                              activeRoute(route.path.toLowerCase())
                                ? activeIcon
                                : inactiveColor
                            }
                          >
                            {route.icon}
                          </Box>
                        </Flex>
                      </NavLink>
                    </Box>
                  </Tooltip>
                </Flex>
              ) : (
                // Expanded view - icon and text
                <Flex
                  align="center"
                  justifyContent="space-between"
                  w="100%"
                  maxW="100%"
                  ps="17px"
                  mb="0px"
                  key={key}
                >
                  <HStack
                    w="100%"
                    mb="14px"
                    spacing={
                      activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                    }
                  >
                    <NavLink
                      href={route.layout ? route.layout + route.path : route.path}
                      // key={key}
                      styles={{ width: '100%' }}
                    >
                      <Flex w="100%" alignItems="center" justifyContent="center">
                        <Box
                          color={
                            activeRoute(route.path.toLowerCase())
                              ? activeIcon
                              : inactiveColor
                          }
                          me="12px"
                          mt="6px"
                        >
                          {route.icon}
                        </Box>
                        <Text
                          me="auto"
                          color={
                            activeRoute(route.path.toLowerCase())
                              ? activeColor
                              : 'gray.500'
                          }
                          fontWeight="500"
                          letterSpacing="0px"
                          fontSize="sm"
                        >
                          {route.name}
                        </Text>
                        {route.rightElement ? (
                          <Flex
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="full"
                            w="34px"
                            h="34px"
                            justify={'center'}
                            align="center"
                            color={iconColor}
                            ms="auto"
                            me="10px"
                            cursor="pointer"
                            _hover={{ bg: hoverBg }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push('/chat');
                            }}
                          >
                            <Icon
                              as={IoMdAdd}
                              width="20px"
                              height="20px"
                              color="inherit"
                            />
                          </Flex>
                        ) : null}
                      </Flex>
                    </NavLink>
                  </HStack>
                </Flex>
              )
            ) : (
              <ListItem ms={0} key={key}>
                <Flex ps="32px" alignItems="center" mb="8px">
                  <NavLink
                    href={route.layout ? route.layout + route.path : route.path}
                    // key={key}
                  >
                    <Text
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : inactiveColor
                      }
                      fontWeight="500"
                      fontSize="xs"
                    >
                      {route.name}
                    </Text>
                  </NavLink>
                </Flex>
              </ListItem>
            )}
          </div>
        );
      }
    });
  };
  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createAccordionLinks = (routes: IRoute[]) => {
    return routes.map((route: IRoute, key: number) => {
      return (
        <ListItem
          ms="28px"
          display="flex"
          alignItems="center"
          mb="10px"
          key={key}
        >
          <NavLink href={route.layout + route.path} key={key}>
            <Icon w="6px" h="6px" me="8px" as={FaCircle} color={activeIcon} />
            <Text
              color={
                activeRoute(route.path.toLowerCase())
                  ? activeColor
                  : inactiveColor
              }
              fontWeight={
                activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'
              }
              fontSize="sm"
            >
              {route.name}
            </Text>
          </NavLink>
        </ListItem>
      );
    });
  };

  // Render chat history
  const renderChatHistory = () => {
    return (
      <Box mt="20px" mb="10px" pt="20px" borderTop="1px solid" borderColor={borderColor}>
        <Text
          color={inactiveColor}
          fontWeight="600"
          fontSize="xs"
          ps="20px"
          mb="10px"
          textTransform="uppercase"
        >
          Recent Chats
        </Text>
        <Box
          maxH="300px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: scrollbarThumb,
              borderRadius: '24px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: scrollbarThumbHover,
            },
          }}
        >
          {loading ? (
            <Text color={inactiveColor} fontSize="sm" ps="20px" mb="10px">
              Loading...
            </Text>
          ) : conversations.length === 0 ? (
            <Text color={inactiveColor} fontSize="sm" ps="20px" mb="10px">
              No conversations yet
            </Text>
          ) : (
            conversations.map((conversation) => (
            <Flex
              key={conversation.id}
              align="center"
              ps="17px"
              mb="10px"
              _hover={{ bg: hoverBg }}
              borderRadius="8px"
              py="8px"
              position="relative"
              role="group"
            >
              <NavLink
                href={`/chat?conversationId=${conversation.id}`}
                styles={{ width: '100%', display: 'flex', alignItems: 'center' }}
              >
                <Box color={inactiveColor} me="12px">
                  <Icon as={MdMessage} width="16px" height="16px" />
                </Box>
                <Text
                  color={inactiveColor}
                  fontWeight="500"
                  fontSize="sm"
                  noOfLines={1}
                  maxW="140px"
                >
                  {conversation.title}
                </Text>
              </NavLink>
              <Menu id={`conversation-menu-${conversation.id}`}>
                <MenuButton
                  as={IconButton}
                  icon={<Icon as={MdMoreVert} />}
                  variant="ghost"
                  size="xs"
                  minW="20px"
                  h="20px"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  position="absolute"
                  right="8px"
                  aria-label="Options"
                  onClick={(e) => e.stopPropagation()}
                />
                <Portal>
                  <MenuList minW="150px" zIndex={9999}>
                    <MenuItem
                      icon={<Icon as={MdEdit} />}
                      onClick={(e) => handleRenameClick(conversation, e)}
                    >
                      Rename
                    </MenuItem>
                    <MenuItem
                      icon={<Icon as={MdDelete} />}
                      onClick={(e) => handleDelete(conversation.id, e)}
                      color="red.500"
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </Flex>
            ))
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {createLinks(routes)}
      {!isCollapsed && renderChatHistory()}
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={modalBg}
          color={modalColor}
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
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorderColor}
              _focus={{
                borderColor: inputFocusBorderColor,
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
                bg: "linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)",
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
    </>
  );
}

export default SidebarLinks;

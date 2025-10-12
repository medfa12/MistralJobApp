'use client';
import React, { PropsWithChildren, useContext } from 'react';

import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react';
import Content from '@/components/sidebar/components/Content';
import {
  renderThumb,
  renderTrack,
  renderView,
} from '@/components/scrollbar/Scrollbar';
import { Scrollbars } from 'react-custom-scrollbars-2';

import { IoMenuOutline } from 'react-icons/io5';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { IRoute } from '@/types/navigation';
import { isWindowAvailable } from '@/utils/navigation';
import { SidebarContext } from '@/contexts/SidebarContext';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes, setApiKey } = props;
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);

  let variantChange = '0.2s linear';
  let shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'unset',
  );
  let sidebarBg = useColorModeValue('white', 'navy.800');
  let sidebarRadius = '14px';
  let sidebarMargins = '0px';
  let iconColor = useColorModeValue('navy.700', 'white');
  let borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

  return (
    <Box display={{ base: 'none', xl: 'block' }} position="fixed" minH="100%">
      <Box
        bg={sidebarBg}
        transition={variantChange}
        w={isCollapsed ? '80px' : '285px'}
        ms={{
          sm: '16px',
        }}
        my={{
          sm: '16px',
        }}
        h="calc(100vh - 32px)"
        m={sidebarMargins}
        borderRadius={sidebarRadius}
        minH="100%"
        overflow="hidden"
        boxShadow={shadow}
        position="relative"
        display="flex"
        flexDirection="column"
      >
        <IconButton
          aria-label="Toggle sidebar"
          icon={<Icon as={isCollapsed ? MdChevronRight : MdChevronLeft} w="20px" h="20px" />}
          position="absolute"
          top="20px"
          right={isCollapsed ? 'calc(50% - 14px)' : '20px'}
          zIndex={10}
          size="sm"
          variant="ghost"
          color={iconColor}
          onClick={() => setIsCollapsed(!isCollapsed)}
          _hover={{
            bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
          }}
        />
        <Box flex="1" overflow="hidden">
          <Scrollbars
            autoHide
            renderTrackVertical={renderTrack}
            renderThumbVertical={renderThumb}
            renderView={renderView}
          >
            <Content setApiKey={setApiKey} routes={routes} isCollapsed={isCollapsed} />
          </Scrollbars>
        </Box>
      </Box>
    </Box>
  );
}

export function SidebarResponsive(props: { routes: IRoute[] }) {
  let sidebarBackgroundColor = useColorModeValue('white', 'navy.800');
  let menuColor = useColorModeValue('gray.400', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { routes } = props;
  return (
    <Flex display={{ sm: 'flex', xl: 'none' }} alignItems="center">
      <Flex w="max-content" h="max-content" onClick={onOpen}>
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my="auto"
          w="20px"
          h="20px"
          me="10px"
          _hover={{ cursor: 'pointer' }}
        />
      </Flex>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={
          isWindowAvailable() && document.documentElement.dir === 'rtl'
            ? 'right'
            : 'left'
        }
      >
        <DrawerOverlay />
        <DrawerContent
          w="285px"
          maxW="285px"
          ms={{
            sm: '16px',
          }}
          my={{
            sm: '16px',
          }}
          borderRadius="16px"
          bg={sidebarBackgroundColor}
        >
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none' }}
          />
          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}
            >
              <Content routes={routes} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;

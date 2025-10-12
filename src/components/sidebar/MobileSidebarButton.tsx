'use client';
import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Icon,
  useDisclosure,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { IoMenuOutline } from 'react-icons/io5';
import { Scrollbars } from 'react-custom-scrollbars-2';
import {
  renderThumb,
  renderTrack,
  renderView,
} from '@/components/scrollbar/Scrollbar';
import Content from '@/components/sidebar/components/Content';
import { IRoute } from '@/types/navigation';
import { isWindowAvailable } from '@/utils/navigation';

interface MobileSidebarButtonProps {
  routes: IRoute[];
  setApiKey?: any;
}

export default function MobileSidebarButton({ routes, setApiKey }: MobileSidebarButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sidebarBackgroundColor = useColorModeValue('white', 'navy.800');
  const buttonBg = useColorModeValue('white', 'navy.800');
  const iconColor = useColorModeValue('gray.700', 'white');
  const shadow = useColorModeValue(
    '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '0px 4px 12px rgba(0, 0, 0, 0.3)',
  );

  return (
    <>
      <Box
        display={{ base: 'block', xl: 'none' }}
        position="fixed"
        top="20px"
        left="20px"
        zIndex="999"
      >
        <IconButton
          aria-label="Open menu"
          icon={<Icon as={IoMenuOutline} w="24px" h="24px" />}
          onClick={onOpen}
          bg={buttonBg}
          color={iconColor}
          borderRadius="12px"
          boxShadow={shadow}
          w="48px"
          h="48px"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: useColorModeValue(
              '0px 6px 16px rgba(0, 0, 0, 0.15)',
              '0px 6px 16px rgba(0, 0, 0, 0.4)',
            ),
          }}
          _active={{
            transform: 'scale(0.98)',
          }}
          transition="all 0.2s"
        />
      </Box>

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
              <Content routes={routes} setApiKey={setApiKey} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

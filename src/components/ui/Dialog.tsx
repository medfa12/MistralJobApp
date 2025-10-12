'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    colorScheme?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  primaryAction,
  secondaryAction,
}: DialogProps) {
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        {title && (
          <ModalHeader color={textColor} fontSize="22px" fontWeight="700">
            {title}
          </ModalHeader>
        )}
        {showCloseButton && <ModalCloseButton color={textColor} />}
        <ModalBody pb={footer || primaryAction || secondaryAction ? 6 : 4}>
          {children}
        </ModalBody>

        {(footer || primaryAction || secondaryAction) && (
          <ModalFooter>
            {footer ? (
              footer
            ) : (
              <>
                {secondaryAction && (
                  <Button onClick={secondaryAction.onClick} mr={3}>
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    variant="primary"
                    onClick={primaryAction.onClick}
                    isLoading={primaryAction.isLoading}
                    colorScheme={primaryAction.colorScheme}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

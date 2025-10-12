'use client';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  colorScheme?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  colorScheme = 'red',
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const textColor = useColorModeValue('navy.700', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent bg={bgColor}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textColor}>
            {title}
          </AlertDialogHeader>

          <AlertDialogBody color={textColor}>{description}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              colorScheme={colorScheme}
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

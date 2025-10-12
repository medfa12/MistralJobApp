'use client';
import {
  Button,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Card from '@/components/card/Card';
import { ConfirmDialog } from '@/components/ui';

export default function Delete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 1000);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsDeleting(false);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Card
        flexDirection={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap={{ base: '20px', md: '0px' }}
      >
        <Button
          variant="red"
          py="20px"
          px="16px"
          fontSize="sm"
          borderRadius="45px"
          w={{ base: '100%', md: '210px' }}
          h="54px"
          onClick={onOpen}
          isLoading={isDeleting}
        >
          Delete Account
        </Button>
      </Card>

      {}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        colorScheme="red"
      />
    </>
  );
}

'use client';
import {
  Flex,
  FormControl,
  Text,
  useColorModeValue,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Card from '@/components/card/Card';
import InputField from '@/components/fields/InputField';

export default function Password() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(data.error || 'Failed to update password');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormControl as="form" onSubmit={handleSubmit}>
      <Card>
        <Flex direction="column" mb="40px">
          <Text
            fontSize="xl"
            color={textColorPrimary}
            mb="6px"
            fontWeight="bold"
          >
            Change password
          </Text>
          <Text fontSize="md" fontWeight="500" color={textColorSecondary}>
            Here you can set your new password
          </Text>
        </Flex>
        <FormControl>
          <Flex flexDirection="column">
            <InputField
              mb="25px"
              id="old"
              label="Old Password"
              placeholder="Old Password"
              type="password"
              value={formData.oldPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, oldPassword: e.target.value })
              }
              required
            />
            <InputField
              mb="25px"
              id="new"
              label="New Password"
              placeholder="New Password"
              type="password"
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
            />
            <InputField
              mb="25px"
              id="confirm"
              label="New Password Confirmation"
              placeholder="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </Flex>
        </FormControl>
        <Button
          mt="20px"
          variant="brand"
          fontWeight="500"
          w="100%"
          h="50"
          type="submit"
          isLoading={isLoading}
        >
          Change Password
        </Button>
      </Card>
    </FormControl>
  );
}

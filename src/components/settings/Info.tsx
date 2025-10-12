'use client';
import {
  Flex,
  FormControl,
  SimpleGrid,
  Text,
  useColorModeValue,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Card from '@/components/card/Card';
import InputField from '@/components/fields/InputField';
import TextField from '@/components/fields/TextField';

type InfoProps = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  job: string;
  bio: string;
};

export default function Info(props: InfoProps) {
  const { username, email, firstName, lastName, job, bio } = props;

  const [formData, setFormData] = useState({
    username,
    email,
    firstName,
    lastName,
    job,
    bio,
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
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
            Account Settings
          </Text>
          <Text fontSize="md" fontWeight="500" color={textColorSecondary}>
            Here you can change user account information
          </Text>
        </Flex>
        <SimpleGrid
          columns={{ sm: 1, md: 2 }}
          spacing={{ base: '20px', xl: '20px' }}
        >
          <InputField
            mb="10px"
            me="30px"
            id="username"
            label="Username"
            placeholder="@username"
            value={formData.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <InputField
            mb="10px"
            id="email"
            label="Email Address"
            placeholder="hello@example.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <InputField
            mb="10px"
            me="30px"
            id="first_name"
            label="First Name"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <InputField
            mb="20px"
            id="last_name"
            label="Last Name"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </SimpleGrid>
        <InputField
          id="job"
          label="Job"
          placeholder="Web Developer"
          value={formData.job}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, job: e.target.value })
          }
        />
        <TextField
          id="about"
          label="About Me"
          minH="150px"
          placeholder="Tell something about yourself!"
          value={formData.bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, bio: e.target.value })
          }
        />
        <Button
          mt="20px"
          variant="brand"
          fontWeight="500"
          w="100%"
          h="50"
          type="submit"
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </Card>
    </FormControl>
  );
}

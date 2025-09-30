'use client';

// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Link,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import illustration from '/public/img/auth/auth.png';
import DefaultAuth from '@/components/auth';
import React from 'react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function SignUp() {
  const router = useRouter();
  const toast = useToast();
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';
  const textColorDetails = useColorModeValue('navy.700', 'gray.500');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500', fontWeight: '500' },
    { color: 'whiteAlpha.600', fontWeight: '500' },
  );
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleClick = () => setShow(!show);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Registration Failed',
          description: data.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Logging you in...',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Automatically sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/all-templates');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DefaultAuth illustrationBackground={illustration?.src}>
      <Flex
        w="100%"
        maxW="max-content"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '8vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Text
            fontWeight={'700'}
            color={textColor}
            fontSize={{ base: '34px', lg: '36px' }}
            mb="10px"
          >
            Create account
          </Text>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="500"
            fontSize="sm"
          >
            Enter your credentials to create your account!
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          <FormControl as="form" onSubmit={handleRegister}>
            <FormLabel
              cursor="pointer"
              htmlFor="name"
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Name<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              variant="auth"
              id="name"
              fontSize="sm"
              type="text"
              placeholder="Enter your name"
              mb="24px"
              size="lg"
              borderColor={borderColor}
              h="54px"
              _placeholder={{ placeholderColor }}
              fontWeight="500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormLabel
              cursor="pointer"
              display="flex"
              ms="4px"
              htmlFor="email"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Email<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              id="email"
              variant="auth"
              fontSize="sm"
              type="email"
              borderColor={borderColor}
              placeholder="Enter your email address"
              mb="24px"
              size="lg"
              _placeholder={{ placeholderColor }}
              h="54px"
              fontWeight="500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* PASSWORD */}
            <FormLabel
              cursor="pointer"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              htmlFor="pass"
              color={textColor}
              display="flex"
            >
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired={true}
                variant="auth"
                id="pass"
                fontSize="sm"
                placeholder="Enter your password"
                mb="24px"
                size="lg"
                h="54px"
                borderColor={borderColor}
                fontWeight="500"
                _placeholder={{ placeholderColor }}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: 'pointer' }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>
            {/* CONFIRM */}
            <FormLabel
              cursor="pointer"
              htmlFor="confirm"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              borderColor={borderColor}
              color={textColor}
              display="flex"
            >
              Confirm Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                placeholder="Enter your password again"
                id="confirm"
                mb="24px"
                size="lg"
                borderColor={borderColor}
                h="54px"
                fontWeight="500"
                _placeholder={{ placeholderColor }}
                type={show ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: 'pointer' }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>
            <Button
              type="submit"
              variant="primary"
              py="20px"
              px="16px"
              fontSize="sm"
              borderRadius="45px"
              mt={{ base: '20px', md: '0px' }}
              w="100%"
              h="54px"
              mb="24px"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Create your Account
            </Button>
          </FormControl>
          <Flex justifyContent="center" alignItems="start" maxW="100%" mt="0px">
            <Text color={textColorDetails} fontWeight="500" fontSize="sm">
              Already have an account?
            </Text>
            <Link href="/auth/login" py="0px" lineHeight={'120%'}>
              <Text
                color={textColorBrand}
                fontSize="sm"
                as="span"
                ms="5px"
                fontWeight="600"
              >
                Login here
              </Text>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;

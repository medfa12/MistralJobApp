'use client';
import Card from '@/components/card/Card';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Link,
  ListItem,
  UnorderedList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

function APIModal(props: { setApiKey: any; sidebar?: boolean; externalOpen?: boolean; onExternalClose?: () => void; onApiKeySet?: () => void }) {
  const { setApiKey, sidebar, externalOpen, onExternalClose, onApiKeySet } = props;
  const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure();
  const [inputCode, setInputCode] = useState<string>('');
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [keyDate, setKeyDate] = useState<string | null>(null);

  const isOpen = externalOpen !== undefined ? externalOpen : internalIsOpen;
  const onOpen = internalOnOpen;
  const onClose = () => {
    if (onExternalClose) {
      onExternalClose();
    } else {
      internalOnClose();
    }
  };

  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.500');
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const link = useColorModeValue('brand.500', 'white');
  const toast = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    const storedDate = localStorage.getItem('apiKeyDate');

    if (storedKey) {
      setExistingKey(storedKey);
      setKeyDate(storedDate);
    } else {
      setExistingKey(null);
      setKeyDate(null);
    }
  }, [isOpen]);

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);

    const newDate = new Date().toISOString();
    localStorage.setItem('apiKey', value);
    localStorage.setItem('apiKeyDate', newDate);

    setExistingKey(value);
    setKeyDate(newDate);

    if (onApiKeySet) {
      onApiKeySet();
    }
  };

  const getLastFourDigits = () => {
    if (existingKey && existingKey.length > 4) {
      return existingKey.slice(-4);
    }
    return 'xxxx';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  return (
    <>
      {sidebar && (
        <Button
          onClick={onOpen}
          display="flex"
          variant="api"
          fontSize={'sm'}
          fontWeight="600"
          borderRadius={'45px'}
          mt="8px"
          minH="40px"
        >
          Set API Key
        </Button>
      )}

      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="none" boxShadow="none">
          <Card textAlign={'center'}>
            <ModalHeader
              fontSize="22px"
              fontWeight={'700'}
              mx="auto"
              textAlign={'center'}
              color={textColor}
            >
              {existingKey ? 'Change your Mistral API Key' : 'Enter your Mistral API Key'}
            </ModalHeader>
            <ModalCloseButton _focus={{ boxShadow: 'none' }} />
            <ModalBody p="0px">
              <Text
                color={grayColor}
                fontWeight="500"
                fontSize="md"
                lineHeight="28px"
                mb="22px"
              >
                You need a Mistral API Key to use Mistral AI Demo's features.
                Your API Key is stored locally in your browser and never sent
                to our servers.
              </Text>
              {existingKey && keyDate && (
                <Text
                  color={grayColor}
                  fontWeight="600"
                  fontSize="sm"
                  mb="12px"
                >
                  Current Key: mst-...{getLastFourDigits()} • Added: {formatDate(keyDate)}
                </Text>
              )}
              <Flex mb="20px">
                <Input
                  h="100%"
                  border="1px solid"
                  borderColor={inputBorder}
                  borderRadius="45px"
                  p="15px 20px"
                  me="10px"
                  fontSize="sm"
                  fontWeight="500"
                  _focus={{ borderColor: 'none' }}
                  _placeholder={{ color: 'gray.500' }}
                  color={inputColor}
                  placeholder={existingKey ? `mst-...${getLastFourDigits()}` : 'mst-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                  onChange={handleChange}
                  value={inputCode}
                />
                <Button
                  variant="chakraLinear"
                  py="20px"
                  px="16px"
                  fontSize="sm"
                  borderRadius="45px"
                  ms="auto"
                  mb={{ base: '20px', md: '0px' }}
                  w={{ base: '300px', md: '180px' }}
                  h="54px"
                  onClick={() => {
                    if (inputCode) {
                      handleApiKeyChange(inputCode);
                      toast({
                        title: `Success! You have successfully added your API key!`,
                        position: 'top',
                        status: 'success',
                        isClosable: true,
                      });
                    } else {
                      toast({
                        title: 'Please add your API key!',
                        position: 'top',
                        status: 'warning',
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Save API Key
                </Button>
              </Flex>
              <Link
                color={link}
                fontSize="sm"
                href="https://console.mistral.ai/api-keys"
                textDecoration="underline !important"
                fontWeight="600"
              >
                Get your API key from the Mistral Console
              </Link>
              <Accordion allowToggle w="100%" my="16px">
                <AccordionItem border="none">
                  <AccordionButton
                    borderBottom="0px solid"
                    maxW="max-content"
                    mx="auto"
                    _hover={{ border: '0px solid', bg: 'none' }}
                    _focus={{ border: '0px solid', bg: 'none' }}
                  >
                    <Box flex="1" textAlign="left">
                      <Text
                        color={textColor}
                        fontWeight="700"
                        fontSize={{ sm: 'md', lg: 'md' }}
                      >
                        Your API Key is not working?
                      </Text>
                    </Box>
                    <AccordionIcon color={textColor} />
                  </AccordionButton>
                  <AccordionPanel p="18px 0px 10px 0px">
                    <UnorderedList p="5px">
                      <ListItem
                        mb="26px"
                        color={grayColor}
                        fontSize="md"
                        fontWeight="500"
                      >
                        Make sure you created an account on the{' '}
                        <Link
                          textDecoration="underline"
                          fontSize="md"
                          href="https://console.mistral.ai/"
                          fontWeight="500"
                          color={grayColor}
                        >
                          Mistral Console
                        </Link>{' '}
                        and generated an API key. We don't sell API keys.
                      </ListItem>
                      <ListItem
                        color={grayColor}
                        fontSize="md"
                        lineHeight="28px"
                        fontWeight="500"
                      >
                        Ensure you have an active billing method configured in the
                        Mistral Console. Keys without billing or credits will be
                        rejected.
                      </ListItem>
                    </UnorderedList>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <Text
                color={grayColor}
                fontWeight="500"
                fontSize="sm"
                mb="42px"
                mx="30px"
              >
                *The app connects to the Mistral API directly from your browser
                using your key. It never reaches our servers.
              </Text>
            </ModalBody>
          </Card>
        </ModalContent>
      </Modal>
    </>
  );
}

export default APIModal;

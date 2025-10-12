'use client';
import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
  Skeleton,
  Tooltip,
} from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import avatar from '/public/img/avatars/avatar.png';
import { NextAvatar } from '@/components/image/Avatar';
import APIModal from '@/components/apiModal';
import Brand from '@/components/sidebar/components/Brand';
import Links from '@/components/sidebar/components/Links';
import { RoundedChart } from '@/components/icons/Icons';
import { PropsWithChildren } from 'react';
import React from 'react';
import { IRoute } from '@/types/navigation';
import { IoMdPerson, IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FiLogOut } from 'react-icons/fi';
import { LuHistory } from 'react-icons/lu';
import { MdOutlineManageAccounts, MdOutlineSettings, MdLock } from 'react-icons/md';
import { useUserData } from '@/hooks/useUserData';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useColorMode } from '@chakra-ui/react';

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  isCollapsed?: boolean;
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const { routes, setApiKey, isCollapsed = false } = props;
  const { fullName, avatar, loading, role } = useUserData();
  const [hasApiKey, setHasApiKey] = React.useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = React.useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bgColor = useColorModeValue('white', 'navy.700');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(12, 44, 55, 0.18)',
  );
  const iconColor = useColorModeValue('navy.700', 'white');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );
  const gray = useColorModeValue('gray.500', 'white');

  React.useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    setHasApiKey(!!apiKey);
  }, []);

  const filteredRoutes = routes.filter(route => {
    if (route.adminOnly && role !== 'admin') {
      return false;
    }
    return true;
  });

  const handleApiKeySet = () => {
    setHasApiKey(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('apiKeyDate');
    await signOut({ callbackUrl: '/auth/login' });
  };

  if (isCollapsed) {
    return (
      <Flex
        direction="column"
        height="100%"
        pt="60px"
        pb="26px"
        borderRadius="30px"
        px="0px"
        alignItems="center"
        justifyContent="center"
      >
        <Brand isCollapsed={true} />
        <Stack direction="column" mb="auto" mt="8px" width="100%" alignItems="center" spacing="0px">
          <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            <Links routes={filteredRoutes} isCollapsed={true} />
          </Box>
        </Stack>

        {!hasApiKey && <APIModal setApiKey={setApiKey} sidebar={true} onApiKeySet={handleApiKeySet} />}
        <APIModal 
          setApiKey={setApiKey} 
          externalOpen={isApiModalOpen} 
          onExternalClose={() => setIsApiModalOpen(false)}
          onApiKeySet={handleApiKeySet}
        />

        {}
        <Flex
          mt="20px"
          direction="column"
          alignItems="center"
          gap="10px"
        >
          {loading ? (
            <Skeleton h="34px" w="34px" borderRadius="full" />
          ) : avatar ? (
            <Tooltip label={fullName} placement="right" hasArrow>
              <Box
                as="button"
                onClick={() => {}}
                _hover={{ opacity: 0.8 }}
                cursor="pointer"
              >
                <Image
                  src={avatar}
                  alt={fullName}
                  width={34}
                  height={34}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Tooltip>
          ) : null}

          <Menu id="sidebar-menu">
            <Tooltip label="Settings" placement="right" hasArrow>
              <MenuButton
                as={Button}
                variant="transparent"
                aria-label="Settings"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="full"
                w="34px"
                h="34px"
                px="0px"
                p="0px"
                minW="34px"
                justifyContent={'center'}
                alignItems="center"
                color={iconColor}
                suppressHydrationWarning
              >
                <Flex align="center" justifyContent="center">
                  <Icon
                    as={MdOutlineSettings}
                    width="18px"
                    height="18px"
                    color="inherit"
                  />
                </Flex>
              </MenuButton>
            </Tooltip>
            <MenuList
              ms="-20px"
              py="25px"
              ps="20px"
              pe="80px"
              w="246px"
              borderRadius="16px"
              transform="translate(19px, -62px)!important"
              border="0px"
              boxShadow={shadow}
              bg={bgColor}
            >
              <Box mb="30px">
                <NavLink href="/settings">
                  <Flex align="center">
                    <Icon
                      as={MdOutlineManageAccounts}
                      width="24px"
                      height="24px"
                      color={gray}
                      me="12px"
                    />
                    <Text color={gray} fontWeight="500" fontSize="sm">
                      Profile Settings
                    </Text>
                  </Flex>
                </NavLink>
              </Box>
              <Box mb="30px">
                <NavLink href="/history">
                  <Flex align="center">
                    <Icon
                      as={LuHistory}
                      width="24px"
                      height="24px"
                      color={gray}
                      me="12px"
                    />
                    <Text color={gray} fontWeight="500" fontSize="sm">
                      History
                    </Text>
                  </Flex>
                </NavLink>
              </Box>
              <Box mb="30px">
                <NavLink href="/usage">
                  <Flex align="center">
                    <Icon
                      as={RoundedChart}
                      width="24px"
                      height="24px"
                      color={gray}
                      me="12px"
                    />
                    <Text color={gray} fontWeight="500" fontSize="sm">
                      Usage
                    </Text>
                  </Flex>
                </NavLink>
              </Box>
              <Box mb="30px">
                <NavLink href="/my-plan">
                  <Flex align="center">
                    <Icon
                      as={IoMdPerson}
                      width="24px"
                      height="24px"
                      color={gray}
                      me="12px"
                    />
                    <Text color={gray} fontWeight="500" fontSize="sm">
                      My Plan
                    </Text>
                  </Flex>
                </NavLink>
              </Box>
              <Box mb="30px">
                <Flex 
                  align="center" 
                  cursor="pointer" 
                  onClick={() => setIsApiModalOpen(true)}
                  _hover={{ opacity: 0.8 }}
                >
                  <Icon
                    as={MdLock}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    Setup API Key
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex 
                  align="center" 
                  cursor="pointer" 
                  onClick={toggleColorMode}
                  _hover={{ opacity: 0.8 }}
                >
                  <Icon
                    as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </Flex>
              </Box>
            </MenuList>
          </Menu>

          <Tooltip label="Logout" placement="right" hasArrow>
            <Button
              variant="transparent"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
              w="34px"
              h="34px"
              px="0px"
              minW="34px"
              justifyContent={'center'}
              alignItems="center"
              onClick={handleLogout}
            >
              <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      height="100%"
      pt="20px"
      pb="26px"
      borderRadius="30px"
      maxW="285px"
      px="20px"
    >
      <Brand />
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <Links routes={filteredRoutes} isCollapsed={false} />
        </Box>
      </Stack>

      {!hasApiKey && <APIModal setApiKey={setApiKey} sidebar={true} onApiKeySet={handleApiKeySet} />}
      <APIModal 
        setApiKey={setApiKey} 
        externalOpen={isApiModalOpen} 
        onExternalClose={() => setIsApiModalOpen(false)}
        onApiKeySet={handleApiKeySet}
      />
      <Flex
        mt="20px"
        justifyContent="center"
        alignItems="center"
        boxShadow={shadowPillBar}
        borderRadius="30px"
        p="14px"
      >
        {loading ? (
          <Skeleton h="34px" w="34px" borderRadius="full" me="10px" />
        ) : avatar ? (
          <Image
            src={avatar}
            alt={fullName}
            width={34}
            height={34}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: '10px',
            }}
          />
        ) : null}
        {loading ? (
          <Skeleton h="16px" w="100px" me="10px" />
        ) : (
          <Text color={textColor} fontSize="xs" fontWeight="600" me="10px">
            {fullName}
          </Text>
        )}
        <Menu id="sidebar-menu">
          <MenuButton
            as={Button}
            variant="transparent"
            aria-label=""
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            w="34px"
            h="34px"
            px="0px"
            p="0px"
            minW="34px"
            me="10px"
            justifyContent={'center'}
            alignItems="center"
            color={iconColor}
            suppressHydrationWarning
          >
            <Flex align="center" justifyContent="center">
              <Icon
                as={MdOutlineSettings}
                width="18px"
                height="18px"
                color="inherit"
              />
            </Flex>
          </MenuButton>
          <MenuList
            ms="-20px"
            py="25px"
            ps="20px"
            pe="80px"
            w="246px"
            borderRadius="16px"
            transform="translate(-19px, -62px)!important"
            border="0px"
            boxShadow={shadow}
            bg={bgColor}
          >
            <Box mb="30px">
              <NavLink href="/settings">
                <Flex align="center">
                  <Icon
                    as={MdOutlineManageAccounts}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    Profile Settings
                  </Text>
                </Flex>
              </NavLink>
            </Box>
            <Box mb="30px">
              <NavLink href="/history">
                <Flex align="center">
                  <Icon
                    as={LuHistory}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    History
                  </Text>
                </Flex>
              </NavLink>
            </Box>
            <Box mb="30px">
              <NavLink href="/usage">
                <Flex align="center">
                  <Icon
                    as={RoundedChart}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    Usage
                  </Text>
                </Flex>
              </NavLink>
            </Box>
            <Box mb="30px">
              <NavLink href="/my-plan">
                <Flex align="center">
                  <Icon
                    as={IoMdPerson}
                    width="24px"
                    height="24px"
                    color={gray}
                    me="12px"
                  />
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    My Plan
                  </Text>
                </Flex>
              </NavLink>
            </Box>
            <Box mb="30px">
              <Flex 
                align="center" 
                cursor="pointer" 
                onClick={() => setIsApiModalOpen(true)}
                _hover={{ opacity: 0.8 }}
              >
                <Icon
                  as={MdLock}
                  width="24px"
                  height="24px"
                  color={gray}
                  me="12px"
                />
                <Text color={gray} fontWeight="500" fontSize="sm">
                  Setup API Key
                </Text>
              </Flex>
            </Box>
            <Box>
              <Flex 
                align="center" 
                cursor="pointer" 
                onClick={toggleColorMode}
                _hover={{ opacity: 0.8 }}
              >
                <Icon
                  as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
                  width="24px"
                  height="24px"
                  color={gray}
                  me="12px"
                />
                <Text color={gray} fontWeight="500" fontSize="sm">
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </Flex>
            </Box>
          </MenuList>
        </Menu>
        <Button
          variant="transparent"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          w="34px"
          h="34px"
          px="0px"
          minW="34px"
          justifyContent={'center'}
          alignItems="center"
          onClick={handleLogout}
        >
          <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
        </Button>
      </Flex>
    </Flex>
  );
}

export default SidebarContent;

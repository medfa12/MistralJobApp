'use client';

import { useState } from 'react';
import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import Info from '@/components/settings/Info';
import Password from '@/components/settings/Password';
import Profile from '@/components/settings/Profile';
import Delete from '@/components/settings/Delete';

import defaultAvatar from '../../public/img/avatars/avatar.png';

type UserData = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  job: string | null;
  role: string;
  createdAt: Date;
};

export default function SettingsClient({ user }: { user: UserData }) {
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(user.avatar);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User';

  const avatarSrc = currentAvatar || defaultAvatar;

  const banner = user.role === 'admin' 
    ? 'linear-gradient(15.46deg, #4318FF 26.3%, #8B5CF6 86.4%)' 
    : 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)';

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setCurrentAvatar(newAvatarUrl);
  };

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <SimpleGrid columns={{ sm: 1, lg: 2 }} spacing="20px" mb="20px">
        {}
        <Flex direction="column">
          <Profile
            name={fullName}
            avatar={avatarSrc}
            banner={banner}
            role={user.role}
            onAvatarUpdate={handleAvatarUpdate}
          />
          <Info 
            username={user.username || ''}
            email={user.email}
            firstName={user.firstName || ''}
            lastName={user.lastName || ''}
            job={user.job || ''}
            bio={user.bio || ''}
          />
        </Flex>
        {}
        <Flex direction="column" gap="20px">
          <Password />
        </Flex>
      </SimpleGrid>
      <Delete />
    </Box>
  );
}

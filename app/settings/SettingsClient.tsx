'use client';

import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import Info from '@/components/settings/Info';
import Password from '@/components/settings/Password';
import Profile from '@/components/settings/Profile';
import Delete from '@/components/settings/Delete';

// Default avatar fallback
import defaultAvatar from '../../public/img/avatars/avatar4.png';

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
  // Construct full name from first and last name
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User';

  // Use avatar URL if available, otherwise use default
  const avatarSrc = user.avatar || defaultAvatar;

  // Generate banner gradient based on role
  const banner = user.role === 'admin' 
    ? 'linear-gradient(15.46deg, #4318FF 26.3%, #8B5CF6 86.4%)' 
    : 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)';

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <SimpleGrid columns={{ sm: 1, lg: 2 }} spacing="20px" mb="20px">
        {/* Column Left */}
        <Flex direction="column">
          <Profile
            name={fullName}
            avatar={avatarSrc}
            banner={banner}
            role={user.role}
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
        {/* Column Right */}
        <Flex direction="column" gap="20px">
          <Password />
        </Flex>
      </SimpleGrid>
      <Delete />
    </Box>
  );
}


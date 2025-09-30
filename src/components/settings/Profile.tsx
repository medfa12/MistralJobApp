'use client';
// Chakra imports
import { Flex, Text, useColorModeValue, Badge, Box } from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { NextAvatar } from '@/components/image/Avatar';
import { StaticImageData } from 'next/image';
import Image from 'next/image';
import AvatarUpload from './AvatarUpload';

export default function Profile(props: {
  name: string;
  avatar: StaticImageData | string;
  banner: string;
  role?: string;
}) {
  const { name, avatar, banner, role = 'member' } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';

  // Determine if avatar is a URL string or StaticImageData
  const isAvatarUrl = typeof avatar === 'string';

  return (
    <Card mb="20px" alignItems="center">
      <Flex bg={banner} w="100%" h="129px" borderRadius="16px" />
      
      {isAvatarUrl ? (
        <Image
          src={avatar}
          alt={name}
          width={87}
          height={87}
          style={{
            borderRadius: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '-43px',
            marginBottom: '15px',
            objectFit: 'cover',
          }}
        />
      ) : (
        <NextAvatar
          mx="auto"
          src={avatar}
          h="87px"
          w="87px"
          mt="-43px"
          mb="15px"
        />
      )}
      
      <Text
        fontSize="2xl"
        textColor={textColorPrimary}
        fontWeight="700"
        mb="4px"
      >
        {name}
      </Text>
      
      <Flex align="center" mx="auto" px="14px" mb="20px">
        <Text
          color={textColorSecondary}
          fontSize="sm"
          fontWeight="500"
          lineHeight="100%"
          me="8px"
        >
          Account type:
        </Text>
        <Badge
          colorScheme={role === 'admin' ? 'purple' : 'orange'}
          fontSize="sm"
          textTransform="capitalize"
        >
          {role}
        </Badge>
      </Flex>

      {/* Avatar Upload */}
      <Box px="20px" pb="20px" width="100%">
        <AvatarUpload 
          currentAvatar={typeof avatar === 'string' ? avatar : undefined}
        />
      </Box>
    </Card>
  );
}

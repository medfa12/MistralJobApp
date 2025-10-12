'use client';
import { Flex, useColorModeValue, Text, Image } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [mounted, setMounted] = useState(false);
  let logoColor = useColorModeValue('navy.700', 'white');
  let logoSrc = useColorModeValue('/img/m-boxed/m-boxed-orange.svg', '/img/m/m-white.svg');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isCollapsed) {
    return (
      <Flex alignItems="center" justifyContent="center" flexDirection="column" mb="20px" w="100%">
        <Image 
          src={mounted ? logoSrc : '/img/m-boxed/m-boxed-orange.svg'}
          alt="Mistral AI" 
          width="40px" 
          height="40px"
        />
      </Flex>
    );
  }

  return (
    <Flex alignItems="center" flexDirection="column">
      <Image 
        src={mounted ? logoSrc : '/img/m-boxed/m-boxed-orange.svg'}
        alt="Mistral AI" 
        width="60px" 
        height="60px"
        mb="10px"
      />
      <Text 
        fontSize='lg'
        fontWeight="700"
        color="brand.500"
        textAlign="center"
      >
        AI Demo Application
      </Text>
      <HSeparator mb="20px" w="284px" />
    </Flex>
  );
}

export default SidebarBrand;

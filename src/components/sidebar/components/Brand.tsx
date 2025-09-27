'use client';
// Chakra imports
import { Flex, useColorModeValue, Text, Image } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  const [mounted, setMounted] = useState(false);
  let logoColor = useColorModeValue('navy.700', 'white');
  let logoSrc = useColorModeValue('/img/m-boxed/m-boxed-orange.svg', '/img/m/m-white.svg');

  useEffect(() => {
    setMounted(true);
  }, []);

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

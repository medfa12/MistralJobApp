'use client';
// Chakra imports
import { Box, Flex } from '@chakra-ui/react';
import Footer from '@/components/footer/FooterAuthDefault';
import FixedPlugin from '@/components/fixedPlugin/FixedPlugin';
import { PropsWithChildren } from 'react';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  illustrationBackground: string;
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children, illustrationBackground } = props;
  // Chakra color mode
  return (
    <Flex position="relative" h="max-content">
      <Flex
        h={{
          sm: 'initial',
          md: 'unset',
          lg: '100vh',
          xl: '97vh',
        }}
        w="100%"
        maxW={{ md: '66%', lg: '1313px' }}
        mx="auto"
        pt={{ sm: '50px', md: '0px' }}
        px={{ lg: '30px', xl: '0px' }}
        ps={{ xl: '70px' }}
        justifyContent="start"
        direction="column"
      >
        {children}
        <Box
          display={{ base: 'none', md: 'block' }}
          h="100%"
          minH="100vh"
          w={{ lg: '50vw', '2xl': '44vw' }}
          position="absolute"
          right="0px"
        >
          <Flex
            bg={`url(${illustrationBackground})`}
            justify="center"
            align="end"
            w="100%"
            h="100%"
            bgSize="cover"
            bgPosition="50%"
            position="absolute"
          />
        </Box>
        <Footer />
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}

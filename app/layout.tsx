'use client';
import React, { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from '@/theme/theme';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Footer from '@/components/footer/FooterAdmin';
// import Navbar from '@/components/navbar/NavbarAdmin'; // Retired component - kept for reference
// import { getActiveRoute, getActiveNavbar } from '@/utils/navigation'; // Retired with navbar
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/App.scss';
import '@/styles/globals.scss';
import '@/styles/Contact.scss';
import '@/styles/Plugins.scss';
import '@/styles/MiniCalendar.scss';
import AppWrappers from './AppWrappers';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState('');
  // Removed unused variables: isOpen, onOpen, onClose (were for navbar)
  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>
          {/* <ChakraProvider theme={theme}> */}
          {pathname?.includes('auth/login') || 
           pathname?.includes('auth/signin') || 
           pathname?.includes('others/register') ||
           pathname?.includes('others/sign-in') ||
           pathname?.includes('landing') ? (
            children
          ) : (
            <Box>
              <Sidebar setApiKey={setApiKey} routes={routes} />
              <Box
                pt={{ base: '20px', md: '20px' }}
                float="right"
                minHeight="100vh"
                height="100%"
                overflow="auto"
                position="relative"
                maxHeight="100%"
                w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                transitionDuration=".2s, .2s, .35s"
                transitionProperty="top, bottom, width"
                transitionTimingFunction="linear, linear, ease"
              >
                {/* Navbar retired - component kept for reference */}
                {/* <Portal>
                  <Box>
                    <Navbar
                      setApiKey={setApiKey}
                      onOpen={onOpen}
                      logoText={'Mistral AI Demo'}
                      brandText={getActiveRoute(routes, pathname)}
                      secondary={getActiveNavbar(routes, pathname)}
                    />
                  </Box>
                </Portal> */}
                <Box
                  mx="auto"
                  p={{ base: '20px', md: '30px' }}
                  pe="20px"
                  minH="100vh"
                  pt="50px"
                >
                  {children}
                  {/* <Component apiKeyApp={apiKey} {...pageProps} /> */}
                </Box>
                <Box>
                  <Footer />
                </Box>
              </Box>
            </Box>
          )}
          {/* </ChakraProvider> */}
        </AppWrappers>
      </body>
    </html>
  );
}



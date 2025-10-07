'use client';
import React, { ReactNode, useContext } from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from '@/theme/theme';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import MobileSidebarButton from '@/components/sidebar/MobileSidebarButton';
import Footer from '@/components/footer/FooterAdmin';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/App.scss';
import '@/styles/globals.scss';
import '@/styles/Contact.scss';
import '@/styles/Plugins.scss';
import '@/styles/MiniCalendar.scss';
import AppWrappers from './AppWrappers';
import { SidebarProvider } from '@/contexts/SidebarProvider';
import { SidebarContext } from '@/contexts/SidebarContext';

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState('');
  const { sidebarWidth } = useContext(SidebarContext);

  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

  const contentWidth = sidebarWidth ? `calc(100% - ${sidebarWidth + 5}px)` : 'calc(100% - 290px)';

  return (
    <>
      {pathname?.includes('auth/login') || 
       pathname?.includes('auth/signin') || 
       pathname?.includes('others/register') ||
       pathname?.includes('others/sign-in') ||
       pathname?.includes('landing') ? (
        children
      ) : (
        <Box>
          <Sidebar setApiKey={setApiKey} routes={routes} />
          <MobileSidebarButton setApiKey={setApiKey} routes={routes} />
          <Box
            pt={{ base: '20px', md: '20px' }}
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: '100%', xl: contentWidth }}
            maxWidth={{ base: '100%', xl: contentWidth }}
            transition="all 0.2s linear"
            transitionProperty="width, max-width"
          >
            <Box
              mx="auto"
              p={{ base: '20px', md: '30px' }}
              pe="20px"
              minH="100vh"
              pt="50px"
            >
              {children}
            </Box>
            <Box>
              <Footer />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </AppWrappers>
      </body>
    </html>
  );
}

'use client';
import React, { ReactNode } from 'react';
import '@/styles/App.scss';
import '@/styles/globals.scss';
import '@/styles/Contact.scss';
import '@/styles/Plugins.scss';
import '@/styles/MiniCalendar.scss';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';

import theme from '@/theme/theme';

const _NoSSR = ({ children }: any) => (
  <React.Fragment>{children}</React.Fragment>
);

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SessionProvider>
  );
}

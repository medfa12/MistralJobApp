'use client';
import React, { ReactNode } from 'react';
import '@/styles/App.scss';
import '@/styles/globals.scss';
import '@/styles/Contact.scss';
import '@/styles/Plugins.scss';
import '@/styles/MiniCalendar.scss';
import { ChakraProvider } from '@chakra-ui/react';

// import dynamic from 'next/dynamic';
import theme from '@/theme/theme';

const _NoSSR = ({ children }: any) => (
  <React.Fragment>{children}</React.Fragment>
);

// const NoSSR = dynamic(() => Promise.resolve(_NoSSR), {
//   ssr: false,
// });

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    // <NoSSR>
    <ChakraProvider theme={theme}>{children}</ChakraProvider>
    // </NoSSR>
  );
}

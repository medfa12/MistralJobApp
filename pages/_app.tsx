'use client';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme/theme';
import { useEffect, useState } from 'react';
import '@/styles/App.scss';
import '@/styles/globals.scss';
import '@/styles/Contact.scss';
import '@/styles/Plugins.scss';
import '@/styles/MiniCalendar.scss';

function App({ Component, pageProps }: AppProps<{}>) {
  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey?.includes('sk-') && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

  return (
    <ChakraProvider theme={theme}>
      <Component apiKeyApp={apiKey} {...pageProps} />
    </ChakraProvider>
  );
}

export default App;

'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Text, Flex, Spinner, useColorModeValue, Icon, Code } from '@chakra-ui/react';
import { MdCode, MdWarning } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  streamingCode: string;
  type: string;
  title?: string;
}

const MotionBox = motion(Box);

export function StreamingArtifactPreview({ streamingCode, type, title }: Props) {
  const [displayCode, setDisplayCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  const headerTextColor = useColorModeValue('gray.700', 'gray.200');
  const codeTextColor = useColorModeValue('gray.800', 'gray.200');

  useEffect(() => {
    if (streamingCode.length > displayCode.length) {
      const timer = setTimeout(() => {
        setDisplayCode(streamingCode.slice(0, displayCode.length + 10));
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setDisplayCode(streamingCode);
    }
  }, [streamingCode, displayCode]);

  useEffect(() => {
    if (!iframeRef.current || !displayCode || type === 'markdown' || type === 'document') return;

    const iframe = iframeRef.current;
    setHasError(false);
    setErrorMessage('');

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      let htmlContent = '';

      switch (type) {
        case 'react':
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <style>
                  body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                  .error-box { padding: 20px; background: #fee; border: 2px solid #f00; border-radius: 8px; margin: 20px; }
                  .error-box h3 { color: #c00; margin-top: 0; }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script>
                  window.onerror = function(msg, url, line, col, error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-box';
                    errorDiv.innerHTML = '<h3>⚠️ Syntax Error</h3><p>' + msg + '</p><p>Line: ' + line + ':' + col + '</p>';
                    document.body.appendChild(errorDiv);
                    window.parent.postMessage({ type: 'error', message: msg }, '*');
                    return true;
                  };
                </script>
                <script type="text/babel">
                  try {
                    ${displayCode}
                    const App = typeof module !== 'undefined' && module.exports ? module.exports.default : window.App;
                    if (App) {
                      ReactDOM.render(React.createElement(App), document.getElementById('root'));
                    }
                  } catch (e) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-box';
                    errorDiv.innerHTML = '<h3>⚠️ Runtime Error</h3><p>' + e.message + '</p>';
                    document.getElementById('root').appendChild(errorDiv);
                    window.parent.postMessage({ type: 'error', message: e.message }, '*');
                  }
                </script>
              </body>
            </html>
          `;
          break;

        case 'html':
        case 'javascript':
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                  .error-box { padding: 20px; background: #fee; border: 2px solid #f00; border-radius: 8px; margin: 20px; }
                  .error-box h3 { color: #c00; margin-top: 0; }
                </style>
              </head>
              <body>
                <script>
                  window.onerror = function(msg, url, line, col, error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-box';
                    errorDiv.innerHTML = '<h3>⚠️ Error</h3><p>' + msg + '</p><p>Line: ' + line + ':' + col + '</p>';
                    document.body.appendChild(errorDiv);
                    window.parent.postMessage({ type: 'error', message: msg }, '*');
                    return true;
                  };
                </script>
                ${displayCode}
              </body>
            </html>
          `;
          break;

        default:
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head><meta charset="UTF-8"></head>
              <body><pre style="padding: 20px; font-family: monospace;">${displayCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body>
            </html>
          `;
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    } catch (error) {
      console.error('Preview error:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [displayCode, type]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'error') {
        setHasError(true);
        setErrorMessage(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const isCodeType = type === 'react' || type === 'html' || type === 'javascript' || type === 'vue';

  return (
    <Box
      w="100%"
      h="100%"
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      position="relative"
    >
      {}
      <Flex
        p={3}
        borderBottom="1px solid"
        borderColor={borderColor}
        align="center"
        gap={2}
        bg={headerBg}
      >
        <Spinner size="sm" color="orange.500" thickness="2px" speed="0.8s" />
        <Icon as={MdCode} color="orange.500" />
        <Text fontSize="sm" fontWeight="600" color={headerTextColor}>
          {title || 'Generating artifact...'}
        </Text>
        <Text fontSize="xs" color="gray.500" ml="auto">
          {displayCode.length} / {streamingCode.length} chars
        </Text>
      </Flex>

      {}
      <AnimatePresence>
        {hasError && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            p={3}
            bg="red.50"
            borderBottom="1px solid"
            borderColor="red.200"
          >
            <Flex align="center" gap={2}>
              <Icon as={MdWarning} color="red.500" />
              <Text fontSize="sm" color="red.700">
                {errorMessage}
              </Text>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>

      {}
      <Box h="calc(100% - 60px)" overflow="hidden">
        {isCodeType ? (
          <Flex h="100%" gap={0}>
            {}
            <Box w="50%" h="100%" overflow="auto" bg={codeBg} p={4}>
              <Code
                display="block"
                whiteSpace="pre-wrap"
                fontSize="xs"
                fontFamily="monospace"
                bg="transparent"
                color={codeTextColor}
              >
                {displayCode}
                <Box
                  as="span"
                  display="inline-block"
                  w="2px"
                  h="1em"
                  bg="orange.500"
                  animation="blink 1s infinite"
                  ml="1px"
                  sx={{
                    '@keyframes blink': {
                      '0%, 49%': { opacity: 1 },
                      '50%, 100%': { opacity: 0 },
                    },
                  }}
                />
              </Code>
            </Box>

            {}
            <Box w="50%" h="100%" borderLeft="1px solid" borderColor={borderColor}>
              <iframe
                ref={iframeRef}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'white',
                }}
                sandbox="allow-scripts allow-same-origin"
                title="Streaming Preview"
              />
            </Box>
          </Flex>
        ) : (
          <Box h="100%" overflow="auto" p={4} bg={codeBg}>
            <Code
              display="block"
              whiteSpace="pre-wrap"
              fontSize="sm"
              fontFamily="monospace"
              bg="transparent"
            >
              {displayCode}
              <Box
                as="span"
                display="inline-block"
                w="2px"
                h="1em"
                bg="orange.500"
                animation="blink 1s infinite"
                ml="1px"
              />
            </Code>
          </Box>
        )}
      </Box>
    </Box>
  );
}

'use client';

import { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
  Flex,
  Badge,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdSearch, MdSearchOff } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactData, InspectedCodeAttachment } from '@/types/types';
import { InspectedElement } from './types';
import { InspectorPanel } from './InspectorPanel';
import { hoverHighlightVariants, selectedHighlightVariants, tooltipVariants } from './animations';
import { extractElementCode } from '@/utils/artifactParser';

interface Props {
  artifact: ArtifactData;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
}

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

export const PreviewView: FC<Props> = ({ artifact, onCodeAttach }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspectMode, setInspectMode] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<InspectedElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<InspectedElement | null>(null);
  const [attachedElement, setAttachedElement] = useState<Element | null>(null);
  const [highlightBox, setHighlightBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const borderColor = useColorModeValue('orange.400', 'orange.300');
  const hoverBorderColor = useColorModeValue('blue.400', 'blue.300');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.02)', 'rgba(255, 255, 255, 0.02)');
  const previewBg = useColorModeValue('white', 'gray.900');

  const getElementPath = (element: Element): string[] => {
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current.tagName !== 'HTML' && current.tagName !== 'BODY') {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).slice(0, 2);
        if (classes.length > 0 && classes[0]) {
          selector += `.${classes.join('.')}`;
        }
      }
      path.unshift(selector);
      current = current.parentElement;
    }

    return path;
  };

  const extractElementInfo = useCallback((element: Element, iframeRect: DOMRect): InspectedElement => {
    const rect = element.getBoundingClientRect();
    const iframeWindow = iframeRef.current?.contentWindow;
    const computed = iframeWindow?.getComputedStyle(element);
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className.toString() || undefined,
      dimensions: {
        width: rect.width,
        height: rect.height,
      },
      position: {
        x: rect.left,
        y: rect.top,
      },
      styles: computed as any,
      path: getElementPath(element),
      attributes: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as { [key: string]: string }),
    };
  }, []);

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!inspectMode || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    const iframeRect = iframe.getBoundingClientRect();
    const x = e.clientX - iframeRect.left;
    const y = e.clientY - iframeRect.top;

    // Get element at point in iframe
    const element = iframeDoc.elementFromPoint(x, y);
    
    if (!element || element.tagName === 'HTML' || element.tagName === 'BODY') {
      setHoveredElement(null);
      setHighlightBox(null);
      return;
    }

    const elementRect = element.getBoundingClientRect();
    
    setHighlightBox({
      top: elementRect.top,
      left: elementRect.left,
      width: elementRect.width,
      height: elementRect.height,
    });

    setHoveredElement(extractElementInfo(element, iframeRect));
  }, [inspectMode, extractElementInfo]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!inspectMode || !iframeRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    const iframeRect = iframe.getBoundingClientRect();
    const x = e.clientX - iframeRect.left;
    const y = e.clientY - iframeRect.top;

    const element = iframeDoc.elementFromPoint(x, y);
    
    if (!element || element.tagName === 'HTML' || element.tagName === 'BODY') {
      return;
    }

    setSelectedElement(extractElementInfo(element, iframeRect));
    setAttachedElement(element);

    // Create code attachment if callback provided
    if (onCodeAttach) {
      const code = extractElementCode(element, artifact.type);
      const computed = iframeRef.current?.contentWindow?.getComputedStyle(element);
      
      // Extract important styles
      const importantStyles = ['backgroundColor', 'color', 'padding', 'margin', 'fontSize', 'fontWeight'];
      const styles = importantStyles
        .map(prop => {
          const value = computed?.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
          return value && value !== 'none' ? `${prop}: ${value}` : '';
        })
        .filter(Boolean)
        .join('; ');

      const attachment: InspectedCodeAttachment = {
        type: 'inspected-code',
        elementTag: element.tagName.toLowerCase(),
        elementId: element.id || undefined,
        elementClasses: element.className.toString() || undefined,
        code,
        styles: styles || undefined,
        sourceArtifactId: artifact.identifier,
      };

      onCodeAttach(attachment);
    }
  }, [inspectMode, extractElementInfo, onCodeAttach, artifact]);

  const toggleInspectMode = () => {
    setInspectMode(!inspectMode);
    if (inspectMode) {
      // Cleanup when turning off
      setHoveredElement(null);
      setSelectedElement(null);
      setHighlightBox(null);
    }
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        setError('Unable to access iframe document');
        return;
      }

      let htmlContent = '';

      switch (artifact.type) {
        case 'html':
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  }
                </style>
              </head>
              <body>
                ${artifact.code}
              </body>
            </html>
          `;
          break;

        case 'react':
        case 'javascript':
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
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script type="text/babel">
                  ${artifact.code}
                  
                  // Try to render if there's a default export or App component
                  try {
                    const App = typeof module !== 'undefined' && module.exports ? module.exports.default : window.App;
                    if (App) {
                      ReactDOM.render(React.createElement(App), document.getElementById('root'));
                    }
                  } catch (e) {
                    console.error('Render error:', e);
                  }
                </script>
              </body>
            </html>
          `;
          break;

        case 'vue':
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  }
                </style>
              </head>
              <body>
                <div id="app"></div>
                <script>
                  ${artifact.code}
                </script>
              </body>
            </html>
          `;
          break;

        default:
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body>
                <pre>${artifact.code}</pre>
              </body>
            </html>
          `;
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render preview');
    }
  }, [artifact]);

  return (
    <Box w="100%" h="100%" position="relative">
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Preview Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Inspect Mode Toggle */}
      <Flex position="absolute" top={2} right={2} zIndex={10} gap={2}>
        {inspectMode && (
          <Badge colorScheme="orange" px={3} py={2} borderRadius="md" fontSize="sm">
            🔍 Inspect Mode
          </Badge>
        )}
        <Tooltip label={inspectMode ? 'Exit Inspect Mode' : 'Enable Inspect Mode'}>
          <MotionIconButton
            aria-label="Toggle Inspect Mode"
            icon={inspectMode ? <MdSearchOff /> : <MdSearch />}
            onClick={toggleInspectMode}
            colorScheme={inspectMode ? 'orange' : 'gray'}
            size="md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        </Tooltip>
      </Flex>

      <Box position="relative" w="100%" h="100%">
        {/* Preview Iframe */}
              <Box
                as="iframe"
                ref={iframeRef}
                w="100%"
                h="600px"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                borderRadius="lg"
                bg={previewBg}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
                pointerEvents={inspectMode ? 'none' : 'auto'}
              />

        {/* Inspect Mode Overlay */}
        {inspectMode && (
          <Box
            ref={overlayRef}
            position="absolute"
            top={0}
            left={0}
            right={selectedElement ? '300px' : 0}
            bottom={0}
            bg={overlayBg}
            cursor="crosshair"
            zIndex={5}
            onMouseMove={handleOverlayMouseMove}
            onClick={handleOverlayClick}
            onMouseLeave={() => {
              setHoveredElement(null);
              setHighlightBox(null);
            }}
          />
        )}

        {/* Hover Highlight */}
        {inspectMode && highlightBox && !selectedElement && (
          <motion.div
            style={{
              position: 'absolute',
              border: `2px solid ${hoverBorderColor}`,
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: `0 0 0 4px rgba(66, 153, 225, 0.25), 0 0 20px rgba(66, 153, 225, 0.15)`,
            }}
            animate={{
              top: highlightBox.top,
              left: highlightBox.left,
              width: highlightBox.width,
              height: highlightBox.height,
              opacity: 1,
            }}
            initial={{
              top: highlightBox.top,
              left: highlightBox.left,
              width: highlightBox.width,
              height: highlightBox.height,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
              mass: 0.5,
            }}
          />
        )}

        {/* Selected Element Highlight */}
        <AnimatePresence>
          {inspectMode && highlightBox && selectedElement && (
            <motion.div
              key="selected-highlight"
              style={{
                position: 'absolute',
                border: `3px solid ${borderColor}`,
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 10,
                background: `linear-gradient(135deg, rgba(255, 130, 5, 0.1), rgba(255, 130, 5, 0.05))`,
              }}
              animate={{
                top: highlightBox.top,
                left: highlightBox.left,
                width: highlightBox.width,
                height: highlightBox.height,
              }}
              initial={{
                top: highlightBox.top,
                left: highlightBox.left,
                width: highlightBox.width,
                height: highlightBox.height,
                opacity: 0,
                scale: 0.9,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
              variants={selectedHighlightVariants}
            />
          )}
        </AnimatePresence>

        {/* Hover Tooltip */}
        {inspectMode && hoveredElement && !selectedElement && highlightBox && (
          <motion.div
            style={{
              position: 'absolute',
              background: '#3182ce',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 11,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            animate={{
              top: Math.max(highlightBox.top - 35, 5),
              left: highlightBox.left,
              opacity: 1,
              scale: 1,
            }}
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            {hoveredElement.tagName}
            {hoveredElement.id && `#${hoveredElement.id}`}
            {hoveredElement.className && `.${hoveredElement.className.split(' ')[0]}`}
          </motion.div>
        )}
      </Box>

      {/* Inspector Panel */}
      <InspectorPanel element={selectedElement} isVisible={inspectMode && !!selectedElement} />

      {/* Clear Selection Button */}
      <AnimatePresence>
        {inspectMode && selectedElement && (
          <motion.button
            key="clear-button"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              background: '#2D3748',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              fontWeight: '500',
            }}
            onClick={() => {
              setSelectedElement(null);
              setHighlightBox(null);
            }}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            whileHover={{ scale: 1.05, background: '#4A5568' }}
            whileTap={{ scale: 0.95 }}
          >
            ✕ Clear Selection
          </motion.button>
        )}
      </AnimatePresence>
    </Box>
  );
};

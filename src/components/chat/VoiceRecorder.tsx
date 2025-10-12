'use client';

import {
  Flex,
  Box,
  Button,
  Text,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdClose, MdArrowUpward } from 'react-icons/md';
import { useEffect, useRef } from 'react';

const pulseKeyframes = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface VoiceRecorderProps {
  isRecording: boolean;
  elapsedTime: string;
  autoSend: boolean;
  hasRecording: boolean;
  onToggleAutoSend: () => void;
  onSend: () => void;
  onCancel: () => void;
  audioStream: MediaStream | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  elapsedTime,
  autoSend,
  hasRecording,
  onToggleAutoSend,
  onSend,
  onCancel,
  audioStream,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;

    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(audioStream);
    source.connect(analyserRef.current);

    analyserRef.current.fftSize = 1024;
    analyserRef.current.smoothingTimeConstant = 0.85;
    analyserRef.current.minDecibels = -90;
    analyserRef.current.maxDecibels = -10;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 48;
    const barSpacing = 2;

    const draw = () => {
      if (!analyserRef.current || !ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width - (barCount - 1) * barSpacing) / barCount;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;

        const barHeight = Math.max(4, value * canvas.height * 0.8);
        const x = i * (barWidth + barSpacing);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#22C55E');
        gradient.addColorStop(1, '#EAB308');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream]);

  return (
    <Flex
      w="100%"
      maxW="920px"
      h="112px"
      px="24px"
      py="18px"
      borderRadius="16px"
      bg="#17181A"
      boxShadow="0 6px 28px rgba(0,0,0,0.35)"
      align="center"
      gap="16px"
    >
      <Button
        w="40px"
        h="40px"
        minW="40px"
        borderRadius="12px"
        bg="#1F2023"
        _hover={{ bg: '#2A2C31' }}
        onClick={onCancel}
        p="0"
      >
        <Icon as={MdClose} color="#AEB3BB" boxSize="20px" />
      </Button>

      <Box flex="1" h="44px" position="relative">
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: isRecording ? 'block' : 'none',
          }}
        />
        {!isRecording && (
          <Flex
            w="100%"
            h="100%"
            align="center"
            justify="center"
          >
            {Array.from({ length: 48 }).map((_, i) => (
              <Box
                key={i}
                w="6px"
                h="4px"
                bg="#2F3238"
                borderRadius="2px"
                mx="1px"
              />
            ))}
          </Flex>
        )}
      </Box>

      <Flex gap="12px" align="center">
        {isRecording && (
          <>
            <Box
              w="10px"
              h="10px"
              borderRadius="50%"
              bg="#F43F5E"
              boxShadow="0 0 8px rgba(244,63,94,0.6)"
              animation={`${pulseKeyframes} 1.5s ease-in-out infinite`}
            />
            <Text fontSize="16px" color="#C5CAD3" fontWeight="600">
              {elapsedTime}
            </Text>
          </>
        )}

        <Button
          h="32px"
          px="10px"
          borderRadius="16px"
          bg={autoSend ? '#232529' : '#232529'}
          color={autoSend ? '#10B981' : '#6B7280'}
          fontSize="14px"
          fontWeight="500"
          _hover={{ bg: '#2A2B2F' }}
          onClick={onToggleAutoSend}
        >
          Autosend {autoSend ? 'ON' : 'OFF'}
        </Button>

        <Button
          w="40px"
          h="40px"
          minW="40px"
          borderRadius="12px"
          bg="rgba(255, 255, 255, 0.06)"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          _disabled={{
            opacity: 0.4,
            cursor: 'not-allowed',
          }}
          onClick={onSend}
          isDisabled={!hasRecording}
          p="0"
        >
          <Icon as={MdArrowUpward} color="#E6EAF2" boxSize="20px" />
        </Button>
      </Flex>
    </Flex>
  );
};

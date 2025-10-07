'use client';

import {
  Flex,
  Input,
  Button,
  Text,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdAttachFile, MdImage, MdDescription, MdMic } from 'react-icons/md';
import { ModelInfo } from '@/config/models';
import { useState, useCallback } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { TranscribingIndicator } from './TranscribingIndicator';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  loading: boolean;
  modelInfo: ModelInfo | undefined;
  attachmentCount: number;
  onImageAttach: (file: File, preview: string) => void;
  onDocumentAttach: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  loading,
  modelInfo,
  attachmentCount,
  onImageAttach,
  onDocumentAttach,
}) => {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  const toast = useToast();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [autoSend, setAutoSend] = useState(true);
  const transcriptionAbortRef = useState<AbortController | null>(null)[0];

  const handleTranscription = useCallback(async (audioBlob: Blob, duration: number) => {
    setIsTranscribing(true);
    setIsVoiceMode(false);

    try {
      const apiKey = localStorage.getItem('apiKey');
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const abortController = new AbortController();
      if (transcriptionAbortRef) {
        transcriptionAbortRef.constructor(abortController);
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('apiKey', apiKey);

      const response = await fetch('/api/chat/transcribe', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const transcribedText = result.text || '';

      onChange(transcribedText);
      setIsTranscribing(false);

      if (autoSend && transcribedText.trim()) {
        setTimeout(() => {
          onSubmit();
        }, 100);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Transcription cancelled');
      } else {
        console.error('Transcription error:', error);
        toast({
          title: 'Transcription Failed',
          description: 'Could not transcribe audio. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
      setIsTranscribing(false);
    }
  }, [onChange, onSubmit, autoSend, toast, transcriptionAbortRef]);

  const {
    isRecording,
    hasRecording,
    elapsedTime,
    audioBlob,
    audioStream,
    permission,
    error: micError,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceRecording({
    onRecordingComplete: handleTranscription,
    autoSend,
  });

  const handleMicClick = useCallback(async () => {
    if (loading || isTranscribing) return;
    
    const success = await startRecording();
    
    if (success) {
      setIsVoiceMode(true);
    } else if (micError) {
      toast({
        title: 'Microphone Error',
        description: micError,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [loading, isTranscribing, startRecording, micError, toast]);

  const handleVoiceCancel = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    reset();
    setIsVoiceMode(false);
  }, [isRecording, stopRecording, reset]);

  const handleVoiceSend = useCallback(() => {
    stopRecording();
    if (audioBlob) {
      handleTranscription(audioBlob, 0);
    }
    reset();
  }, [stopRecording, audioBlob, handleTranscription, reset]);

  const handleCancelTranscription = useCallback(() => {
    if (transcriptionAbortRef) {
      transcriptionAbortRef.abort?.();
    }
    setIsTranscribing(false);
  }, [transcriptionAbortRef]);

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        onImageAttach(file, preview);
      }
    };
    input.click();
  };

  const handleDocumentSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onDocumentAttach(file);
      }
    };
    input.click();
  };

  if (isTranscribing) {
    return <TranscribingIndicator onCancel={handleCancelTranscription} />;
  }

  if (isVoiceMode) {
    return (
      <VoiceRecorder
        isRecording={isRecording}
        elapsedTime={elapsedTime}
        autoSend={autoSend}
        hasRecording={hasRecording}
        onToggleAutoSend={() => setAutoSend(!autoSend)}
        onSend={handleVoiceSend}
        onCancel={handleVoiceCancel}
        audioStream={audioStream}
      />
    );
  }

  return (
    <Flex direction="column" gap="10px" flexShrink={0}>
      {modelInfo && modelInfo.supportedAttachments.length > 0 && (
        <Flex gap="8px" align="center" flexWrap="wrap">
          <Icon as={MdAttachFile} color={textColor} boxSize="18px" />
          {modelInfo.supportedAttachments.includes('image') && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={MdImage} />}
              onClick={handleImageSelect}
            >
              Image
            </Button>
          )}
          {modelInfo.supportedAttachments.includes('document') && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={MdDescription} />}
              onClick={handleDocumentSelect}
            >
              PDF
            </Button>
          )}
          {attachmentCount > 0 && (
            <Text fontSize="xs" color={textColor} ml="auto">
              {attachmentCount} file(s) attached
            </Text>
          )}
        </Flex>
      )}

      <Flex gap="10px" align="center">
        <Input
          minH="54px"
          h="100%"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="45px"
          p="15px 20px"
          me="10px"
          fontSize="sm"
          fontWeight="500"
          _focus={{ borderColor: 'none' }}
          color={inputColor}
          _placeholder={placeholderColor}
          placeholder="Type your message here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
        />
        
        <Button
          minW="54px"
          w="54px"
          h="54px"
          borderRadius="45px"
          bg="white"
          _hover={{ bg: 'gray.100' }}
          onClick={handleMicClick}
          isDisabled={loading}
          p="0"
        >
          <Icon as={MdMic} color="gray.800" boxSize="24px" />
        </Button>

        <Button
          variant="primary"
          py="20px"
          px="16px"
          fontSize="sm"
          borderRadius="45px"
          w={{ base: '160px', md: '210px' }}
          h="54px"
          _hover={{
            boxShadow:
              '0px 21px 27px -10px rgba(250, 80, 15, 0.48) !important',
            bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%) !important',
            _disabled: {
              bg: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)',
            },
          }}
          onClick={onSubmit}
          isLoading={loading}
        >
          Submit
        </Button>
      </Flex>
    </Flex>
  );
};


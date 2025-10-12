'use client';

import { useState, useRef } from 'react';
import {
  Button,
  useToast,
  Icon,
  Box,
  Text,
  VStack,
  Progress,
} from '@chakra-ui/react';
import { MdUpload } from 'react-icons/md';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file (JPG, PNG, GIF, etc.)';
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Avatar updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (onUploadSuccess && data.avatar) {
          onUploadSuccess(data.avatar);
        }
      } else {
        throw new Error(data.message || data.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {uploading && uploadProgress > 0 && (
        <VStack spacing={2} mb={3}>
          <Progress
            value={uploadProgress}
            size="sm"
            width="100%"
            colorScheme="brand"
            borderRadius="md"
            hasStripe
            isAnimated
          />
          <Text fontSize="sm" color="gray.500">
            Uploading... {uploadProgress}%
          </Text>
        </VStack>
      )}

      <Button
        onClick={handleButtonClick}
        isLoading={uploading}
        loadingText="Uploading..."
        variant="outline"
        colorScheme="brand"
        size="sm"
        leftIcon={<Icon as={MdUpload} />}
        width="100%"
      >
        Upload New Avatar
      </Button>
      
      <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
        Max size: 5MB • Formats: JPG, PNG, GIF
      </Text>
    </Box>
  );
}


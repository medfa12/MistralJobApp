/**
 * Example: Attachment Upload Component
 * 
 * This is a reference implementation showing how to add attachment upload
 * functionality that respects per-model constraints.
 * 
 * To integrate this into your chat page:
 * 1. Import this component
 * 2. Place it above the Input field
 * 3. Pass the current model and onAttach callback
 * 4. Handle the attachments in your message sending logic
 */

'use client';

import { useState } from 'react';
import { Box, Flex, Icon, IconButton, Text, useColorModeValue, Badge } from '@chakra-ui/react';
import { MdImage, MdAudiotrack, MdDescription, MdClose, MdAttachFile } from 'react-icons/md';
import { ModelInfo, AttachmentType } from '@/config/models';

interface AttachmentFile {
  type: AttachmentType;
  file: File;
  preview?: string;
}

interface AttachmentUploadProps {
  model: ModelInfo;
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ model, onAttachmentsChange }) => {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.100');

  const validateFile = (file: File, type: AttachmentType): { valid: boolean; error?: string } => {
    const limits = model.attachmentLimits?.[type];
    if (!limits) return { valid: false, error: 'This model does not support this attachment type' };

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > limits.maxSize) {
      return { valid: false, error: `File size exceeds ${limits.maxSize}MB limit` };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
    if (!limits.supportedFormats.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `Format not supported. Supported formats: ${limits.supportedFormats.join(', ')}` 
      };
    }

    // Check count limit
    const currentCount = attachments.filter(a => a.type === type).length;
    if (currentCount >= limits.maxCount) {
      return { valid: false, error: `Maximum ${limits.maxCount} ${type}(s) allowed` };
    }

    return { valid: true };
  };

  const handleFileSelect = async (type: AttachmentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    const limits = model.attachmentLimits?.[type];
    if (!limits) return;

    // Set accept attribute based on supported formats
    const acceptMap: Record<AttachmentType, string> = {
      image: 'image/png,image/jpeg,image/webp,image/gif',
      audio: 'audio/mpeg,audio/wav,audio/mp3',
      document: 'application/pdf',
    };
    input.accept = acceptMap[type];

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const validation = validateFile(file, type);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create preview for images
      let preview: string | undefined;
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }

      const newAttachment: AttachmentFile = { type, file, preview };
      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);
      onAttachmentsChange(updatedAttachments);
    };

    input.click();
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  const getAttachmentIcon = (type: AttachmentType) => {
    switch (type) {
      case 'image': return MdImage;
      case 'audio': return MdAudiotrack;
      case 'document': return MdDescription;
    }
  };

  return (
    <Box>
      {/* Attachment Buttons */}
      {model.supportedAttachments.length > 0 && (
        <Flex gap="8px" mb="10px" align="center">
          <Icon as={MdAttachFile} color={textColor} boxSize="20px" />
          {model.supportedAttachments.map((type) => {
            const limits = model.attachmentLimits?.[type];
            const currentCount = attachments.filter(a => a.type === type).length;
            const isMaxed = limits ? currentCount >= limits.maxCount : false;

            return (
              <IconButton
                key={type}
                aria-label={`Attach ${type}`}
                icon={<Icon as={getAttachmentIcon(type)} />}
                size="sm"
                variant="ghost"
                onClick={() => handleFileSelect(type)}
                isDisabled={isMaxed}
                title={limits ? `${type}: ${limits.supportedFormats.join(', ')} (max ${limits.maxSize}MB)` : ''}
              />
            );
          })}
          {attachments.length > 0 && (
            <Badge colorScheme="orange" ml="auto">
              {attachments.length} attached
            </Badge>
          )}
        </Flex>
      )}

      {/* Preview Attachments */}
      {attachments.length > 0 && (
        <Flex gap="8px" mb="10px" flexWrap="wrap">
          {attachments.map((attachment, index) => (
            <Flex
              key={index}
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              p="8px"
              align="center"
              gap="8px"
            >
              {attachment.preview ? (
                <Box
                  as="img"
                  src={attachment.preview}
                  alt={attachment.file.name}
                  w="40px"
                  h="40px"
                  objectFit="cover"
                  borderRadius="4px"
                />
              ) : (
                <Icon as={getAttachmentIcon(attachment.type)} boxSize="20px" color={textColor} />
              )}
              <Box flex="1" minW="0">
                <Text fontSize="xs" color={textColor} noOfLines={1}>
                  {attachment.file.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {(attachment.file.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
              <IconButton
                aria-label="Remove"
                icon={<Icon as={MdClose} />}
                size="xs"
                variant="ghost"
                onClick={() => removeAttachment(index)}
              />
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};

/**
 * Usage Example:
 * 
 * ```tsx
 * const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
 * 
 * // In your chat component:
 * <AttachmentUpload 
 *   model={getModelInfo(model)!} 
 *   onAttachmentsChange={setAttachments}
 * />
 * 
 * // When sending message, format for Mistral API:
 * const messageContent = [
 *   { type: "text", text: inputCode },
 *   ...attachments.map(att => {
 *     if (att.type === 'image') {
 *       return {
 *         type: "image_url",
 *         image_url: await fileToBase64(att.file) // Helper function to convert
 *       };
 *     }
 *     // Handle other types similarly
 *   })
 * ];
 * ```
 */


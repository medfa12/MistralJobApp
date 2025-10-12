import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { Attachment } from '@/types/types';

interface LocalAttachment {
  type: string;
  file: File;
  preview?: string;
}

export function useAttachments() {
  const toast = useToast();
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);

  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.preview) {
          URL.revokeObjectURL(att.preview);
        }
      });
    };
  }, [attachments]);

  const uploadToCloudinary = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/chat/upload-attachment', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const addAttachment = useCallback((type: string, file: File, preview?: string) => {
    setAttachments(prev => [...prev, { type, file, preview }]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => {
      const attachment = prev[index];
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments(prev => {
      prev.forEach(att => {
        if (att.preview) {
          URL.revokeObjectURL(att.preview);
        }
      });
      return [];
    });
  }, []);

  const processAttachments = async (): Promise<{
    contentArray: any[];
    uploadedAttachments: Attachment[];
  }> => {
    const contentArray: any[] = [];
    const uploadedAttachments: Attachment[] = [];

    for (const attachment of attachments) {
      try {
        const uploadResult = await uploadToCloudinary(attachment.file, attachment.type);

        uploadedAttachments.push({
          type: uploadResult.type,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          cloudinaryPublicId: uploadResult.cloudinaryPublicId,
          cloudinaryUrl: uploadResult.cloudinaryUrl,
        });

        const base64 = await fileToBase64(attachment.file);
        if (attachment.type === 'image') {
          const mimeType = attachment.file.type;
          contentArray.push({
            type: 'image_url',
            image_url: `data:${mimeType};base64,${base64}`
          });
        } else if (attachment.type === 'document') {
          contentArray.push({
            type: 'document_url',
            document_url: `data:application/pdf;base64,${base64}`
          });
        }
      } catch (error) {
        console.error('Error uploading attachment:', error);
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${attachment.file.name}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        throw error;
      }
    }

    return { contentArray, uploadedAttachments };
  };

  return {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    processAttachments,
  };
}

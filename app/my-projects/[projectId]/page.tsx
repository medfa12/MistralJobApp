'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/card/Card';
import Dialog from '@/components/ui/Dialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Input,
  Progress,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { MdArrowBack, MdUpload, MdDelete, MdRefresh, MdDescription, MdChat, MdEdit } from 'react-icons/md';

interface ProjectDocument {
  id: string;
  name: string;
  extension: string;
  size: number;
  numberOfPages?: number;
  summary?: string;
  processingStatus: string;
  uploadedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  documentCount?: number;
  totalSize?: number;
  createdAt: string;
  updatedAt: string;
  documents?: ProjectDocument[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<ProjectDocument | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [updatingProject, setUpdatingProject] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const toast = useToast();

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const fileTextColor = useColorModeValue('gray.600', 'gray.400');

  const syncApiKey = useCallback(() => {
    if (typeof window === 'undefined') return;
    const storedKey = localStorage.getItem('apiKey') || '';
    setApiKey(storedKey);
  }, []);

  const getLatestApiKey = useCallback(() => {
    if (typeof window === 'undefined') {
      return apiKey;
    }
    const storedKey = localStorage.getItem('apiKey') || '';
    if (storedKey !== apiKey) {
      setApiKey(storedKey);
    }
    return storedKey;
  }, [apiKey]);

  useEffect(() => {
    syncApiKey();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', syncApiKey);
      return () => window.removeEventListener('storage', syncApiKey);
    }
  }, [syncApiKey]);

  useEffect(() => {
    if (!project) return;
    setEditName(project.name || '');
    setEditDescription(project.description || '');
    setEditEmoji(project.emoji || '');
  }, [project]);

  const loadProject = useCallback(async ({ showLoader = true, silent = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await fetch(`/api/projects/${projectId}/get`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setProject(data.project);
      } else {
        if (!silent) {
          toast({
            title: 'Error',
            description: data.error || 'Failed to load project',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      // Only show error toast if not silent (background polling should be silent)
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to load project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (projectId) {
      loadProject({ showLoader: true });
    }
  }, [projectId, loadProject]);

  useEffect(() => {
    const hasInProgress = project?.documents?.some((doc) => {
      const status = doc.processingStatus?.toLowerCase();
      return status === 'processing' || status === 'pending';
    });

    if (!hasInProgress) {
      return;
    }

    console.log('📊 Starting status check for document processing...');
    
    let timeoutId: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 120;
    
    const checkStatus = async () => {
      if (pollCount >= maxPolls) {
        console.log('🛑 Max polls reached, stopping status check');
        return;
      }

      if (document.hidden) {
        timeoutId = setTimeout(checkStatus, 10000);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/status`);
        const data = await response.json();

        if (data.success && !data.hasProcessing) {
          console.log('✅ All documents processed');
          await loadProject({ showLoader: false, silent: true });
          return;
        }

        pollCount++;
        const delay = Math.min(5000 + pollCount * 500, 15000);
        timeoutId = setTimeout(checkStatus, delay);
      } catch (error) {
        console.error('Error checking status:', error);
        timeoutId = setTimeout(checkStatus, 10000);
      }
    };

    timeoutId = setTimeout(checkStatus, 2000);

    return () => {
      console.log('🛑 Cleaning up status check');
      clearTimeout(timeoutId);
    };
  }, [project?.documents, loadProject, projectId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onOpen();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setUploadProgress(10);

      const apiKeyForRequest = getLatestApiKey();
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (apiKeyForRequest) {
        formData.append('apiKey', apiKeyForRequest);
      }

      setUploadProgress(30);

      const response = await fetch(`/api/projects/${projectId}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(apiKeyForRequest ? { 'x-mistral-api-key': apiKeyForRequest } : {}),
        },
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Document uploaded',
          description: 'Your document is being processed',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setUploadProgress(100);
        onClose();
        setSelectedFile(null);
        loadProject({ showLoader: false, silent: false });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload document',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDeletingDocId(documentId);
      const response = await fetch(`/api/projects/${projectId}/documents/${documentId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Document deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        loadProject({ showLoader: false, silent: false });
        setPendingDeleteDoc(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete document',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleUpdateProject = async () => {
    if (!project) return;
    if (!editName.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please provide a name for your project.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUpdatingProject(true);
      const response = await fetch(`/api/projects/${projectId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          emoji: editEmoji.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                name: data.project.name,
                description: data.project.description,
                emoji: data.project.emoji || undefined,
              }
            : prev,
        );
        toast({
          title: 'Project updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        onEditClose();
      } else {
        throw new Error(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingProject(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
        <Card py="40px">
          <Text textAlign="center" color="gray.500">
            Project not found
          </Text>
          <Flex justify="center" mt="20px">
            <Button onClick={() => router.push('/my-projects')}>
              Back to Projects
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      {}
      <Card w="100%" mb="20px">
        <Flex align="center" justify="space-between" direction={{ base: 'column', md: 'row' }}>
          <Flex align="center" gap="15px">
            <IconButton
              aria-label="Back"
              icon={<Icon as={MdArrowBack} />}
              onClick={() => router.push('/my-projects')}
              variant="ghost"
            />
            {project.emoji && <Text fontSize="3xl">{project.emoji}</Text>}
            <Box>
              <Text fontSize="2xl" fontWeight="700" color={textColor}>
                {project.name}
              </Text>
              {project.description && (
                <Text fontSize="sm" color="gray.500" mt="5px">
                  {project.description}
                </Text>
              )}
            </Box>
          </Flex>
          <Flex gap="10px" mt={{ base: '20px', md: '0' }} wrap="wrap">
            <Button
              leftIcon={<Icon as={MdEdit} />}
              variant="outline"
              onClick={onEditOpen}
            >
              Edit
            </Button>
            <Button
              leftIcon={<Icon as={MdChat} />}
              variant="outline"
              onClick={() => router.push(`/my-projects/${projectId}/chat`)}
              isDisabled={!project.documents?.some((d) => (d.processingStatus || '').toLowerCase() === 'completed')}
            >
              Chat
            </Button>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              variant="outline"
              onClick={() => loadProject({ showLoader: true, silent: false })}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={MdUpload} />}
              variant="primary"
              as="label"
              cursor="pointer"
            >
              Upload Document
              <Input
                type="file"
                display="none"
                accept=".pdf,.txt,.doc,.docx,.md"
                onChange={handleFileSelect}
              />
            </Button>
          </Flex>
        </Flex>
      </Card>

      {}
      <Flex gap="20px" mb="20px" direction={{ base: 'column', md: 'row' }}>
        <Card flex="1" p="20px">
          <Text fontSize="sm" color="gray.500" mb="5px">Total Documents</Text>
          <Text fontSize="2xl" fontWeight="700" color={textColor}>
            {project.documentCount || 0}
          </Text>
        </Card>
        <Card flex="1" p="20px">
          <Text fontSize="sm" color="gray.500" mb="5px">Total Size</Text>
          <Text fontSize="2xl" fontWeight="700" color={textColor}>
            {formatFileSize(project.totalSize || 0)}
          </Text>
        </Card>
        <Card flex="1" p="20px">
          <Text fontSize="sm" color="gray.500" mb="5px">Created</Text>
          <Text fontSize="lg" fontWeight="600" color={textColor}>
            {new Date(project.createdAt).toLocaleDateString()}
          </Text>
        </Card>
      </Flex>

      {}
      <Card>
        <Flex align="center" justify="space-between" mb="20px">
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            Documents
          </Text>
        </Flex>

        {project.documents && project.documents.length > 0 ? (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Size</Th>
                  <Th>Pages</Th>
                  <Th>Status</Th>
                  <Th>Uploaded</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {project.documents.map((doc) => (
                  <Tr key={doc.id}>
                    <Td>
                      <Flex align="center" gap="10px">
                        <Icon as={MdDescription} color="blue.500" />
                        <Text fontSize="sm" fontWeight="500">
                          {doc.name}
                        </Text>
                      </Flex>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple">{doc.extension.toUpperCase()}</Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{formatFileSize(doc.size)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{doc.numberOfPages || '-'}</Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={(() => {
                          const s = (doc.processingStatus || '').toLowerCase();
                          if (s === 'completed') return 'green';
                          if (s === 'processing' || s === 'pending') return 'yellow';
                          if (s === 'failed') return 'red';
                          return 'gray';
                        })()}
                      >
                        {(() => {
                          const s = (doc.processingStatus || '').toLowerCase();
                          return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
                        })()}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Delete"
                        icon={<Icon as={MdDelete} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => setPendingDeleteDoc(doc)}
                        isLoading={deletingDocId === doc.id}
                        isDisabled={deletingDocId !== null && deletingDocId !== doc.id}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Flex justify="center" align="center" minH="200px">
            <Text color="gray.500">
              No documents yet. Upload your first document!
            </Text>
          </Flex>
        )}
      </Card>

      {}
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteDoc)}
        onClose={() => {
          if (!deletingDocId) {
            setPendingDeleteDoc(null);
          }
        }}
        onConfirm={() => {
          if (pendingDeleteDoc && !deletingDocId) {
            handleDeleteDocument(pendingDeleteDoc.id);
          }
        }}
        title="Delete document"
        description={
          pendingDeleteDoc
            ? `This will permanently remove "${pendingDeleteDoc.name}" from the project.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={Boolean(deletingDocId)}
        colorScheme="red"
      />

      {}
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Upload Document"
        size="md"
        primaryAction={{
          label: 'Upload',
          onClick: handleUpload,
          isLoading: uploading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: onClose,
        }}
        closeOnOverlayClick={!uploading}
      >
        {selectedFile && (
          <Box>
            <Text fontWeight="600" mb="10px">Selected File:</Text>
            <Text fontSize="sm" color={fileTextColor} mb="5px">
              {selectedFile.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Size: {formatFileSize(selectedFile.size)}
            </Text>
            {uploading && (
              <Box mt="20px">
                <Text fontSize="sm" mb="10px">Uploading...</Text>
                <Progress value={uploadProgress} colorScheme="blue" />
              </Box>
            )}
          </Box>
        )}
      </Dialog>

      <Dialog
        isOpen={isEditOpen}
        onClose={onEditClose}
        title="Edit Project"
        size="md"
        primaryAction={{
          label: 'Save Changes',
          onClick: handleUpdateProject,
          isLoading: updatingProject,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            if (!updatingProject) {
              onEditClose();
            }
          },
        }}
        closeOnOverlayClick={!updatingProject}
      >
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Project Name</FormLabel>
            <Input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Project name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              placeholder="Describe this project"
              rows={4}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Emoji</FormLabel>
            <Input
              value={editEmoji}
              onChange={(event) => setEditEmoji(event.target.value)}
              placeholder="Optional emoji (e.g. 🚀)"
              maxLength={4}
            />
          </FormControl>
        </VStack>
      </Dialog>
    </Box>
  );
}

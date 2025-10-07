'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/card/Card';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Progress,
} from '@chakra-ui/react';
import { MdArrowBack, MdUpload, MdDelete, MdRefresh, MdDescription } from 'react-icons/md';

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
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/get`);
      const data = await response.json();

      if (data.success) {
        setProject(data.project);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

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

      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(30);

      const response = await fetch(`/api/projects/${projectId}/documents/upload`, {
        method: 'POST',
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
        loadProject();
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
        loadProject();
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
      {/* Header */}
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
          <Flex gap="10px" mt={{ base: '20px', md: '0' }}>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              variant="outline"
              onClick={loadProject}
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

      {/* Stats */}
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

      {/* Documents Table */}
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
                        colorScheme={
                          doc.processingStatus === 'Completed' ? 'green' :
                          doc.processingStatus === 'Running' ? 'yellow' :
                          'red'
                        }
                      >
                        {doc.processingStatus}
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
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this document?')) {
                            handleDeleteDocument(doc.id);
                          }
                        }}
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

      {/* Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFile && (
              <Box>
                <Text fontWeight="600" mb="10px">Selected File:</Text>
                <Text fontSize="sm" color="gray.600" mb="5px">
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
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              mr={3}
              onClick={handleUpload}
              isLoading={uploading}
              isDisabled={!selectedFile}
            >
              Upload
            </Button>
            <Button onClick={onClose} isDisabled={uploading}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


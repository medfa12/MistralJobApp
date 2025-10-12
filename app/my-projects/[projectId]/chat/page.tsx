'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import ProjectChat from '@/components/chat/ProjectChat';
import { MdArrowBack } from 'react-icons/md';

interface Project {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  documentCount?: number;
  documents?: { processingStatus: string }[];
}

export default function ProjectChatPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const textColor = useColorModeValue('navy.700', 'white');
  const cardBg = useColorModeValue('white', 'navy.800');

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
        </Card>
      </Box>
    );
  }

  if (!project.documents?.some(d => d.processingStatus?.toLowerCase() === 'completed')) {
    return (
      <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
        <Card>
          <Flex align="center" gap="15px" mb="20px">
            <IconButton
              aria-label="Back"
              icon={<Icon as={MdArrowBack} />}
              onClick={() => router.push(`/my-projects/${projectId}`)}
              variant="ghost"
            />
            {project.emoji && <Text fontSize="2xl">{project.emoji}</Text>}
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              {project.name} - Chat
            </Text>
          </Flex>

          <Box py="60px" textAlign="center">
            <Text fontSize="lg" color="gray.500" mb="10px">
              No processed documents yet
            </Text>
            <Text fontSize="sm" color="gray.400" mb="20px">
              Upload documents or wait for processing to complete
            </Text>
            <Flex justify="center" gap="10px">
              <IconButton
                aria-label="Back to project"
                icon={<Icon as={MdArrowBack} />}
                onClick={() => router.push(`/my-projects/${projectId}`)}
                variant="outline"
              />
            </Flex>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }} h="calc(100vh - 100px)">
      {}
      <Card mb="20px">
        <Flex align="center" gap="15px">
          <IconButton
            aria-label="Back"
            icon={<Icon as={MdArrowBack} />}
            onClick={() => router.push(`/my-projects/${projectId}`)}
            variant="ghost"
          />
          {project.emoji && <Text fontSize="2xl">{project.emoji}</Text>}
          <Box>
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              {project.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {project.documentCount} {project.documentCount === 1 ? 'document' : 'documents'}
            </Text>
          </Box>
        </Flex>
      </Card>

      {}
      <Card
        h="calc(100vh - 200px)"
        minH="500px"
        p="0"
        overflow="hidden"
        bg={cardBg}
      >
        <ProjectChat
          projectId={projectId}
          projectName={project.name}
        />
      </Card>
    </Box>
  );
}

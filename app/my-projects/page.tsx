'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from '@/components/card/Card';
import ProjectCard from '@/components/card/ProjectCard';
import { SearchBar } from '@/components/search';
import {
  Box,
  Button,
  Flex,
  Icon,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { MdApps, MdDashboard, MdAdd } from 'react-icons/md';

interface Project {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  documentCount?: number;
  totalSize?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    emoji: '📁',
  });

  const toast = useToast();
  const textColor = useColorModeValue('navy.700', 'white');
  const buttonBg = useColorModeValue('transparent', 'navy.800');
  const hoverButton = useColorModeValue(
    { bg: 'gray.100' },
    { bg: 'whiteAlpha.100' },
  );
  const activeButton = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.200' },
  );

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects/list');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      } else {
        toast({
          title: 'Error loading projects',
          description: data.error || 'Failed to load projects',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: 'Project name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Project created',
          description: 'Your project has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setNewProject({ name: '', description: '', emoji: '📁' });
        onClose();
        loadProjects();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Project deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        loadProjects();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <Card w="100%" mb="20px">
        <Flex align="center" direction={{ base: 'column', md: 'row' }}>
          <Text fontSize="lg" fontWeight={'700'}>
            All Projects ({projects.length})
          </Text>
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            mt={{ base: '20px', md: '0px' }}
            w={{ base: '100%', md: '210px' }}
            h="54px"
            leftIcon={<Icon as={MdAdd} />}
            onClick={onOpen}
          >
            New Project
          </Button>
        </Flex>
      </Card>

      <Flex w="100%" mb="20px" direction={{ base: 'column', md: 'row' }}>
        <SearchBar 
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
        />
        <Select
          fontSize="sm"
          variant="main"
          h="44px"
          maxH="44px"
          mt={{ base: '20px', md: '0px' }}
          me={{ base: '10px', md: '20px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A-Z)</option>
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" />
        </Flex>
      ) : filteredProjects.length === 0 ? (
        <Card py="40px">
          <Text textAlign="center" color="gray.500">
            {searchQuery ? 'No projects found matching your search' : 'No projects yet. Create your first project!'}
          </Text>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="20px">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              projectId={project.id}
              title={project.name}
              description={project.description}
              emoji={project.emoji}
              documentCount={project.documentCount || 0}
              time={new Date(project.createdAt).toLocaleString()}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Emoji</FormLabel>
              <Input
                placeholder="📁"
                value={newProject.emoji}
                onChange={(e) =>
                  setNewProject({ ...newProject, emoji: e.target.value })
                }
                maxLength={2}
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                placeholder="My Project"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your project..."
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                rows={4}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="primary"
              mr={3}
              onClick={handleCreateProject}
              isLoading={creating}
            >
              Create Project
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

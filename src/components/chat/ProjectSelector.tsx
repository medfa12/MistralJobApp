'use client';

import { useState, useEffect, useId } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { MdFolder, MdFolderOpen, MdClose, MdArrowDropDown } from 'react-icons/md';

interface Project {
  id: string;
  name: string;
  emoji?: string;
  documentCount?: number;
  mistralLibraryId: string;
}

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}

export function ProjectSelector({ selectedProject, onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Generate stable ID for SSR/client hydration
  const menuId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects/list');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by only rendering Menu on client
  if (!isMounted) {
    return (
      <Flex align="center" gap="10px">
        <Button
          rightIcon={<Icon as={MdArrowDropDown} />}
          leftIcon={<Icon as={MdFolder} />}
          variant="outline"
          size="sm"
          isDisabled
        >
          Select Project
        </Button>
      </Flex>
    );
  }

  return (
    <Flex align="center" gap="10px">
      {selectedProject ? (
        <Flex
          align="center"
          gap="10px"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="10px"
          px="12px"
          py="6px"
        >
          {selectedProject.emoji && (
            <Text fontSize="lg">{selectedProject.emoji}</Text>
          )}
          <Flex direction="column">
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              {selectedProject.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {selectedProject.documentCount || 0} documents
            </Text>
          </Flex>
          <Icon
            as={MdClose}
            cursor="pointer"
            color="gray.500"
            _hover={{ color: 'red.500' }}
            onClick={() => onProjectSelect(null)}
            ml="5px"
          />
        </Flex>
      ) : (
        <Menu id={menuId}>
          <MenuButton
            as={Button}
            rightIcon={<Icon as={MdArrowDropDown} />}
            leftIcon={<Icon as={MdFolder} />}
            variant="outline"
            size="sm"
            isLoading={loading}
          >
            Select Project
          </MenuButton>
          <MenuList maxH="400px" overflowY="auto">
            {projects.length === 0 ? (
              <MenuItem isDisabled>
                <Text fontSize="sm" color="gray.500">
                  No projects available
                </Text>
              </MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  _hover={{ bg: hoverBg }}
                >
                  <Flex align="center" gap="10px" w="100%">
                    {project.emoji && (
                      <Text fontSize="lg">{project.emoji}</Text>
                    )}
                    <Flex direction="column" flex="1">
                      <Text fontSize="sm" fontWeight="600">
                        {project.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {project.documentCount || 0} documents
                      </Text>
                    </Flex>
                    <Icon as={MdFolderOpen} color="blue.500" />
                  </Flex>
                </MenuItem>
              ))
            )}
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
}


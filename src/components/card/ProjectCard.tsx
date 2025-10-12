'use client';
import { useState } from 'react';
import {
  Flex,
  useColorModeValue,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { IoMdTime, IoMdDocument } from 'react-icons/io';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { MdDelete, MdFolder } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProjectCard(props: {
  projectId: string;
  title: string;
  description?: string;
  emoji?: string;
  documentCount?: number;
  time: string;
  onDelete: () => void;
}) {
  const { projectId, title, description, emoji, documentCount, time, onDelete } = props;
  const router = useRouter();
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');
  const cardBg = useColorModeValue('white', 'navy.800');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    router.push(`/my-projects/${projectId}`);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await Promise.resolve(onDelete());
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card 
      py="32px" 
      px="32px" 
      bg={cardBg}
      _hover={{ bg: hoverBg, cursor: 'pointer', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      onClick={handleCardClick}
    >
      <Flex
        my="auto"
        h="100%"
        direction={'column'}
        align={{ base: 'center', xl: 'start' }}
        justify={{ base: 'center', xl: 'center' }}
      >
        <Flex align="center" justify={'space-between'} w="100%" mb="20px">
          <Flex align="center" gap="10px">
            {emoji && <Text fontSize="2xl">{emoji}</Text>}
            <Flex direction="column">
              <Text fontSize="lg" color={textColor} fontWeight="700" noOfLines={1}>
                {title}
              </Text>
              {description && (
                <Text fontSize="xs" color={gray} noOfLines={2} mt="5px">
                  {description}
                </Text>
              )}
            </Flex>
          </Flex>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Icon as={IoEllipsisHorizontal} />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList onClick={(e) => e.stopPropagation()}>
              <MenuItem icon={<Icon as={MdFolder} />} onClick={handleCardClick}>
                Open Project
              </MenuItem>
              <MenuItem 
                icon={<Icon as={MdDelete} />} 
                color="red.500"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Flex w="100%" align="center" justify="space-between" mt="auto">
          <Flex align="center">
            <Icon w="18px" h="18px" me="10px" as={IoMdTime} color={gray} />
            <Text fontSize="sm" color={gray} fontWeight="500">
              {time}
            </Text>
          </Flex>
          <Badge colorScheme="blue" display="flex" alignItems="center" gap="5px">
            <Icon as={IoMdDocument} />
            {documentCount || 0} docs
          </Badge>
        </Flex>
      </Flex>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete project"
        description={`This will permanently delete "${title}" and all its documents.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        colorScheme="red"
      />
    </Card>
  );
}

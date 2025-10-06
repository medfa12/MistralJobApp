'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { MdPeople, MdPaid, MdChat, MdApi } from 'react-icons/md';
import Card from '@/components/card/Card';
import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalConversations: number;
  totalApiCalls: number;
  usageLastMonth: {
    totalTokens: number;
    requestCount: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
  }>;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const toast = useToast();
  const router = useRouter();

  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        if (statsRes.status === 403 || usersRes.status === 403) {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch admin data');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData.users);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load admin data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (!stats) {
    return (
      <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
        <Card p="20px">
          <Text>Failed to load admin data</Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <Text fontSize="2xl" fontWeight="bold" color={textColor} mb="20px">
        Admin Dashboard
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdPeople color={brandColor} size={24} />} />
          }
          name="Total Users"
          value={formatNumber(stats.totalUsers)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdPaid color={brandColor} size={24} />} />
          }
          name="Active Subscribers"
          value={formatNumber(stats.activeSubscribers)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdChat color={brandColor} size={24} />} />
          }
          name="Total Conversations"
          value={formatNumber(stats.totalConversations)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdApi color={brandColor} size={24} />} />
          }
          name="API Calls (30d)"
          value={formatNumber(stats.usageLastMonth.requestCount)}
        />
      </SimpleGrid>

      <Card mb="20px">
        <Flex justify="space-between" align="center" mb="20px">
          <Box>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Recent Users
            </Text>
            <Text fontSize="sm" color="gray.500">
              Latest user registrations
            </Text>
          </Box>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>User</Th>
                <Th borderColor={borderColor}>Email</Th>
                <Th borderColor={borderColor}>Role</Th>
                <Th borderColor={borderColor}>Conversations</Th>
                <Th borderColor={borderColor}>API Usage</Th>
                <Th borderColor={borderColor}>Joined</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.slice(0, 10).map((user) => (
                <Tr key={user.id}>
                  <Td borderColor={borderColor}>
                    <Text fontWeight="500">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'N/A'}
                    </Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge colorScheme={user.role === 'admin' ? 'purple' : 'gray'}>
                      {user.role}
                    </Badge>
                  </Td>
                  <Td borderColor={borderColor}>
                    {user._count?.conversations || 0}
                  </Td>
                  <Td borderColor={borderColor}>
                    {user._count?.usageLogs || 0}
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(user.createdAt)}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
        <Card p="20px">
          <Text fontSize="lg" fontWeight="bold" color={textColor} mb="15px">
            Usage Statistics (Last 30 Days)
          </Text>
          <Flex direction="column" gap="10px">
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Total API Calls</Text>
              <Text color="gray.500">
                {formatNumber(stats.usageLastMonth.requestCount)}
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Total Tokens</Text>
              <Text color="gray.500">
                {formatNumber(stats.usageLastMonth.totalTokens)}
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Avg Tokens per Call</Text>
              <Text color="gray.500">
                {formatNumber(
                  Math.round(
                    stats.usageLastMonth.totalTokens / stats.usageLastMonth.requestCount || 0
                  )
                )}
              </Text>
            </Flex>
          </Flex>
        </Card>

        <Card p="20px">
          <Text fontSize="lg" fontWeight="bold" color={textColor} mb="15px">
            System Overview
          </Text>
          <Flex direction="column" gap="10px">
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Subscription Rate</Text>
              <Text color="gray.500">
                {((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)}%
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Avg Conversations per User</Text>
              <Text color="gray.500">
                {(stats.totalConversations / stats.totalUsers || 0).toFixed(1)}
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Avg API Calls per User</Text>
              <Text color="gray.500">
                {(stats.totalApiCalls / stats.totalUsers || 0).toFixed(1)}
              </Text>
            </Flex>
          </Flex>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

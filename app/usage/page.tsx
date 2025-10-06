'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/card/Card';
import {
  Box,
  Flex,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import { MdBarChart, MdApi, MdMemory, MdInsights } from 'react-icons/md';
import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import LineChart from '@/components/charts/LineChart';

interface UsageStats {
  period: string;
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  byModel: Record<string, any>;
  dailyUsage: Record<string, any>;
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usage/stats?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load usage stats',
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

  const getChartData = () => {
    if (!stats) return [];

    const sortedDates = Object.keys(stats.dailyUsage).sort();
    return sortedDates.map((date) => stats.dailyUsage[date].totalTokens);
  };

  const getChartOptions = () => {
    if (!stats) return {};

    const sortedDates = Object.keys(stats.dailyUsage).sort();
    const labels = sortedDates.map((date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    return {
      chart: {
        toolbar: { show: false },
        dropShadow: {
          enabled: true,
          top: 13,
          left: 0,
          blur: 10,
          opacity: 0.1,
          color: '#FA500F',
        },
      },
      colors: ['#FA500F', '#FF8205'],
      markers: { size: 0 },
      tooltip: {
        theme: 'dark',
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        type: 'line',
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            colors: '#A3AED0',
            fontSize: '12px',
            fontWeight: '500',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            colors: '#A3AED0',
            fontSize: '14px',
          },
          formatter: (val: number) => formatNumber(val),
        },
      },
      legend: { show: false },
      grid: {
        show: false,
      },
    };
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
          <Text>No usage data available</Text>
        </Card>
      </Box>
    );
  }

  const mostUsedModel = Object.keys(stats.byModel).reduce(
    (a, b) => (stats.byModel[a].count > stats.byModel[b].count ? a : b),
    Object.keys(stats.byModel)[0] || 'N/A'
  );

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          API Usage Statistics
        </Text>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          w="200px"
          variant="main"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </Select>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdBarChart color={brandColor} size={24} />} />
          }
          name="Total Requests"
          value={formatNumber(stats.summary.totalRequests)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdApi color={brandColor} size={24} />} />
          }
          name="Total Tokens"
          value={formatNumber(stats.summary.totalTokens)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdMemory color={brandColor} size={24} />} />
          }
          name="Input Tokens"
          value={formatNumber(stats.summary.totalInputTokens)}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg} icon={<MdInsights color={brandColor} size={24} />} />
          }
          name="Most Used Model"
          value={mostUsedModel}
        />
      </SimpleGrid>

      <Card>
        <Box mb="20px">
          <Text fontSize="lg" fontWeight="bold" color={textColor} mb="5px">
            Token Usage Over Time
          </Text>
          <Text fontSize="sm" color="gray.500">
            Daily token consumption for the selected period
          </Text>
        </Box>
        <Box h="400px">
          <LineChart
            chartData={[{ name: 'Tokens', data: getChartData() }]}
            chartOptions={getChartOptions()}
          />
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
        <Card p="20px">
          <Text fontSize="lg" fontWeight="bold" color={textColor} mb="15px">
            Usage by Model
          </Text>
          {Object.keys(stats.byModel).map((model) => (
            <Flex key={model} justify="space-between" mb="10px" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">{model}</Text>
              <Text color="gray.500">
                {formatNumber(stats.byModel[model].totalTokens)} tokens
              </Text>
            </Flex>
          ))}
        </Card>

        <Card p="20px">
          <Text fontSize="lg" fontWeight="bold" color={textColor} mb="15px">
            Summary
          </Text>
          <Flex direction="column" gap="10px">
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Average Tokens per Request</Text>
              <Text color="gray.500">
                {formatNumber(
                  Math.round(stats.summary.totalTokens / stats.summary.totalRequests || 0)
                )}
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Input/Output Ratio</Text>
              <Text color="gray.500">
                {(
                  stats.summary.totalInputTokens / stats.summary.totalOutputTokens || 0
                ).toFixed(2)}
              </Text>
            </Flex>
            <Flex justify="space-between" p="10px" bg={boxBg} borderRadius="8px">
              <Text fontWeight="500">Period</Text>
              <Text color="gray.500">{period}</Text>
            </Flex>
          </Flex>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

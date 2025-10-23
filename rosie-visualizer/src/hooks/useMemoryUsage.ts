import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface MemoryUsageData {
  memory_usage_percent: {
    time: number;
    value: number;
  }[];
}

interface MemoryCapacityData {
  memory_capacity: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMemoryUsage(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<MemoryUsageData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/memory_usage?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined, // 0 disables auto-refresh
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data?.memory_usage_percent?.[0] || null,
    isLoading,
    error,
  };
}

export function useMemoryCapacity(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<MemoryCapacityData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/memory_capacity?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: Math.max(30000, pollRate || 30000), // Capacity changes less frequently, minimum 30s
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    data: data?.memory_capacity || null,
    isLoading,
    error,
  };
}

// Hook to get list of available nodes (same as CPU usage)
export function useNodes() {
  // Make poll rate optional for nodes (they don't change often)
  let pollRate = 30000; // Default for nodes
  try {
    const pollContext = usePollRate();
    pollRate = Math.max(30000, pollContext.pollRate || 30000);
  } catch {
    // If not within provider, use default
  }
  
  const { data, error, isLoading } = useSWR<{ nodes: Array<{ node_id: string; metrics: string[]; components: string[] }> }>(
    'https://dashboard.hpc.msoe.edu/api/nodes',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Node list changes less frequently
      refreshInterval: pollRate, // Nodes refresh slower, minimum 30s
    }
  );

  return {
    nodes: data?.nodes?.map(node => node.node_id) || [],
    isLoading,
    error,
  };
}
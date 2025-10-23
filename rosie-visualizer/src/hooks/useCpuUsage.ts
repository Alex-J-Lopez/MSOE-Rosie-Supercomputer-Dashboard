import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface CpuUsageData {
  cpu_usage_percent: {
    id: string;
    time: number;
    value: number;
    indivual: number[];
  }[];
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCpuUsage(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<CpuUsageData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/cpu_usage?node_id[]=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined, // 0 disables auto-refresh
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data?.cpu_usage_percent?.[0] || null,
    isLoading,
    error,
  };
}

// Hook to get list of available nodes
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
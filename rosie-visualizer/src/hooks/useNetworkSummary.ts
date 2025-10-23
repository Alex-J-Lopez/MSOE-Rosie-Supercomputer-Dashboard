import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface NetworkSummaryData {
  packets_in: Array<{
    time: number;
    value: number;
  }>;
  packets_out: Array<{
    time: number;
    value: number;
  }>;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNetworkSummary(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<NetworkSummaryData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/network_summary?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data || null,
    isLoading,
    error,
  };
}

// Hook to get list of available nodes (reuse pattern from other hooks)
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
import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface GpuUtilizationData {
  last_update_time: number;
  'utilization.gpu': number[];
}

interface GpuTemperatureData {
  last_update_time: number;
  'temperature.gpu': number[];
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGpuUtilization(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<GpuUtilizationData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/gpu_utilization?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined, // 0 disables auto-refresh
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

export function useGpuTemperature(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<GpuTemperatureData>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/gpu_temperature?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined, // 0 disables auto-refresh
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

// Hook to get list of available nodes with GPU support
export function useGpuNodes() {
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

  // Filter nodes that have GPU metrics and GPU components
  const gpuNodes = data?.nodes?.filter(node => 
    node.metrics.includes('gpu') && 
    node.components.some(component => component.startsWith('GPU'))
  ) || [];

  return {
    nodes: gpuNodes.map(node => node.node_id),
    isLoading,
    error,
  };
}
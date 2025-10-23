import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';
import React from 'react';

interface Node {
  node_id: string;
  metrics: string[];
  components: string[];
}

interface NodesData {
  nodes: Node[];
}

interface NodeOverviewData {
  cpu_usage: Array<{
    time: number;
    value: number;
  }>;
  memory_usage: Array<{
    time: number;
    value: number;
  }>;
  network_summary: {
    packets_in: Array<{
      time: number;
      value: number;
    }>;
    packets_out: Array<{
      time: number;
      value: number;
    }>;
  };
  gpu_temp: any[];
}

interface EnrichedNode extends Node {
  status: 'online' | 'offline' | 'unknown';
  cpuUsage?: number;
  memoryUsage?: number;
  hasGpu: boolean;
  lastUpdate?: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook to get all nodes
export function useNodes() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<NodesData>(
    'https://dashboard.hpc.msoe.edu/api/nodes',
    fetcher,
    {
      refreshInterval: Math.max(30000, pollRate || 30000), // Nodes don't change often
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    nodes: data?.nodes || [],
    isLoading,
    error,
  };
}

// Hook to get node overview data for a single node
export function useNodeOverview(nodeId: string) {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<NodeOverviewData[]>(
    nodeId ? `https://dashboard.hpc.msoe.edu/api/node_overview?node_id=${nodeId}` : null,
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
      // Don't throw on error - some nodes might not have data
      shouldRetryOnError: false,
      onError: () => {
        // Silently handle errors for individual nodes
      },
    }
  );

  return {
    data: data?.[0] || null,
    isLoading,
    error,
  };
}

// Combined hook to get enriched node information
export function useNodesOverview() {
  const { nodes, isLoading: nodesLoading, error: nodesError } = useNodes();
  const { pollRate } = usePollRate();

  // Fetch overview data for all nodes
  const overviewQueries = nodes.map(node => ({
    nodeId: node.node_id,
    hook: useSWR<NodeOverviewData[]>(
      node.node_id ? `https://dashboard.hpc.msoe.edu/api/node_overview?node_id=${node.node_id}` : null,
      fetcher,
      {
        refreshInterval: pollRate || undefined,
        revalidateOnFocus: false,
        dedupingInterval: Math.min(5000, pollRate || 5000),
        shouldRetryOnError: false,
      }
    )
  }));

  const enrichedNodes: EnrichedNode[] = React.useMemo(() => {
    return nodes.map((node, index) => {
      const overviewData = overviewQueries[index]?.hook.data?.[0];
      const hasError = overviewQueries[index]?.hook.error;
      
      const hasGpu = node.components.some(c => c.startsWith('GPU'));
      
      // Determine status based on data availability
      let status: 'online' | 'offline' | 'unknown' = 'unknown';
      if (overviewData) {
        status = 'online';
      } else if (hasError) {
        status = 'offline';
      }

      return {
        ...node,
        status,
        cpuUsage: overviewData?.cpu_usage?.[0]?.value,
        memoryUsage: overviewData?.memory_usage?.[0]?.value,
        hasGpu,
        lastUpdate: overviewData?.cpu_usage?.[0]?.time || overviewData?.memory_usage?.[0]?.time,
      };
    });
  }, [nodes, overviewQueries.map(q => q.hook.data).join(','), overviewQueries.map(q => q.hook.error).join(',')]);

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const totalNodes = enrichedNodes.length;
    const onlineNodes = enrichedNodes.filter(n => n.status === 'online').length;
    const offlineNodes = enrichedNodes.filter(n => n.status === 'offline').length;
    const gpuNodes = enrichedNodes.filter(n => n.hasGpu).length;
    
    const nodesWithCpu = enrichedNodes.filter(n => n.cpuUsage !== undefined);
    const avgCpuUsage = nodesWithCpu.length > 0
      ? nodesWithCpu.reduce((sum, n) => sum + (n.cpuUsage || 0), 0) / nodesWithCpu.length
      : 0;
    
    const nodesWithMemory = enrichedNodes.filter(n => n.memoryUsage !== undefined);
    const avgMemoryUsage = nodesWithMemory.length > 0
      ? nodesWithMemory.reduce((sum, n) => sum + (n.memoryUsage || 0), 0) / nodesWithMemory.length
      : 0;

    return {
      totalNodes,
      onlineNodes,
      offlineNodes,
      gpuNodes,
      avgCpuUsage,
      avgMemoryUsage,
    };
  }, [enrichedNodes]);

  const isLoading = nodesLoading || overviewQueries.some(q => q.hook.isLoading);
  const error = nodesError;

  return {
    nodes: enrichedNodes,
    stats,
    isLoading,
    error,
  };
}
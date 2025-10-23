import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface SlurmActiveNode {
  name: string;
  'count(nodelist)': number;
}

interface SlurmActiveNodesData {
  results: SlurmActiveNode[];
}

interface JobData {
  cpus_req: number;
  id_job: number;
  time_start: number;
  timelimit: number;
  nodelist: string;
}

interface JobDataResponse {
  results: JobData[];
}

interface SlurmNodeUser {
  jobid: string;
  partition: string;
  user: string;
  st: string;
  time: string;
  nodes: string;
  'nodelist(reason)': string;
  account: string;
  name: string;
}

interface SlurmNodeUsersData {
  results: SlurmNodeUser[];
}

interface JobDistribution {
  nodeName: string;
  jobCount: number;
  cpuCount: number;
  jobs: Array<{
    jobId: string;
    user: string;
    name: string;
    partition: string;
    cpusReq: number;
  }>;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook to get Slurm active nodes (nodes with running jobs)
export function useSlurmActiveNodes() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<SlurmActiveNodesData>(
    'https://dashboard.hpc.msoe.edu/api/slurm_active_nodes',
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data?.results || [],
    isLoading,
    error,
  };
}

// Hook to get all job data
export function useJobData() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<JobDataResponse>(
    'https://dashboard.hpc.msoe.edu/api/job_data',
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data?.results || [],
    isLoading,
    error,
  };
}

// Hook to get Slurm node users (detailed job information)
export function useSlurmNodeUsers() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<SlurmNodeUsersData>(
    'https://dashboard.hpc.msoe.edu/api/slurm_node_users',
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    data: data?.results || [],
    isLoading,
    error,
  };
}

// Combined hook to get job distribution across nodes
export function useJobDistribution() {
  const { data: activeNodes, isLoading: nodesLoading, error: nodesError } = useSlurmActiveNodes();
  const { data: jobData, isLoading: jobsLoading, error: jobsError } = useJobData();
  const { data: nodeUsers, isLoading: usersLoading, error: usersError } = useSlurmNodeUsers();

  const isLoading = nodesLoading || jobsLoading || usersLoading;
  const error = nodesError || jobsError || usersError;

  // Aggregate job distribution
  const distribution: JobDistribution[] = React.useMemo(() => {
    if (!activeNodes.length || !nodeUsers.length) return [];

    // Create a map of node names to their job information
    const nodeMap = new Map<string, JobDistribution>();

    // Initialize with active nodes from slurm_active_nodes
    activeNodes.forEach(node => {
      nodeMap.set(node.name, {
        nodeName: node.name,
        jobCount: node['count(nodelist)'],
        cpuCount: 0,
        jobs: []
      });
    });

    // Enrich with detailed job information from slurm_node_users
    nodeUsers.forEach(job => {
      const nodeName = job['nodelist(reason)'];
      if (nodeMap.has(nodeName)) {
        const nodeInfo = nodeMap.get(nodeName)!;
        
        // Find CPU requirements from job_data
        const jobDataItem = jobData.find(j => j.id_job.toString() === job.jobid);
        const cpusReq = jobDataItem?.cpus_req || 0;
        
        nodeInfo.cpuCount += cpusReq;
        nodeInfo.jobs.push({
          jobId: job.jobid,
          user: job.user,
          name: job.name,
          partition: job.partition,
          cpusReq: cpusReq
        });
      }
    });

    // Convert map to sorted array (by job count descending)
    return Array.from(nodeMap.values()).sort((a, b) => b.jobCount - a.jobCount);
  }, [activeNodes, jobData, nodeUsers]);

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const totalJobs = distribution.reduce((sum, node) => sum + node.jobCount, 0);
    const totalNodes = distribution.length;
    const avgJobsPerNode = totalNodes > 0 ? totalJobs / totalNodes : 0;
    const maxJobsOnNode = distribution.length > 0 ? distribution[0].jobCount : 0;
    const totalCPUs = distribution.reduce((sum, node) => sum + node.cpuCount, 0);

    return {
      totalJobs,
      totalNodes,
      avgJobsPerNode,
      maxJobsOnNode,
      totalCPUs
    };
  }, [distribution]);

  return {
    distribution,
    stats,
    isLoading,
    error,
  };
}

// Need to import React for useMemo
import React from 'react';
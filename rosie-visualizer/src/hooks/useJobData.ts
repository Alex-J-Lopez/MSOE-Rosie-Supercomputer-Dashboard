import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

interface JobData {
  cpus_req: number;
  id_job: number;
  time_start: number;
  timelimit: number;
  nodelist: string;
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

interface SlurmActiveNode {
  name: string;
  'count(nodelist)': number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export function useJobData() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR(
    'https://dashboard.hpc.msoe.edu/api/job_data',
    fetcher,
    {
      refreshInterval: pollRate,
      revalidateOnFocus: false,
    }
  );

  return {
    jobs: (data?.results || []) as JobData[],
    isLoading,
    error,
  };
}

export function useSlurmNodeUsers() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR(
    'https://dashboard.hpc.msoe.edu/api/slurm_node_users',
    fetcher,
    {
      refreshInterval: pollRate,
      revalidateOnFocus: false,
    }
  );

  return {
    nodeUsers: (data?.results || []) as SlurmNodeUser[],
    isLoading,
    error,
  };
}

export function useSlurmActiveNodes() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR(
    'https://dashboard.hpc.msoe.edu/api/slurm_active_nodes',
    fetcher,
    {
      refreshInterval: pollRate,
      revalidateOnFocus: false,
    }
  );

  return {
    activeNodes: (data?.results || []) as SlurmActiveNode[],
    isLoading,
    error,
  };
}
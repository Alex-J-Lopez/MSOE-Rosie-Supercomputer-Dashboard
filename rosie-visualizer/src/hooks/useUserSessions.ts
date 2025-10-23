import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';
import React from 'react';

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

interface UserSession {
  username: string;
  jobCount: number;
  totalCPUs: number;
  nodes: string[];
  jobs: Array<{
    jobId: string;
    name: string;
    partition: string;
    state: string;
    time: string;
    nodes: string;
    cpusReq: number;
    account: string;
  }>;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

// Combined hook to get user sessions and their resource allocation
export function useUserSessions() {
  const { data: nodeUsers, isLoading: usersLoading, error: usersError } = useSlurmNodeUsers();
  const { data: jobData, isLoading: jobsLoading, error: jobsError } = useJobData();

  const isLoading = usersLoading || jobsLoading;
  const error = usersError || jobsError;

  // Aggregate user sessions
  const sessions: UserSession[] = React.useMemo(() => {
    if (!nodeUsers.length) return [];

    // Create a map of usernames to their session information
    const userMap = new Map<string, UserSession>();

    nodeUsers.forEach(job => {
      const username = job.user;
      
      if (!userMap.has(username)) {
        userMap.set(username, {
          username,
          jobCount: 0,
          totalCPUs: 0,
          nodes: [],
          jobs: []
        });
      }

      const session = userMap.get(username)!;
      
      // Find CPU requirements from job_data
      const jobDataItem = jobData.find(j => j.id_job.toString() === job.jobid);
      const cpusReq = jobDataItem?.cpus_req || 0;
      
      session.jobCount++;
      session.totalCPUs += cpusReq;
      
      // Add node if not already in the list
      const nodeName = job['nodelist(reason)'];
      if (!session.nodes.includes(nodeName)) {
        session.nodes.push(nodeName);
      }
      
      session.jobs.push({
        jobId: job.jobid,
        name: job.name,
        partition: job.partition,
        state: job.st,
        time: job.time,
        nodes: nodeName,
        cpusReq: cpusReq,
        account: job.account
      });
    });

    // Convert map to sorted array (by job count descending)
    return Array.from(userMap.values()).sort((a, b) => b.jobCount - a.jobCount);
  }, [nodeUsers, jobData]);

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const totalUsers = sessions.length;
    const totalJobs = sessions.reduce((sum, user) => sum + user.jobCount, 0);
    const totalCPUs = sessions.reduce((sum, user) => sum + user.totalCPUs, 0);
    const avgJobsPerUser = totalUsers > 0 ? totalJobs / totalUsers : 0;
    const avgCPUsPerUser = totalUsers > 0 ? totalCPUs / totalUsers : 0;
    const maxJobsUser = sessions.length > 0 ? sessions[0].username : '';

    // Get unique nodes being used
    const allNodes = new Set<string>();
    sessions.forEach(session => {
      session.nodes.forEach(node => allNodes.add(node));
    });

    return {
      totalUsers,
      totalJobs,
      totalCPUs,
      avgJobsPerUser,
      avgCPUsPerUser,
      maxJobsUser,
      nodesInUse: allNodes.size
    };
  }, [sessions]);

  return {
    sessions,
    stats,
    isLoading,
    error,
  };
}

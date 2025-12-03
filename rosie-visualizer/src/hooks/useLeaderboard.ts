import useSWR from 'swr';
import { usePollRate } from '../contexts/PollRateContext';

export interface LeaderboardUser {
  username: string;
  id_user: number;
  total_jobs: number;
  total_time_used: string;
}

interface LeaderboardResponse {
  users: LeaderboardUser[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export function useLeaderboard() {
  const { pollRate } = usePollRate();
  
  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    'https://dashboard.hpc.msoe.edu/api/leaderboard',
    fetcher,
    {
      refreshInterval: pollRate || undefined,
      revalidateOnFocus: false,
      dedupingInterval: Math.min(2000, pollRate || 2000),
    }
  );

  return {
    users: data?.users || [],
    isLoading,
    error,
  };
}

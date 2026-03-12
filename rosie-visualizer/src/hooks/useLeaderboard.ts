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

export type LeaderboardPeriod = 'all' | '30d' | '6m' | '1y' | '2y';

export function useLeaderboard(period: LeaderboardPeriod = 'all') {
  const { pollRate } = usePollRate();

  const url = `https://dashboard.hpc.msoe.edu/api/leaderboard?period=${period}`;

  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    url,
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

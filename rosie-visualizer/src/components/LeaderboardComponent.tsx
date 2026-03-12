'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, RefreshCw, AlertCircle, Medal, Clock, Briefcase, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useLeaderboard, LeaderboardPeriod } from '../hooks/useLeaderboard';

interface LeaderboardComponentProps {
  className?: string;
}

type SortField = 'total_jobs' | 'total_time_used' | 'username';
type SortDirection = 'asc' | 'desc';

const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({ className = '' }) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { users, isLoading, error } = useLeaderboard(period);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('total_jobs');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Format time from seconds to human-readable format
  const formatTime = (seconds: string): string => {
    const totalSeconds = parseInt(seconds, 10);
    if (isNaN(totalSeconds)) return '0s';

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    // First, deduplicate users by id_user to prevent duplicate keys
    const uniqueUsersMap = new Map<number, typeof users[0]>();
    users.forEach(user => {
      if (!uniqueUsersMap.has(user.id_user)) {
        uniqueUsersMap.set(user.id_user, user);
      }
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    let filtered = uniqueUsers;

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = uniqueUsers.filter(user =>
        (user.username || '').toLowerCase().includes(lowerSearch) ||
        user.id_user.toString().includes(lowerSearch)
      );
    }

    // Sort users
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'total_jobs':
          aValue = a.total_jobs;
          bValue = b.total_jobs;
          break;
        case 'total_time_used':
          aValue = parseInt(a.total_time_used, 10);
          bValue = parseInt(b.total_time_used, 10);
          break;
        case 'username':
          aValue = a.username || '';
          bValue = b.username || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline-block ml-1" />
    );
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading data: {error.message}</div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!users.length) return null;

    const totalUsers = users.length;
    const totalJobs = users.reduce((sum, user) => sum + user.total_jobs, 0);
    const totalTime = users.reduce((sum, user) => {
      const time = parseInt(user.total_time_used, 10);
      return sum + (isNaN(time) ? 0 : time);
    }, 0);

    return {
      totalUsers,
      totalJobs,
      totalTime,
      avgJobsPerUser: totalUsers > 0 ? (totalJobs / totalUsers).toFixed(1) : '0',
    };
  }, [users]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Search bar and period picker */}
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
            className="py-1 px-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Select time period"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
            <option value="2y">Last 2 Years</option>
          </select>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Search users"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalJobs.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-600">{formatTime(stats.totalTime.toString())}</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.avgJobsPerUser}</div>
            <div className="text-sm text-gray-600">Avg Jobs/User</div>
          </div>
        </div>
      )}

      {/* Content */}
      {!filteredAndSortedUsers.length || isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading leaderboard...' : 'No users found'}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('username')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Username
                    <SortIcon field="username" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_jobs')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Total Jobs
                    <SortIcon field="total_jobs" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_time_used')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Total Time Used
                    <SortIcon field="total_time_used" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user, index) => (
                <tr
                  key={user.id_user}
                  className={`hover:bg-gray-50 ${
                    index < 3 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username || `User ${user.id_user}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.total_jobs.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTime(user.total_time_used)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.id_user}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer stats */}
      {filteredAndSortedUsers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Showing {filteredAndSortedUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
};

export default LeaderboardComponent;

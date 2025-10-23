'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Users, RefreshCw, AlertCircle, User, Cpu, Server, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserSessions } from '../hooks/useUserSessions';

interface UserSessionsComponentProps {
  className?: string;
}

const UserSessionsComponent: React.FC<UserSessionsComponentProps> = ({ className = '' }) => {
  const { sessions, stats, isLoading, error } = useUserSessions();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sessions based on search term
  const filteredSessions = React.useMemo(() => {
    if (!searchTerm) return sessions;
    
    const lowerSearch = searchTerm.toLowerCase();
    return sessions.filter(session => 
      session.username.toLowerCase().includes(lowerSearch) ||
      session.jobs.some(job => 
        job.name.toLowerCase().includes(lowerSearch) ||
        job.account.toLowerCase().includes(lowerSearch)
      )
    );
  }, [sessions, searchTerm]);

  // Colors for the pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Prepare data for charts
  const topUsersData = React.useMemo(() => {
    return filteredSessions.slice(0, 5).map(session => ({
      name: session.username,
      jobs: session.jobCount,
      cpus: session.totalCPUs,
    }));
  }, [filteredSessions]);

  const userDistributionData = React.useMemo(() => {
    return filteredSessions.slice(0, 8).map(session => ({
      name: session.username,
      value: session.jobCount,
    }));
  }, [filteredSessions]);

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Sessions</h3>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading data: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Sessions</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Search users"
        />
      </div>

      {/* Content */}
      {!sessions.length || isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading user sessions...' : 'No active sessions'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-teal-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalCPUs}</div>
              <div className="text-sm text-gray-600">Total CPUs</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Server className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.nodesInUse}</div>
              <div className="text-sm text-gray-600">Nodes in Use</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Users Bar Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Users by Job Count</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topUsersData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" fill="#14b8a6" name="Jobs" />
                    <Bar dataKey="cpus" fill="#8b5cf6" name="CPUs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Distribution Pie Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Job Distribution by User</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Sessions Table */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Active User Sessions ({filteredSessions.length})
            </h4>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jobs
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPUs
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nodes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <React.Fragment key={session.username}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {session.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {session.jobCount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {session.totalCPUs}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {session.nodes.join(', ')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setExpandedUser(
                              expandedUser === session.username ? null : session.username
                            )}
                            className="text-teal-600 hover:text-teal-800 flex items-center"
                          >
                            {expandedUser === session.username ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide Jobs
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                View Jobs
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedUser === session.username && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 bg-gray-50">
                            <div className="space-y-2">
                              <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                Job Details
                              </h5>
                              <div className="max-h-48 overflow-y-auto">
                                <table className="min-w-full text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left text-gray-600">Job ID</th>
                                      <th className="px-2 py-1 text-left text-gray-600">Name</th>
                                      <th className="px-2 py-1 text-left text-gray-600">Partition</th>
                                      <th className="px-2 py-1 text-left text-gray-600">State</th>
                                      <th className="px-2 py-1 text-left text-gray-600">Time</th>
                                      <th className="px-2 py-1 text-left text-gray-600">CPUs</th>
                                      <th className="px-2 py-1 text-left text-gray-600">Node</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white">
                                    {session.jobs.map((job) => (
                                      <tr key={job.jobId} className="border-t border-gray-200">
                                        <td className="px-2 py-1 text-gray-900">{job.jobId}</td>
                                        <td className="px-2 py-1 text-gray-900">{job.name}</td>
                                        <td className="px-2 py-1 text-gray-600">{job.partition}</td>
                                        <td className="px-2 py-1">
                                          <span className={`px-2 py-0.5 rounded text-xs ${
                                            job.state === 'R' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {job.state}
                                          </span>
                                        </td>
                                        <td className="px-2 py-1 text-gray-600">{job.time}</td>
                                        <td className="px-2 py-1 text-gray-600">{job.cpusReq}</td>
                                        <td className="px-2 py-1 text-gray-600">{job.nodes}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Jobs per User</div>
              <div className="text-lg font-semibold text-gray-900">{stats.avgJobsPerUser.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg CPUs per User</div>
              <div className="text-lg font-semibold text-gray-900">{stats.avgCPUsPerUser.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Top User</div>
              <div className="text-lg font-semibold text-gray-900">{stats.maxJobsUser || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSessionsComponent;
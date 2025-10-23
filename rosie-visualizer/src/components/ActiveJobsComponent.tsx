'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  Users, 
  Server, 
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Cpu,
  Timer
} from 'lucide-react';
import { useJobData, useSlurmNodeUsers, useSlurmActiveNodes } from '../hooks/useJobData';

interface ActiveJobsComponentProps {
  className?: string;
}

const ActiveJobsComponent: React.FC<ActiveJobsComponentProps> = ({ className = '' }) => {
  const { jobs, isLoading: jobsLoading, error: jobsError } = useJobData();
  const { nodeUsers, isLoading: usersLoading, error: usersError } = useSlurmNodeUsers();
  const { activeNodes, isLoading: nodesLoading, error: nodesError } = useSlurmActiveNodes();
  
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'time' | 'cpus' | 'duration'>('time');
  const [filterByStatus, setFilterByStatus] = useState<string>('all');

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  // Merge job data with user info
  const enrichedJobs = jobs.map(job => {
    const userInfo = nodeUsers.find(user => user.jobid === job.id_job.toString());
    return {
      ...job,
      user: userInfo?.user || 'Unknown',
      jobName: userInfo?.name || 'Unnamed Job',
      status: userInfo?.st || 'Unknown',
      partition: userInfo?.partition || 'Unknown',
      account: userInfo?.account || 'Unknown',
      runningTime: userInfo?.time || '0:00:00',
    };
  });

  // Apply filters and sorting
  const filteredJobs = enrichedJobs
    .filter(job => filterByStatus === 'all' || job.status === filterByStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.time_start - a.time_start;
        case 'cpus':
          return b.cpus_req - a.cpus_req;
        case 'duration':
          return b.timelimit - a.timelimit;
        default:
          return 0;
      }
    });

  const statusCounts = {
    total: enrichedJobs.length,
    running: enrichedJobs.filter(job => job.status === 'R').length,
    pending: enrichedJobs.filter(job => job.status === 'PD').length,
    completing: enrichedJobs.filter(job => job.status === 'CG').length,
  };

  const totalCpusInUse = enrichedJobs
    .filter(job => job.status === 'R')
    .reduce((sum, job) => sum + job.cpus_req, 0);

  if (jobsLoading || usersLoading || nodesLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (jobsError || usersError || nodesError) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Failed to load job data</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
          </div>
          
          {/* Status Summary */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-black">{statusCounts.running} Running</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-black">{statusCounts.pending} Pending</span>
            </div>
            <div className="flex items-center">
              <Cpu className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-black">{totalCpusInUse} CPUs</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-select" className="text-sm text-black">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 text-sm border border-gray-300 rounded text-black bg-white"
              title="Sort jobs by criteria"
            >
              <option value="time">Start Time</option>
              <option value="cpus">CPU Count</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="filter-select" className="text-sm text-black">Filter:</label>
            <select
              id="filter-select"
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded text-black bg-white"
              title="Filter jobs by status"
            >
              <option value="all">All Status</option>
              <option value="R">Running</option>
              <option value="PD">Pending</option>
              <option value="CG">Completing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredJobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No active jobs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id_job.toString());
              const statusColor = job.status === 'R' ? 'green' : 
                                job.status === 'PD' ? 'yellow' : 
                                job.status === 'CG' ? 'blue' : 'gray';

              return (
                <div key={job.id_job} className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded"
                    onClick={() => toggleJobExpansion(job.id_job.toString())}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 mr-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 bg-${statusColor}-500 rounded-full mr-2 flex-shrink-0`}></div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job.jobName || `Job ${job.id_job}`}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {job.user} • {job.partition} • {job.cpus_req} CPUs
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        {job.runningTime}
                      </div>
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-1" />
                        {job.nodelist}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-black">Job ID:</span>
                          <span className="text-black ml-2 font-mono">{job.id_job}</span>
                        </div>
                        <div>
                          <span className="text-black">Account:</span>
                          <span className="text-black ml-2">{job.account}</span>
                        </div>
                        <div>
                          <span className="text-black">Started:</span>
                          <span className="text-black ml-2">{formatTimeAgo(job.time_start)}</span>
                        </div>
                        <div>
                          <span className="text-black">Time Limit:</span>
                          <span className="text-black ml-2">{formatDuration(job.timelimit * 60)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-black">Node:</span>
                          <span className="text-black ml-2 font-mono">{job.nodelist}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-black">
        <div className="flex items-center justify-between">
          <span>
            Showing {filteredJobs.length} of {statusCounts.total} jobs
          </span>
          <span>
            {activeNodes.length} active nodes
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActiveJobsComponent;
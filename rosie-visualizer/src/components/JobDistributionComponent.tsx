'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Server, Activity, RefreshCw, AlertCircle, TrendingUp, Users, Cpu } from 'lucide-react';
import { useJobDistribution } from '../hooks/useJobDistribution';

interface JobDistributionComponentProps {
  className?: string;
}

const JobDistributionComponent: React.FC<JobDistributionComponentProps> = ({ className = '' }) => {
  const { distribution, stats, isLoading, error } = useJobDistribution();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Color for bars based on job count
  const getBarColor = (jobCount: number, maxJobs: number) => {
    const ratio = jobCount / maxJobs;
    if (ratio < 0.3) return '#10b981'; // Green - low load
    if (ratio < 0.7) return '#f59e0b'; // Yellow - medium load
    return '#ef4444'; // Red - high load
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    return distribution.map(node => ({
      name: node.nodeName,
      jobs: node.jobCount,
      cpus: node.cpuCount,
    }));
  }, [distribution]);

  // Selected node details
  const selectedNodeData = React.useMemo(() => {
    if (!selectedNode) return null;
    return distribution.find(node => node.nodeName === selectedNode);
  }, [selectedNode, distribution]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Server className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Distribution</h3>
          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading job distribution...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Server className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Distribution</h3>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading data: {error.message}</div>
        </div>
      </div>
    );
  }

  if (distribution.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Server className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Distribution</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-center">
            <div className="text-sm">No active jobs found</div>
            <div className="text-xs mt-1">All nodes are currently idle</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Distribution</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="h-4 w-4 text-blue-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
          <div className="text-xs text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Server className="h-4 w-4 text-green-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.totalNodes}</div>
          <div className="text-xs text-gray-600">Active Nodes</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-yellow-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.avgJobsPerNode.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Avg Jobs/Node</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="h-4 w-4 text-red-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.maxJobsOnNode}</div>
          <div className="text-xs text-gray-600">Max Jobs</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Cpu className="h-4 w-4 text-purple-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalCPUs}</div>
          <div className="text-xs text-gray-600">Total CPUs</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Jobs per Node</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              onClick={(data) => {
                if (data && data.activeLabel) {
                  setSelectedNode(data.activeLabel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                        <div className="font-medium text-gray-900 mb-2">{data.name}</div>
                        <div className="text-sm text-gray-600">Jobs: <span className="font-semibold">{data.jobs}</span></div>
                        <div className="text-sm text-gray-600">CPUs: <span className="font-semibold">{data.cpus}</span></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="jobs" name="Jobs" cursor="pointer">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.jobs, stats.maxJobsOnNode)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          Click on a bar to view job details for that node
        </div>
      </div>

      {/* Detailed Table */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Node Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPU Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distribution.map((node) => {
                return (
                  <React.Fragment key={node.nodeName}>
                    <tr className={`hover:bg-gray-50 ${selectedNode === node.nodeName ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {node.nodeName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {node.jobCount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {node.cpuCount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedNode(selectedNode === node.nodeName ? null : node.nodeName)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {selectedNode === node.nodeName ? 'Hide' : 'View'} Jobs
                        </button>
                      </td>
                    </tr>
                    {selectedNode === node.nodeName && selectedNodeData && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-gray-50">
                          <div className="space-y-2">
                            <div className="font-medium text-sm text-gray-700 mb-2">
                              Jobs running on {node.nodeName}:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedNodeData.jobs.map((job) => (
                                <div key={job.jobId} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {job.name}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Job ID: {job.jobId}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        User: {job.user}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2 text-right">
                                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {job.partition}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {job.cpusReq} CPUs
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDistributionComponent;
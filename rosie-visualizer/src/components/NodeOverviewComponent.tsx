'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle, XCircle, Server, Zap, Clock, Filter } from 'lucide-react';
import { useNodesOverview } from '../hooks/useNodeOverview';

interface NodeOverviewComponentProps {
  className?: string;
}

const NodeOverviewComponent: React.FC<NodeOverviewComponentProps> = ({ className = '' }) => {
  const { nodes, stats, isLoading, error } = useNodesOverview();
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nodes based on status and search
  const filteredNodes = React.useMemo(() => {
    let filtered = nodes;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(node => node.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(node =>
        node.node_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [nodes, filterStatus, searchQuery]);

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 30) return 'text-green-600';
    if (usage < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBgColor = (usage: number) => {
    if (usage < 30) return 'bg-green-500';
    if (usage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Database className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Node Overview</h3>
          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading node information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Database className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Node Overview</h3>
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
          <Database className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Node Overview</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Server className="h-4 w-4 text-blue-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalNodes}</div>
          <div className="text-xs text-gray-600">Total Nodes</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.onlineNodes}</div>
          <div className="text-xs text-gray-600">Online</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <XCircle className="h-4 w-4 text-red-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.offlineNodes}</div>
          <div className="text-xs text-gray-600">Offline</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="h-4 w-4 text-yellow-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.gpuNodes}</div>
          <div className="text-xs text-gray-600">GPU Nodes</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.avgCpuUsage.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Avg CPU</div>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.avgMemoryUsage.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Avg Memory</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({nodes.length})
          </button>
          <button
            onClick={() => setFilterStatus('online')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'online'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Online ({stats.onlineNodes})
          </button>
          <button
            onClick={() => setFilterStatus('offline')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'offline'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Offline ({stats.offlineNodes})
          </button>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => (
          <div
            key={node.node_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Node Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{node.node_id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(node.status)}`}>
                    {node.status}
                  </span>
                  {node.hasGpu && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      GPU
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusIcon(node.status)}
              </div>
            </div>

            {/* Metrics */}
            {node.status === 'online' && (
              <div className="space-y-2">
                {/* CPU Usage */}
                {node.cpuUsage !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">CPU</span>
                      <span className={`text-xs font-semibold ${getUsageColor(node.cpuUsage)}`}>
                        {node.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getUsageBgColor(node.cpuUsage)}`}
                        style={{ width: `${node.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Memory Usage */}
                {node.memoryUsage !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Memory</span>
                      <span className={`text-xs font-semibold ${getUsageColor(node.memoryUsage)}`}>
                        {node.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getUsageBgColor(node.memoryUsage)}`}
                        style={{ width: `${node.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Last Update */}
                {node.lastUpdate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(node.lastUpdate * 1000).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Available Metrics */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Available Metrics:</div>
              <div className="flex flex-wrap gap-1">
                {node.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            {/* Component Count */}
            <div className="mt-2 text-xs text-gray-500">
              {node.components.length} components
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNodes.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <div className="text-gray-500">No nodes found matching your filters</div>
        </div>
      )}
    </div>
  );
};

export default NodeOverviewComponent;
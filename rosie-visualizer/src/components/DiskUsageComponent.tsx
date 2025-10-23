'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HardDrive, Database, RefreshCw, AlertCircle } from 'lucide-react';
import { useDiskUsage, useDiskCapacity, useNodes } from '../hooks/useDiskUsage';

interface DiskUsageComponentProps {
  className?: string;
}

// Custom gauge component for disk usage
const DiskGauge: React.FC<{ value: number }> = ({ value }) => {
  const safeValue = value ?? 0;
  
  const getColor = (percentage: number) => {
    if (percentage < 70) return '#10b981'; // Green
    if (percentage < 85) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={getColor(safeValue)}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{safeValue.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">DISK</div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format bytes - disk capacity is in GB according to API
const formatBytes = (gigabytes: number): string => {
  if (!gigabytes || gigabytes === 0) return '0 GB';
  
  if (gigabytes < 1024) {
    return `${gigabytes.toFixed(1)} GB`;
  } else {
    const terabytes = gigabytes / 1024;
    return `${terabytes.toFixed(1)} TB`;
  }
};

const DiskUsageComponent: React.FC<DiskUsageComponentProps> = ({ className = '' }) => {
  const { nodes, isLoading: nodesLoading } = useNodes();
  const [selectedNode, setSelectedNode] = useState<string>('');
  
  // Use the first available node as default
  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const { data: usageData, isLoading: usageLoading, error: usageError } = useDiskUsage(selectedNode);
  const { data: capacityData, isLoading: capacityLoading, error: capacityError } = useDiskCapacity(selectedNode);

  const isLoading = usageLoading || capacityLoading;
  const error = usageError || capacityError;

  // Calculate used and free disk space for pie chart
  const pieChartData = React.useMemo(() => {
    if (!usageData || !capacityData || usageData.value === null || usageData.value === undefined) {
      return [];
    }

    const usedPercentage = usageData.value;
    const usedGB = (capacityData * usedPercentage) / 100;
    const freeGB = capacityData - usedGB;

    return [
      {
        name: 'Used Storage',
        value: usedGB,
        percentage: usedPercentage,
        color: usedPercentage < 70 ? '#10b981' : usedPercentage < 85 ? '#f59e0b' : '#ef4444'
      },
      {
        name: 'Free Storage', 
        value: freeGB,
        percentage: 100 - usedPercentage,
        color: '#e5e7eb'
      }
    ];
  }, [usageData, capacityData]);

  if (nodesLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <HardDrive className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading nodes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <HardDrive className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
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
          <HardDrive className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Node selector */}
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Select node"
          title="Select a node to view disk usage"
        >
          {nodes.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!usageData || !capacityData || isLoading || usageData.value === null || usageData.value === undefined ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading disk data...' : 'No data available'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Disk Usage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gauge */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <DiskGauge value={usageData.value} />
                <div>
                  <div className="text-sm text-gray-500">Storage Usage</div>
                  <div className="text-2xl font-bold text-gray-900">{usageData.value.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">
                    Last updated: {new Date(usageData.time * 1000).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name) => [formatBytes(value), name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disk Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Database className="h-4 w-4 text-green-600 mr-1" />
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatBytes(capacityData)}
              </div>
              <div className="text-xs text-gray-500">Total Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {formatBytes((capacityData * usageData.value) / 100)}
              </div>
              <div className="text-xs text-gray-500">Used Storage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatBytes(capacityData - (capacityData * usageData.value) / 100)}
              </div>
              <div className="text-xs text-gray-500">Free Storage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiskUsageComponent;
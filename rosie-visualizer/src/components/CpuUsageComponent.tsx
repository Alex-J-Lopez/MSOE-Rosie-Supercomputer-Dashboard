'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Cpu, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { useCpuUsage, useNodes } from '../hooks/useCpuUsage';

interface CpuUsageComponentProps {
  className?: string;
}

// Custom gauge component for overall CPU usage
const CpuGauge: React.FC<{ value: number }> = ({ value }) => {
  const safeValue = value ?? 0;
  
  const getColor = (percentage: number) => {
    if (percentage < 30) return '#10b981'; // Green
    if (percentage < 70) return '#f59e0b'; // Yellow
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
          <div className="text-xs text-gray-500">CPU</div>
        </div>
      </div>
    </div>
  );
};

const CpuUsageComponent: React.FC<CpuUsageComponentProps> = ({ className = '' }) => {
  const { nodes, isLoading: nodesLoading } = useNodes();
  const [selectedNode, setSelectedNode] = useState<string>('');
  
  // Use the first available node as default
  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const { data, isLoading, error } = useCpuUsage(selectedNode);

  // Prepare data for the bar chart
  const chartData = React.useMemo(() => {
    if (!data?.indivual || !Array.isArray(data.indivual)) return [];
    
    return data.indivual.map((usage, index) => ({
      core: `CPU${index}`,
      usage: Number((usage ?? 0).toFixed(1)),
    }));
  }, [data]);

  const getBarColor = (usage: number) => {
    if (usage < 30) return '#10b981';
    if (usage < 70) return '#f59e0b';
    return '#ef4444';
  };

  if (nodesLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Cpu className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
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
          <Cpu className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
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
          <Cpu className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Node selector */}
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select node"
          title="Select a node to view CPU usage"
        >
          {nodes.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!data || isLoading || data.value === null || data.value === undefined ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading CPU data...' : 'No data available'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall CPU Usage Gauge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CpuGauge value={data.value ?? 0} />
              <div>
                <div className="text-sm text-gray-500">Overall CPU Usage</div>
                <div className="text-2xl font-bold text-gray-900">{(data.value ?? 0).toFixed(1)}%</div>
                <div className="text-xs text-gray-400">
                  Last updated: {new Date((data.time ?? 0) * 1000).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              <span>{data.indivual?.length ?? 0} cores</span>
            </div>
          </div>

          {/* Individual CPU Core Usage Bar Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Core Usage</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="core" 
                    tick={{ fontSize: 12 }}
                    interval={Math.max(0, Math.floor(chartData.length / 20))}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'CPU Usage']}
                    labelFormatter={(label) => `Core: ${label}`}
                  />
                  <Bar dataKey="usage">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.usage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {data.indivual && data.indivual.length > 0 ? 
                  Math.min(...data.indivual.filter(val => val !== null && val !== undefined)).toFixed(1) : 
                  '0.0'}%
              </div>
              <div className="text-xs text-gray-500">Min Usage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {data.indivual && data.indivual.length > 0 ? 
                  (data.indivual.filter(val => val !== null && val !== undefined).reduce((a, b) => a + b, 0) / data.indivual.filter(val => val !== null && val !== undefined).length).toFixed(1) : 
                  '0.0'}%
              </div>
              <div className="text-xs text-gray-500">Avg Usage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {data.indivual && data.indivual.length > 0 ? 
                  Math.max(...data.indivual.filter(val => val !== null && val !== undefined)).toFixed(1) : 
                  '0.0'}%
              </div>
              <div className="text-xs text-gray-500">Max Usage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CpuUsageComponent;
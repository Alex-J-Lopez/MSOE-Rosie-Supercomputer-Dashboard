'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Wifi, RefreshCw, AlertCircle, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { useNetworkSummary, useNodes } from '../hooks/useNetworkSummary';

interface NetworkSummaryComponentProps {
  className?: string;
}

const NetworkSummaryComponent: React.FC<NetworkSummaryComponentProps> = ({ className = '' }) => {
  const { nodes, isLoading: nodesLoading } = useNodes();
  const [selectedNode, setSelectedNode] = useState<string>('');
  
  // Use the first available node as default
  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const { data: networkData, isLoading: networkLoading, error: networkError } = useNetworkSummary(selectedNode);

  const isLoading = networkLoading;
  const error = networkError;

  // Format large numbers for display
  const formatPackets = (packets: number): string => {
    if (packets >= 1000000) {
      return `${(packets / 1000000).toFixed(2)}M`;
    } else if (packets >= 1000) {
      return `${(packets / 1000).toFixed(2)}K`;
    }
    return packets.toString();
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!networkData) return null;

    const packetsIn = networkData.packets_in?.[0]?.value || 0;
    const packetsOut = networkData.packets_out?.[0]?.value || 0;
    const totalPackets = packetsIn + packetsOut;
    const lastUpdate = networkData.packets_in?.[0]?.time || networkData.packets_out?.[0]?.time;

    // Calculate ratio
    const inRatio = totalPackets > 0 ? (packetsIn / totalPackets) * 100 : 0;
    const outRatio = totalPackets > 0 ? (packetsOut / totalPackets) * 100 : 0;

    return {
      packetsIn,
      packetsOut,
      totalPackets,
      inRatio,
      outRatio,
      lastUpdate,
    };
  }, [networkData]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!networkData) return [];

    return [
      {
        name: 'Packets In',
        value: networkData.packets_in?.[0]?.value || 0,
        color: '#3b82f6', // blue
      },
      {
        name: 'Packets Out',
        value: networkData.packets_out?.[0]?.value || 0,
        color: '#10b981', // green
      },
    ];
  }, [networkData]);

  if (nodesLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Wifi className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Network Summary</h3>
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
          <Wifi className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Network Summary</h3>
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
          <Wifi className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Network Summary</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Node selector */}
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Select node"
          title="Select a node to view network summary"
        >
          {nodes.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!networkData || isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading network data...' : 'No data available'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <ArrowDown className="h-5 w-5 text-blue-600 mr-1" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPackets(stats!.packetsIn)}
              </div>
              <div className="text-sm text-gray-600">Packets In</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats!.inRatio.toFixed(1)}% of total
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <ArrowUp className="h-5 w-5 text-green-600 mr-1" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatPackets(stats!.packetsOut)}
              </div>
              <div className="text-sm text-gray-600">Packets Out</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats!.outRatio.toFixed(1)}% of total
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-purple-600 mr-1" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPackets(stats!.totalPackets)}
              </div>
              <div className="text-sm text-gray-600">Total Packets</div>
              <div className="text-xs text-gray-500 mt-1">
                Combined traffic
              </div>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Packet Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={formatPackets}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPackets(value), 'Packets']}
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <rect key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Flow Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inbound Traffic */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ArrowDown className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Inbound Traffic</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Packets:</span>
                  <span className="font-semibold text-gray-900">{stats!.packetsIn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-semibold text-blue-600">{stats!.inRatio.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${stats!.inRatio}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Outbound Traffic */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Outbound Traffic</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Packets:</span>
                  <span className="font-semibold text-gray-900">{stats!.packetsOut.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-semibold text-green-600">{stats!.outRatio.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${stats!.outRatio}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Last Update Info */}
          {stats!.lastUpdate && (
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
              Last updated: {new Date(stats!.lastUpdate * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkSummaryComponent;
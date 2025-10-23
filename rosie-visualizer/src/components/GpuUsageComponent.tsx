'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Thermometer, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import { useGpuUtilization, useGpuTemperature, useGpuNodes } from '../hooks/useGpuUsage';

interface GpuUsageComponentProps {
  className?: string;
}

// Individual GPU card component
const GpuCard: React.FC<{ 
  index: number; 
  utilization: number; 
  temperature: number; 
  lastUpdate: number 
}> = ({ index, utilization, temperature, lastUpdate }) => {
  const getUtilizationColorClass = (usage: number) => {
    if (usage < 30) return 'text-green-500'; // Green
    if (usage < 70) return 'text-yellow-500'; // Yellow
    return 'text-red-500'; // Red
  };

  const getUtilizationBgClass = (usage: number) => {
    if (usage < 30) return 'bg-green-500'; // Green
    if (usage < 70) return 'bg-yellow-500'; // Yellow
    return 'bg-red-500'; // Red
  };

  const getTemperatureColorClass = (temp: number) => {
    if (temp < 60) return 'text-green-500'; // Green
    if (temp < 80) return 'text-yellow-500'; // Yellow
    return 'text-red-500'; // Red
  };

  const getTemperatureBgClass = (temp: number) => {
    if (temp < 60) return 'bg-green-500'; // Green
    if (temp < 80) return 'bg-yellow-500'; // Yellow
    return 'bg-red-500'; // Red
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-yellow-600" />
          <span className="font-medium text-sm">GPU {index}</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(lastUpdate * 1000).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Utilization */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Utilization</span>
            <span className={`text-sm font-semibold ${getUtilizationColorClass(utilization)}`}>
              {utilization}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUtilizationBgClass(utilization)}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-1">
              <Thermometer className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">Temp</span>
            </div>
            <span className={`text-sm font-semibold ${getTemperatureColorClass(temperature)}`}>
              {temperature}°C
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getTemperatureBgClass(temperature)}`}
              style={{ width: `${Math.min(temperature / 100 * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const GpuUsageComponent: React.FC<GpuUsageComponentProps> = ({ className = '' }) => {
  const { nodes, isLoading: nodesLoading } = useGpuNodes();
  const [selectedNode, setSelectedNode] = useState<string>('');
  
  // Use the first available GPU node as default
  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const { data: utilizationData, isLoading: utilizationLoading, error: utilizationError } = useGpuUtilization(selectedNode);
  const { data: temperatureData, isLoading: temperatureLoading, error: temperatureError } = useGpuTemperature(selectedNode);

  const isLoading = utilizationLoading || temperatureLoading;
  const error = utilizationError || temperatureError;

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!utilizationData || !temperatureData) return [];

    const gpuCount = Math.max(
      utilizationData['utilization.gpu']?.length || 0,
      temperatureData['temperature.gpu']?.length || 0
    );

    return Array.from({ length: gpuCount }, (_, index) => ({
      name: `GPU ${index}`,
      utilization: utilizationData['utilization.gpu']?.[index] || 0,
      temperature: temperatureData['temperature.gpu']?.[index] || 0,
    }));
  }, [utilizationData, temperatureData]);

  // Calculate average statistics
  const averageStats = React.useMemo(() => {
    if (!chartData.length) return { avgUtilization: 0, avgTemperature: 0, maxTemp: 0 };

    const avgUtilization = chartData.reduce((sum, gpu) => sum + gpu.utilization, 0) / chartData.length;
    const avgTemperature = chartData.reduce((sum, gpu) => sum + gpu.temperature, 0) / chartData.length;
    const maxTemp = Math.max(...chartData.map(gpu => gpu.temperature));

    return { avgUtilization, avgTemperature, maxTemp };
  }, [chartData]);

  if (nodesLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPU Utilization</h3>
          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading GPU nodes...</div>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPU Utilization</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-center">
            <div className="text-sm">No GPU-enabled nodes found</div>
            <div className="text-xs mt-1">Only nodes with GPU capabilities are shown</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPU Utilization</h3>
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
          <Zap className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPU Utilization</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        
        {/* Node selector */}
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Select GPU node"
          title="Select a GPU-enabled node"
        >
          {nodes.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!utilizationData || !temperatureData || isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isLoading ? 'Loading GPU data...' : 'No data available'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {averageStats.avgUtilization.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Avg Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {averageStats.avgTemperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-500">Avg Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {averageStats.maxTemp}°C
              </div>
              <div className="text-xs text-gray-500">Max Temperature</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}${name === 'utilization' ? '%' : '°C'}`,
                    name === 'utilization' ? 'Utilization' : 'Temperature'
                  ]}
                />
                <Bar dataKey="utilization" name="utilization" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual GPU Cards */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Individual GPUs</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {chartData.map((gpu, index) => (
                <GpuCard
                  key={index}
                  index={index}
                  utilization={gpu.utilization}
                  temperature={gpu.temperature}
                  lastUpdate={utilizationData?.last_update_time || Date.now() / 1000}
                />
              ))}
            </div>
          </div>

          {/* Last Update Info */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            Last updated: {new Date((utilizationData?.last_update_time || Date.now() / 1000) * 1000).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GpuUsageComponent;
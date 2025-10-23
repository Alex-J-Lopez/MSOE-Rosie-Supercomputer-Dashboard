'use client';

import React from 'react';
import { Clock, Zap, Play, Pause } from 'lucide-react';
import { usePollRate, POLL_RATE_OPTIONS } from '../contexts/PollRateContext';

interface PollRateSelectorProps {
  className?: string;
}

const PollRateSelector: React.FC<PollRateSelectorProps> = ({ className = '' }) => {
  const { pollRate, setPollRate, currentOption } = usePollRate();

  const getIcon = (rate: number) => {
    if (rate === 0) return <Pause className="h-4 w-4" />;
    if (rate <= 2000) return <Zap className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  const getStatusColor = (rate: number) => {
    if (rate === 0) return 'text-gray-500';
    if (rate <= 2000) return 'text-red-500';
    if (rate <= 5000) return 'text-green-500';
    if (rate <= 10000) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-gray-600" />
        <div className={`flex items-center space-x-1 ${getStatusColor(pollRate)}`}>
          {getIcon(pollRate)}
          <span className="text-sm font-medium">
            {pollRate === 0 ? 'Manual' : 'Auto'}
          </span>
        </div>
      </div>

      {/* Dropdown Selector */}
      <select
        value={pollRate}
        onChange={(e) => setPollRate(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        aria-label="Select refresh rate"
        title="Choose how often data refreshes"
      >
        {POLL_RATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>

      {/* Current Status */}
      <div className="text-xs text-gray-500 hidden lg:block">
        {currentOption.description}
      </div>
    </div>
  );
};

export default PollRateSelector;
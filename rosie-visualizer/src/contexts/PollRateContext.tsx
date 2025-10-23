'use client';

import React, { createContext, useContext, useState } from 'react';

export interface PollRateOption {
  label: string;
  value: number; // in milliseconds
  description: string;
}

export const POLL_RATE_OPTIONS: PollRateOption[] = [
  { label: '1 second', value: 1000, description: 'Very fast refresh' },
  { label: '2 seconds', value: 2000, description: 'Fast refresh' },
  { label: '5 seconds', value: 5000, description: 'Default refresh' },
  { label: '10 seconds', value: 10000, description: 'Moderate refresh' },
  { label: '30 seconds', value: 30000, description: 'Slow refresh' },
  { label: '1 minute', value: 60000, description: 'Very slow refresh' },
  { label: 'Manual', value: 0, description: 'No auto-refresh' },
];

interface PollRateContextType {
  pollRate: number;
  setPollRate: (rate: number) => void;
  currentOption: PollRateOption;
}

const PollRateContext = createContext<PollRateContextType | undefined>(undefined);

export function PollRateProvider({ children }: { children: React.ReactNode }) {
  const [pollRate, setPollRate] = useState(2000); // Default to 2 seconds

  const currentOption = POLL_RATE_OPTIONS.find(option => option.value === pollRate) || POLL_RATE_OPTIONS[1];

  return (
    <PollRateContext.Provider value={{ pollRate, setPollRate, currentOption }}>
      {children}
    </PollRateContext.Provider>
  );
}

export function usePollRate() {
  const context = useContext(PollRateContext);
  if (context === undefined) {
    throw new Error('usePollRate must be used within a PollRateProvider');
  }
  return context;
}
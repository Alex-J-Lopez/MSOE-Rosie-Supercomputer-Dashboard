'use client';

import React from 'react';
import { PollRateProvider } from '../contexts/PollRateContext';
import { DashboardLayoutProvider } from '../contexts/DashboardLayoutContext';
import PollRateSelector from '../components/PollRateSelector';
import DashboardWithSidebar from '../components/Dashboard/DashboardWithSidebar';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <PollRateProvider>
      <DashboardLayoutProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    MSOE Rosie Dashboard
                  </h1>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
                  >
                    {sidebarOpen ? 'Hide Components' : 'Add Components'}
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <PollRateSelector />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content with Sidebar */}
          <div className="w-full px-6">
            <DashboardWithSidebar sidebarOpen={sidebarOpen} />
          </div>
        </div>
      </DashboardLayoutProvider>
    </PollRateProvider>
  );
}

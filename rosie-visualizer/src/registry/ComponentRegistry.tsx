import React from 'react';
import { Cpu, MemoryStick, HardDrive, Wifi, Zap, Users, Activity, Database, Server } from 'lucide-react';
import CpuUsageComponent from '../components/CpuUsageComponent';
import MemoryUsageComponent from '../components/MemoryUsageComponent';
import DiskUsageComponent from '../components/DiskUsageComponent';
import GpuUsageComponent from '../components/GpuUsageComponent';
import ActiveJobsComponent from '../components/ActiveJobsComponent';
import JobDistributionComponent from '../components/JobDistributionComponent';
import NodeOverviewComponent from '../components/NodeOverviewComponent';
import NetworkSummaryComponent from '../components/NetworkSummaryComponent';
import UserSessionsComponent from '../components/UserSessionsComponent';

export interface DashboardComponent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ className?: string }>;
  defaultSize: 'small' | 'medium' | 'large';
  category: 'hardware' | 'network' | 'system' | 'jobs';
  color: string;
}

// Placeholder components for future implementation
const PlaceholderComponent: React.FC<{ title: string; icon: React.ComponentType<{ className?: string }>; color: string; className?: string }> = 
  ({ title, icon: Icon, color, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className={`flex items-center space-x-2 mb-4 text-${color}-600`}>
        <Icon className="h-6 w-6" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 text-center">
          <div className="text-sm">{title} visualization</div>
          <div className="text-xs mt-1">Coming soon...</div>
        </div>
      </div>
    </div>
  );

export const DASHBOARD_COMPONENTS: DashboardComponent[] = [
  {
    id: 'cpu-usage',
    name: 'CPU Usage',
    description: 'Real-time CPU usage with individual core monitoring',
    icon: Cpu,
    component: CpuUsageComponent,
    defaultSize: 'large',
    category: 'hardware',
    color: 'blue',
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    description: 'Memory utilization and capacity monitoring',
    icon: MemoryStick,
    component: MemoryUsageComponent,
    defaultSize: 'large',
    category: 'hardware',
    color: 'purple',
  },
  {
    id: 'disk-usage',
    name: 'Disk Usage',
    description: 'Storage capacity and usage statistics',
    icon: HardDrive,
    component: DiskUsageComponent,
    defaultSize: 'large',
    category: 'hardware',
    color: 'green',
  },
  {
    id: 'network-summary',
    name: 'Network Summary',
    description: 'Network traffic and packet statistics',
    icon: Wifi,
    component: NetworkSummaryComponent,
    defaultSize: 'small',
    category: 'network',
    color: 'indigo',
  },
  {
    id: 'gpu-utilization',
    name: 'GPU Utilization',
    description: 'GPU usage and temperature monitoring',
    icon: Zap,
    component: GpuUsageComponent,
    defaultSize: 'large',
    category: 'hardware',
    color: 'yellow',
  },
  {
    id: 'active-jobs',
    name: 'Active Jobs',
    description: 'Current running jobs and queue status',
    icon: Activity,
    component: ActiveJobsComponent,
    defaultSize: 'large',
    category: 'jobs',
    color: 'red',
  },
  {
    id: 'job-distribution',
    name: 'Job Distribution',
    description: 'Job distribution across nodes and workload analysis',
    icon: Server,
    component: JobDistributionComponent,
    defaultSize: 'large',
    category: 'jobs',
    color: 'blue',
  },
  {
    id: 'user-sessions',
    name: 'User Sessions',
    description: 'Active user sessions and resource allocation',
    icon: Users,
    component: UserSessionsComponent,
    defaultSize: 'large',
    category: 'system',
    color: 'teal',
  },
  {
    id: 'node-overview',
    name: 'Node Overview',
    description: 'Cluster-wide node status and availability',
    icon: Database,
    component: NodeOverviewComponent,
    defaultSize: 'large',
    category: 'system',
    color: 'gray',
  },
];

export const getComponentById = (id: string): DashboardComponent | undefined => {
  return DASHBOARD_COMPONENTS.find(comp => comp.id === id);
};

export const getComponentsByCategory = (category: string): DashboardComponent[] => {
  return DASHBOARD_COMPONENTS.filter(comp => comp.category === category);
};
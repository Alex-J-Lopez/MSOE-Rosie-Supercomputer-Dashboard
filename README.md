# MSOE Rosie Supercomputer Dashboard

A modern, interactive Next.js web dashboard for monitoring and visualizing workloads, resource utilization, and job distribution across Milwaukee School of Engineering's Rosie Supercomputer.

Check it out: https://alex-j-lopez.github.io/MSOE-Rosie-Supercomputer-Dashboard/
(Note: You'll need to be on the MSOE wifi or using the global protect vpn to get realtime data)

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Overview

The MSOE Rosie Dashboard provides real-time insights into the supercomputer's status and performance metrics. Built with modern web technologies, it offers an intuitive, customizable interface for system administrators and researchers to monitor job execution, resource allocation, and system health.

### ⚠️ Network Access Requirement

**This dashboard requires access to the MSOE campus network or MSOE GlobalProtect VPN to function.** The backend APIs are restricted to on-campus access only. If you are accessing from outside the MSOE campus, you must connect to the GlobalProtect VPN first before running this application.

## Features

### 📊 Dashboard Components

- **Active Jobs Monitor** - Real-time tracking of running, pending, and completing jobs with expandable job details
- **CPU Usage Tracking** - Visual representation of CPU utilization across the system
- **Memory Usage Monitor** - Track memory consumption and availability
- **GPU Usage Dashboard** - Monitor GPU resource allocation and utilization
- **Disk Usage Analytics** - View storage usage across the system
- **Network Summary** - Monitor network traffic and connectivity
- **Node Overview** - Detailed view of individual node status and performance
- **Job Distribution Analysis** - Visualize how jobs are distributed across nodes
- **User Sessions** - Track active user sessions and their resource consumption

### 🎨 Interactive Features

- **Customizable Layout** - Drag-and-drop interface to arrange dashboard components
- **Resizable Widgets** - Adjust component sizes (small, medium, large) to suit your needs
- **Real-time Updates** - Configurable polling rates for data refresh
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Advanced Filtering & Sorting** - Sort and filter job data by multiple criteria
- **Component Management** - Add/remove dashboard components on the fly

### ⚡ Technical Highlights

- **Real-time Data Fetching** - SWR for efficient data synchronization
- **Type-Safe Development** - Full TypeScript support throughout
- **Responsive Grid Layout** - Tailwind CSS-powered adaptive grid system
- **Drag & Drop** - @dnd-kit for smooth reordering and resizing
- **Data Visualization** - Recharts for beautiful, interactive charts
- **Context API** - Global state management for dashboard layout and polling rates

## Project Structure

```
rosie-visualizer/
├── public/                          # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Home page (main dashboard)
│   │   └── favicon.ico
│   ├── components/                 # React components
│   │   ├── Dashboard/
│   │   │   ├── ComponentSidebar.tsx           # Sidebar for adding components
│   │   │   ├── DashboardWithSidebar.tsx       # Main dashboard layout
│   │   │   └── DraggableDashboard.tsx         # Drag-and-drop grid
│   │   ├── ActiveJobsComponent.tsx            # Active jobs display
│   │   ├── CpuUsageComponent.tsx              # CPU metrics
│   │   ├── MemoryUsageComponent.tsx           # Memory metrics
│   │   ├── GpuUsageComponent.tsx              # GPU metrics
│   │   ├── DiskUsageComponent.tsx             # Disk metrics
│   │   ├── NetworkSummaryComponent.tsx        # Network metrics
│   │   ├── NodeOverviewComponent.tsx          # Node status
│   │   ├── JobDistributionComponent.tsx       # Job distribution chart
│   │   ├── UserSessionsComponent.tsx          # User session tracking
│   │   └── PollRateSelector.tsx               # Polling configuration
│   ├── contexts/                   # React Context providers
│   │   ├── DashboardLayoutContext.tsx         # Dashboard layout state
│   │   └── PollRateContext.tsx                # Polling rate state
│   ├── hooks/                      # Custom React hooks
│   │   ├── useJobData.ts                      # Job data fetching
│   │   ├── useCpuUsage.ts                     # CPU metrics hook
│   │   ├── useMemoryUsage.ts                  # Memory metrics hook
│   │   ├── useGpuUsage.ts                     # GPU metrics hook
│   │   ├── useDiskUsage.ts                    # Disk metrics hook
│   │   ├── useNetworkSummary.ts               # Network metrics hook
│   │   ├── useNodeOverview.ts                 # Node data hook
│   │   ├── useJobDistribution.ts              # Job distribution data
│   │   └── useUserSessions.ts                 # User session data
│   └── registry/
│       └── ComponentRegistry.tsx   # Component registration system
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.mjs              # PostCSS configuration
├── package.json                    # Project dependencies
└── next-env.d.ts                   # Next.js TypeScript definitions
```

## Dependencies

### Core
- **next** (15.5.3) - React framework
- **react** (19.1.0) - UI library
- **react-dom** (19.1.0) - DOM rendering

### UI & Styling
- **tailwindcss** (4) - Utility-first CSS framework
- **lucide-react** (0.544.0) - Icon library
- **@tailwindcss/postcss** (4) - Tailwind CSS PostCSS plugin

### Data & State Management
- **swr** (2.3.6) - Data fetching and caching
- **recharts** (3.2.1) - Chart library

### Drag & Drop
- **@dnd-kit/core** (6.3.1) - Drag and drop foundation
- **@dnd-kit/sortable** (10.0.0) - Sortable functionality
- **@dnd-kit/utilities** (3.2.2) - Utility functions

### Development
- **typescript** (5) - Type safety
- **@types/react** (19) - React type definitions
- **@types/react-dom** (19) - React DOM type definitions
- **@types/node** (20) - Node.js type definitions

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Alex-J-Lopez/MSOE-Rosie-Supercomputer-Dashboard-Project.git
cd MSOE-Rosie-Supercomputer-Dashboard-Project/rosie-visualizer
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

### Dashboard Customization

1. **Adding Components**: Click the "Add Components" button in the header to open the sidebar
2. **Dragging Components**: Hover over a component and use the drag handle (three dots) to reorder
3. **Resizing**: Click the maximize/minimize button to toggle component sizes
4. **Removing Components**: Click the X button to remove a component from the dashboard

### Polling Configuration

Adjust the data refresh rate using the poll rate selector in the top-right corner. Choose from predefined intervals to balance between data freshness and system load.

### Job Management

The Active Jobs component allows you to:
- Sort jobs by start time, CPU count, or duration
- Filter jobs by status (Running, Pending, Completing)
- Expand individual job entries for detailed information
- View real-time CPU usage across jobs

## API Integration

The dashboard fetches data from the Rosie Supercomputer's APIs. Key data sources include:

- **Job Data**: Real-time SLURM job information
- **Node Status**: Individual node performance metrics
- **Resource Utilization**: CPU, memory, GPU, and disk usage
- **User Sessions**: Active user information and resource allocation

### ⚠️ Network Access Requirement

**Important**: The backend APIs used by this dashboard are only accessible from the **MSOE campus network** or through the **MSOE GlobalProtect VPN**. 

If you are accessing this dashboard from outside the campus:
- Connect to the MSOE GlobalProtect VPN first
- Then run the application to access the Rosie Supercomputer data

Without proper network access, the dashboard will fail to fetch data and display error messages. Contact MSOE IT support if you need assistance setting up VPN access.

## Architecture

### State Management
- **DashboardLayoutContext**: Manages component layout, sizes, and positions
- **PollRateContext**: Manages data refresh rates globally

### Data Fetching
Custom hooks use SWR for efficient server-side data fetching with automatic caching and revalidation.

### Component System
A registry-based component system allows for easy addition of new dashboard widgets without modifying core dashboard logic.

## Development Workflow

1. **Create new components** in `src/components/`
2. **Add custom hooks** in `src/hooks/` for data fetching
3. **Register components** in `src/registry/ComponentRegistry.tsx`
4. **Style with Tailwind** using utility classes
5. **Test locally** with `npm run dev`
6. **Build and deploy** with `npm run build && npm start`

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Alexander Lopez**
- GitHub: [@Alex-J-Lopez](https://github.com/Alex-J-Lopez)

## Support

For issues, questions, or suggestions, please open an [GitHub Issue](https://github.com/Alex-J-Lopez/MSOE-Rosie-Supercomputer-Dashboard-Project/issues).

---

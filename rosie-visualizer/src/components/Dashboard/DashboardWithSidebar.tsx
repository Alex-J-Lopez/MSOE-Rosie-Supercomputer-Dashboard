'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import ComponentSidebar from './ComponentSidebar';
import DraggableDashboard from './DraggableDashboard';
import { useDashboardLayout } from '../../contexts/DashboardLayoutContext';
import { DashboardComponent } from '../../registry/ComponentRegistry';

interface DashboardWithSidebarProps {
  sidebarOpen: boolean;
}

const DashboardWithSidebar: React.FC<DashboardWithSidebarProps> = ({ sidebarOpen }) => {
  const { items, addItem, moveItem } = useDashboardLayout();
  const [activeComponent, setActiveComponent] = React.useState<DashboardComponent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('Global drag start:', active.id, active.data.current);
    
    if (active.data.current?.type === 'component') {
      setActiveComponent(active.data.current.component);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log('Global drag over:', { activeId: active.id, overId: over?.id });
    
    if (!over) return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Global drag end:', { activeId: active.id, overId: over?.id, activeData: active.data.current });
    
    setActiveComponent(null);
    
    if (!over) return;

    // Handle adding new component from sidebar
    if (active.data.current?.type === 'component') {
      console.log('Attempting to add component:', active.data.current.component);
      if (over.id === 'dashboard-droppable') {
        addItem(active.data.current.component);
        return;
      }
      
      // Check if dropping on an existing dashboard item (for insertion)
      if (over.id && typeof over.id === 'string' && over.id.startsWith('dashboard-item-')) {
        addItem(active.data.current.component);
        return;
      }
    }

    // Handle reordering existing dashboard items
    if (active.data.current?.type === 'dashboard-item' && over.data.current?.type === 'dashboard-item') {
      const activeItemId = active.data.current.item.id;
      const overItemId = over.data.current.item.id;
      
      if (activeItemId !== overItemId) {
        console.log('Reordering dashboard items:', activeItemId, 'to position of', overItemId);
        
        // Find the current array indices
        const activeIndex = sortedItems.findIndex(item => item.id === activeItemId);
        const overIndex = sortedItems.findIndex(item => item.id === overItemId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          console.log('Moving from index', activeIndex, 'to index', overIndex);
          moveItem(activeItemId, overIndex);
        }
      }
    }

    // Also handle dropping on the droppable area to reorder to the end
    if (active.data.current?.type === 'dashboard-item' && over.id === 'dashboard-droppable') {
      // This means we're moving a dashboard item to an empty area, which should maintain its position
      console.log('Dashboard item dropped on empty area, maintaining position');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-screen">
        {/* Component Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 mr-4">
            <ComponentSidebar />
          </div>
        )}

        {/* Dashboard Grid - Full width with margins */}
        <div className="flex-1 min-w-0 px-6 py-6 max-w-none">
          <DraggableDashboard />
        </div>
      </div>

      {/* Global Drag Overlay */}
      <DragOverlay>
        {activeComponent ? (
          <div className="bg-white rounded-lg shadow-lg border p-4 opacity-80">
            <div className="flex items-center space-x-2">
              <activeComponent.icon className={`h-5 w-5 text-${activeComponent.color}-600`} />
              <span className="font-medium">{activeComponent.name}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardWithSidebar;
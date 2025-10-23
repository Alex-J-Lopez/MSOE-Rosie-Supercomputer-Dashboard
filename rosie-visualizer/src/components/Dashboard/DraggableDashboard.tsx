'use client';

import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { X, MoreVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useDashboardLayout, DashboardItem } from '../../contexts/DashboardLayoutContext';
import { getComponentById } from '../../registry/ComponentRegistry';

interface DroppableGridProps {
  children: React.ReactNode;
  className?: string;
}

const DroppableGrid: React.FC<DroppableGridProps> = ({ children, className = '' }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'dashboard-droppable',
  });

  return (
    <div
      ref={setNodeRef}
      className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className} ${
        isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  );
};

interface DraggableItemProps {
  item: DashboardItem;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const { removeItem, updateItemSize } = useDashboardLayout();
  const component = getComponentById(item.componentId);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `dashboard-item-${item.id}`,
    data: {
      type: 'dashboard-item',
      item: item,
    },
  });

  const inlineStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!component) return null;

  const ComponentToRender = component.component;

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 lg:col-span-1';
      case 'large':
        return 'col-span-1 lg:col-span-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={inlineStyle}
      className={`${getSizeClass(item.size)} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative group">
        {/* Drag Handle and Controls */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1 bg-white shadow-lg rounded-md p-1">
            {/* Size Toggle */}
            <button
              onClick={() => updateItemSize(item.id, item.size === 'large' ? 'medium' : 'large')}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title={item.size === 'large' ? 'Make smaller' : 'Make larger'}
            >
              {item.size === 'large' ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <MoreVertical className="h-4 w-4" />
            </div>
            
            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded"
              title="Remove component"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Component */}
        <ComponentToRender className="h-full" />
      </div>
    </div>
  );
};

interface DraggableDashboardProps {
  className?: string;
}

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({ className = '' }) => {
  const { items, removeItem, updateItemSize } = useDashboardLayout();

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  return (
    <DroppableGrid className={className}>
      <SortableContext
        items={sortedItems.map(item => `dashboard-item-${item.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {sortedItems.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </SortableContext>
      
      {/* Empty State */}
      {items.length === 0 && (
        <div className="col-span-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">Empty Dashboard</div>
              <div className="text-sm">
                Drag components from the sidebar to build your custom dashboard
              </div>
            </div>
          </div>
        </div>
      )}
    </DroppableGrid>
  );
};

export default DraggableDashboard;
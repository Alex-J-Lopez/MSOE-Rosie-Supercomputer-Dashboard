'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { DASHBOARD_COMPONENTS, getComponentsByCategory, DashboardComponent } from '../../registry/ComponentRegistry';

interface DraggableComponentProps {
  component: DashboardComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `component-${component.id}`,
    data: {
      type: 'component',
      component: component,
    },
  });

  const inlineStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-${component.color}-400 hover:bg-${component.color}-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={inlineStyle}
    >
      <div className="flex items-center space-x-2">
        <component.icon className={`h-5 w-5 text-${component.color}-600`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {component.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {component.description}
          </div>
        </div>
        <Plus className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

interface ComponentSidebarProps {
  className?: string;
}

const ComponentSidebar: React.FC<ComponentSidebarProps> = ({ className = '' }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['hardware', 'system', 'network', 'jobs'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = [
    { id: 'hardware', name: 'Hardware Monitoring', color: 'blue' },
    { id: 'system', name: 'System Resources', color: 'green' },
    { id: 'network', name: 'Network & Traffic', color: 'indigo' },
    { id: 'jobs', name: 'Job Management', color: 'red' },
  ];

  return (
    <div className={`w-80 bg-gray-50 border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Drag components to add them to your dashboard
        </p>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categories.map((category) => {
          const components = getComponentsByCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="space-y-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded-md"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className={`text-xs px-2 py-1 bg-${category.color}-100 text-${category.color}-800 rounded-full`}>
                  {components.length}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-4 space-y-2">
                  {components.map((component) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Drag components onto the dashboard to customize your layout.</p>
      </div>
    </div>
  );
};

export default ComponentSidebar;
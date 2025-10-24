'use client';

import React, { createContext, useContext, useState } from 'react';
import { DashboardComponent } from '../registry/ComponentRegistry';

export interface DashboardItem {
  id: string;
  componentId: string;
  position: number;
  size: 'small' | 'medium' | 'large';
  settings?: Record<string, any>;
}

interface DashboardLayoutContextType {
  items: DashboardItem[];
  addItem: (component: DashboardComponent, position?: number) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, newPosition: number) => void;
  updateItemSize: (itemId: string, size: 'small' | 'medium' | 'large') => void;
  updateItemSettings: (itemId: string, settings: Record<string, any>) => void;
  clearDashboard: () => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined);

export function DashboardLayoutProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DashboardItem[]>([
    // Default dashboard items
    // {
    //   id: 'default-cpu',
    //   componentId: 'cpu-usage',
    //   position: 0,
    //   size: 'large',
    // },
    // {
    //   id: 'default-memory',
    //   componentId: 'memory-usage',
    //   position: 1,
    //   size: 'medium',
    // },
  ]);

  const addItem = (component: DashboardComponent, position?: number) => {
    const newItem: DashboardItem = {
      id: `item-${component.id}-${Date.now()}`,
      componentId: component.id,
      position: position ?? items.length,
      size: component.defaultSize,
    };

    setItems(prevItems => {
      const newItems = [...prevItems];
      if (position !== undefined) {
        // Insert at specific position
        newItems.splice(position, 0, newItem);
        // Update positions of items that come after
        newItems.forEach((item, index) => {
          item.position = index;
        });
      } else {
        // Add to end
        newItems.push(newItem);
      }
      return newItems;
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      // Reorder positions
      newItems.forEach((item, index) => {
        item.position = index;
      });
      return newItems;
    });
  };

  const moveItem = (itemId: string, newPosition: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const itemIndex = newItems.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return prevItems;
      
      const [movedItem] = newItems.splice(itemIndex, 1);
      newItems.splice(newPosition, 0, movedItem);
      
      // Update all positions
      newItems.forEach((item, index) => {
        item.position = index;
      });
      
      return newItems;
    });
  };

  const updateItemSize = (itemId: string, size: 'small' | 'medium' | 'large') => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, size } : item
      )
    );
  };

  const updateItemSettings = (itemId: string, settings: Record<string, any>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, settings: { ...item.settings, ...settings } } : item
      )
    );
  };

  const clearDashboard = () => {
    setItems([]);
  };

  return (
    <DashboardLayoutContext.Provider value={{
      items,
      addItem,
      removeItem,
      moveItem,
      updateItemSize,
      updateItemSettings,
      clearDashboard,
    }}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext);
  if (context === undefined) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider');
  }
  return context;
}
'use client';
import React, { ReactNode, useState } from 'react';
import { SidebarContext } from './SidebarContext';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 285;

  return (
    <SidebarContext.Provider
      value={{
        toggleSidebar,
        setToggleSidebar,
        sidebarWidth,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}




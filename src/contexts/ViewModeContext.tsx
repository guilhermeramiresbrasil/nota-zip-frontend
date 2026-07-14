'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'individual' | 'shared';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isSharedView: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('individual');

  return (
    <ViewModeContext.Provider value={{
      viewMode,
      setViewMode,
      isSharedView: viewMode === 'shared',
    }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}

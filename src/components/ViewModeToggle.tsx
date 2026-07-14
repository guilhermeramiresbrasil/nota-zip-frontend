'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { User, Users } from 'lucide-react';
import { useState } from 'react';

export function ViewModeToggle() {
  const { user } = useAuth();
  const { viewMode, setViewMode } = useViewMode();
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (user?.plan !== 'shared') return null;

  const isShared = viewMode === 'shared';

  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;

    // Swipe right to shared, swipe left to individual
    if (Math.abs(diff) > 30) {
      if (diff > 0 && !isShared) {
        setViewMode('shared');
      } else if (diff < 0 && isShared) {
        setViewMode('individual');
      }
    }

    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleEnd(e.changedTouches[0].clientX);
  };

  return (
    <div
      className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5 text-xs select-none cursor-grab active:cursor-grabbing touch-pan-x"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <button
        onClick={() => setViewMode('individual')}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all font-medium ${
          !isShared
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Minha visão"
      >
        <User className="h-3 w-3" />
        <span className="hidden lg:inline">Minha</span>
      </button>
      <button
        onClick={() => setViewMode('shared')}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all font-medium ${
          isShared
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Visão compartilhada"
      >
        <Users className="h-3 w-3" />
        <span className="hidden lg:inline">Compartilhada</span>
      </button>
    </div>
  );
}

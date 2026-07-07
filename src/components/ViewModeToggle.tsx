'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { User, Users } from 'lucide-react';

export function ViewModeToggle() {
  const { user } = useAuth();
  const { viewMode, setViewMode } = useViewMode();

  if (user?.plan !== 'shared' || !user?.sharedGroupId) return null;

  const isShared = viewMode === 'shared';

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 text-sm">
      <button
        onClick={() => setViewMode('individual')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium ${
          !isShared
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Minha visão"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Minha visão</span>
      </button>
      <button
        onClick={() => setViewMode('shared')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium ${
          isShared
            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Visão compartilhada"
      >
        <Users className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Visão compartilhada</span>
      </button>
    </div>
  );
}

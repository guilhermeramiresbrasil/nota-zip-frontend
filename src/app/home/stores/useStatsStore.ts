import { create } from 'zustand';
import { DashboardStats } from '../types/dashboard.types';

interface StatsState {
  stats: DashboardStats | null;
  updateStats: (stats: DashboardStats) => void;
  reset: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,

  updateStats: (stats) => {
    set({ stats });
  },

  reset: () => {
    set({ stats: null });
  },
}));

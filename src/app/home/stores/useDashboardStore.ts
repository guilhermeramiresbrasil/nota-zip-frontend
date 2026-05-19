import { create } from 'zustand';
import { DashboardStats } from '../types/dashboard.types';
import { dashboardService } from '../logics/services/dashboardService';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await dashboardService.fetchDashboardStats();
      set({ stats, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        loading: false,
      });
    }
  },

  reset: () => {
    set({ stats: null, loading: false, error: null });
  },
}));

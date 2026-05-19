import { create } from 'zustand';
import { ReportData, ReportPeriod } from '../types/report.types';
import { reportService } from '../logics/services/reportService';

interface ReportsState {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: ReportPeriod['value'];
  fetchReportData: (period: ReportPeriod['value']) => Promise<void>;
  setSelectedPeriod: (period: ReportPeriod['value']) => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reportData: null,
  loading: false,
  error: null,
  selectedPeriod: 'current',

  fetchReportData: async (period) => {
    set({ loading: true, error: null });
    try {
      const data = await reportService.fetchReportData(period);
      set({ reportData: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch report data',
        loading: false,
      });
    }
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
    get().fetchReportData(period);
  },
}));

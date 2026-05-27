import { create } from 'zustand';
import {
  ReportData,
  ReportPeriod,
  ChartConfig,
  ReportFilters,
  DetailedTransaction,
  SummaryStats,
} from '../types/report.types';
import { reportService } from '../logics/services/reportService';

const DEFAULT_CHART_CONFIG: ChartConfig = {
  chartType: 'pie',
  showLegend: true,
  showLabels: true,
  showTooltip: true,
  colorPalette: 'default',
  orientation: 'vertical',
};

const DEFAULT_FILTERS: ReportFilters = {
  startDate: null,
  endDate: null,
  categories: [],
  types: [],
  minAmount: null,
  maxAmount: null,
  searchText: '',
};

function loadChartConfig(): ChartConfig {
  if (typeof window === 'undefined') return DEFAULT_CHART_CONFIG;
  try {
    const saved = localStorage.getItem('notazip-chart-config');
    return saved ? { ...DEFAULT_CHART_CONFIG, ...JSON.parse(saved) } : DEFAULT_CHART_CONFIG;
  } catch {
    return DEFAULT_CHART_CONFIG;
  }
}

interface ReportsState {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: ReportPeriod['value'];
  chartConfig: ChartConfig;
  filters: ReportFilters;
  detailedTransactions: DetailedTransaction[];
  summaryStats: SummaryStats | null;

  fetchReportData: (userId: string, period: ReportPeriod['value']) => Promise<void>;
  setSelectedPeriod: (userId: string, period: ReportPeriod['value']) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  resetChartConfig: () => void;
  updateFilters: (filters: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  fetchDetailedTransactions: (userId: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reportData: null,
  loading: false,
  error: null,
  selectedPeriod: 'current',
  chartConfig: loadChartConfig(),
  filters: DEFAULT_FILTERS,
  detailedTransactions: [],
  summaryStats: null,

  fetchReportData: async (userId, period) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const data = await reportService.fetchReportData(userId, period);
      set({ reportData: data, loading: false });

      const stats: SummaryStats = {
        totalIncome: data.totalIncome,
        totalExpenses: data.totalExpenses,
        balance: data.totalIncome - data.totalExpenses,
        avgDaily: data.avgExpenses,
        largestExpense: Math.max(...(data.categoryData.map((c) => c.value)), 0),
        largestIncome: data.totalIncome,
        topCategory: data.categoryData.length > 0
          ? data.categoryData.reduce((a, b) => (a.value > b.value ? a : b)).name
          : '-',
        growthRate: 0,
      };
      set({ summaryStats: stats });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch report data',
        loading: false,
      });
    }
  },

  setSelectedPeriod: (userId, period) => {
    set({ selectedPeriod: period });
    get().fetchReportData(userId, period);
  },

  updateChartConfig: (config) => {
    const newConfig = { ...get().chartConfig, ...config };
    set({ chartConfig: newConfig });
    if (typeof window !== 'undefined') {
      localStorage.setItem('notazip-chart-config', JSON.stringify(newConfig));
    }
  },

  resetChartConfig: () => {
    set({ chartConfig: DEFAULT_CHART_CONFIG });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notazip-chart-config');
    }
  },

  updateFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  fetchDetailedTransactions: async (userId) => {
    if (!userId) return;
    try {
      const data = await reportService.fetchDetailedTransactions(userId, get().filters);
      set({ detailedTransactions: data });
    } catch (error) {
      console.error('Failed to fetch detailed transactions:', error);
    }
  },
}));

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

  fetchReportData: (userId: string, period: ReportPeriod['value'], partnerId?: string | null) => Promise<void>;
  setSelectedPeriod: (userId: string, period: ReportPeriod['value']) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  resetChartConfig: () => void;
  updateFilters: (filters: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  fetchDetailedTransactions: (userId: string, partnerId?: string | null, userNickname?: string, partnerNickname?: string) => Promise<void>;
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

  fetchReportData: async (userId, period, partnerId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      let data = await reportService.fetchReportData(userId, period);

      // If partnerId is provided, fetch partner's data and combine
      if (partnerId) {
        const partnerData = await reportService.fetchReportData(partnerId, period);

        // Combine the data
        data = {
          totalIncome: data.totalIncome + partnerData.totalIncome,
          totalExpenses: data.totalExpenses + partnerData.totalExpenses,
          avgExpenses: (data.avgExpenses + partnerData.avgExpenses) / 2,
          categoryData: [
            ...data.categoryData.map(c => ({ ...c, userId })),
            ...partnerData.categoryData.map(c => ({ ...c, userId: partnerId })),
          ],
          monthlyData: [
            ...data.monthlyData.map(m => ({ ...m, userId })),
            ...partnerData.monthlyData.map(m => ({ ...m, userId: partnerId })),
          ],
        };

        // Merge category data by name
        const categoryMap = new Map();
        data.categoryData.forEach(c => {
          const existing = categoryMap.get(c.name);
          if (existing) {
            existing.value += c.value;
          } else {
            categoryMap.set(c.name, { ...c });
          }
        });
        data.categoryData = Array.from(categoryMap.values());
      }

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

  fetchDetailedTransactions: async (userId, partnerId) => {
    if (!userId) return;
    try {
      let data = await reportService.fetchDetailedTransactions(userId, get().filters, get().selectedPeriod);

      // If partnerId is provided, fetch partner's transactions and combine
      if (partnerId) {
        const partnerData = await reportService.fetchDetailedTransactions(partnerId, get().filters, get().selectedPeriod);
        data = [...data, ...partnerData];
      }

      set({ detailedTransactions: data });
    } catch (error) {
      console.error('Failed to fetch detailed transactions:', error);
    }
  },
}));

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
}

export interface ReportData {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  totalExpenses: number;
  totalIncome: number;
  avgExpenses: number;
}

export interface ReportPeriod {
  value: 'current' | 'last' | 'quarter' | 'year';
  label: string;
}

export type ChartType = 'pie' | 'bar' | 'line' | 'area';
export type ColorPalette = 'default' | 'warm' | 'cool' | 'pastel';

export interface ChartConfig {
  chartType: ChartType;
  showLegend: boolean;
  showLabels: boolean;
  showTooltip: boolean;
  colorPalette: ColorPalette;
  orientation: 'horizontal' | 'vertical';
}

export interface ReportFilters {
  startDate: string | null;
  endDate: string | null;
  categories: string[];
  types: ('credit' | 'debit')[];
  minAmount: number | null;
  maxAmount: number | null;
  searchText: string;
}

export interface DetailedTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  categoryId?: string;
  type: 'credit' | 'debit';
  amount: number;
  payment_method?: string;
  userId?: string;
  userNickname?: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  avgDaily: number;
  largestExpense: number;
  largestIncome: number;
  topCategory: string;
  growthRate: number;
}

export const COLOR_PALETTES: Record<ColorPalette, string[]> = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c43', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'],
  warm: ['#ff6b6b', '#ffa500', '#ffd93d', '#ff8c42', '#e74c3c', '#f39c12', '#e67e22', '#d35400'],
  cool: ['#4ecdc4', '#45b7d1', '#96e6a1', '#6c5ce7', '#a29bfe', '#00b894', '#0984e3', '#74b9ff'],
  pastel: ['#fab1a0', '#ffeaa7', '#dfe6e9', '#b2bec3', '#fdcb6e', '#e17055', '#00cec9', '#636e72'],
};

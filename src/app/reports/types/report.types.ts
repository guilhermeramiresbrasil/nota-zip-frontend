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

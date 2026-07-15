import { ReportData, ReportPeriod, ReportFilters, DetailedTransaction } from '../../types/report.types';

// Hardcoded production URL
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ReportService {
  private static instance: ReportService;

  private constructor() {}

  static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  private getHeaders(): Record<string, string> {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  async fetchReportData(userId: string, period: ReportPeriod['value']): Promise<ReportData> {
    const response = await fetch(`${GATEWAY_URL}/api/reports`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, period }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.status}`);
    }

    const json = await response.json();
    const data = json.data ?? json;

    return {
      categoryData: data.categoryData ?? [],
      monthlyData: data.monthlyData ?? [],
      totalExpenses: data.totalExpenses ?? 0,
      totalIncome: data.totalIncome ?? 0,
      avgExpenses: data.avgExpenses ?? 0,
    };
  }

  async fetchDetailedTransactions(userId: string, filters: ReportFilters, period?: string): Promise<DetailedTransaction[]> {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      let startDate: string | undefined;
      let endDate: string | undefined;

      // Calculate dates based on period if not provided in filters
      if (!filters.startDate || !filters.endDate) {
        if (period === 'current') {
          startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
          const lastDay = new Date(currentYear, currentMonth, 0).getDate();
          endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (period === 'last') {
          const d = new Date(currentYear, currentMonth - 2, 1);
          const lastMonth = d.getMonth() + 1;
          const lastYear = d.getFullYear();
          startDate = `${lastYear}-${String(lastMonth).padStart(2, '0')}-01`;
          const lastDay = new Date(lastYear, lastMonth, 0).getDate();
          endDate = `${lastYear}-${String(lastMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (period === 'quarter') {
          const d = new Date(currentYear, currentMonth - 3, 1);
          startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
          endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(new Date(currentYear, currentMonth, 0).getDate()).padStart(2, '0')}`;
        } else if (period === 'year') {
          startDate = `${currentYear}-01-01`;
          endDate = `${currentYear}-12-31`;
        }
      }

      const response = await fetch(`${GATEWAY_URL}/api/transactions/list`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId,
          limit: 1000,
          offset: 0,
          startDate: filters.startDate || startDate,
          endDate: filters.endDate || endDate,
        }),
      });

      if (!response.ok) return [];

      const json = await response.json();
      const data = json.data ?? [];

      return data.map((t: any) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        category: t.category || t.categoryId,
        categoryId: t.categoryId,
        type: t.type === 'credit' ? 'credit' : 'debit',
        amount: t.amount,
        payment_method: t.payment_method,
        userId: t.userId,
        userNickname: t.userNickname,
      }));
    } catch {
      return [];
    }
  }
}

export const reportService = ReportService.getInstance();

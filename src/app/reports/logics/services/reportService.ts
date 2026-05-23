import { ReportData, ReportPeriod } from '../../types/report.types';

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

  async fetchReportData(userId: string, period: ReportPeriod['value']): Promise<ReportData> {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`${GATEWAY_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
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
}

export const reportService = ReportService.getInstance();

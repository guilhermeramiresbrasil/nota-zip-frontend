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

  async fetchReportData(period: ReportPeriod['value']): Promise<ReportData> {
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/reports?period=${period}`);
    // return response.json();

    // Dados mockados por enquanto
    const categoryData = [
      { name: 'Alimentação', value: 1200, color: '#3b82f6' },
      { name: 'Transporte', value: 450, color: '#ef4444' },
      { name: 'Moradia', value: 2000, color: '#22c55e' },
      { name: 'Saúde', value: 300, color: '#f59e0b' },
      { name: 'Entretenimento', value: 250, color: '#8b5cf6' },
      { name: 'Educação', value: 400, color: '#ec4899' },
      { name: 'Outros', value: 680, color: '#6b7280' },
    ];

    const monthlyData = [
      { month: 'Jan', receitas: 8500, despesas: 5230 },
      { month: 'Fev', receitas: 8200, despesas: 4900 },
      { month: 'Mar', receitas: 9000, despesas: 5800 },
      { month: 'Abr', receitas: 8800, despesas: 5200 },
      { month: 'Mai', receitas: 9500, despesas: 6100 },
      { month: 'Jun', receitas: 9200, despesas: 5700 },
    ];

    const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);
    const totalIncome = monthlyData.reduce((sum, item) => sum + item.receitas, 0);
    const avgExpenses = totalExpenses / categoryData.length;

    return {
      categoryData,
      monthlyData,
      totalExpenses,
      totalIncome,
      avgExpenses,
    };
  }
}

export const reportService = ReportService.getInstance();

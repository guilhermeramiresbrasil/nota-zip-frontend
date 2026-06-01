import { Transaction, DashboardStats } from '../../types/dashboard.types';
import { calculateDashboardStats } from '../calculations/financeCalculations';

// Hardcoded production URL
const GATEWAY_URL = 'https://api.notazip.com.br';

function getAuthHeaders(): Record<string, string> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async fetchDashboardStats(userId: string): Promise<DashboardStats> {
    const response = await fetch(`${GATEWAY_URL}/api/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, period: 'current' }),
    });

    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);

    const json = await response.json();
    const data = json.data ?? json;

    const totalIncome = data.totalIncome ?? 0;
    const totalExpenses = data.totalExpenses ?? 0;
    const savings = totalIncome - totalExpenses;

    return {
      totalBalance: savings,
      totalIncome,
      totalExpenses,
      savings,
      savingsRate: totalIncome > 0 ? (savings / totalIncome) * 100 : 0,
      monthlyGrowth: 0,
    };
  }

  async fetchRecentTransactions(userId: string): Promise<Transaction[]> {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const response = await fetch(`${GATEWAY_URL}/api/transactions/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, limit: 5, startDate, endDate }),
    });

    if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.status}`);

    const json = await response.json();
    const items: any[] = json.data ?? [];

    return items.map((t) => ({
      id: t.id,
      name: t.description || t.category || '—',
      description: t.description,
      amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
      category: t.category,
      date: formatRelativeDate(t.date),
      type: t.type === 'credit' ? 'income' : 'expense',
    }));
  }

  calculateStats(transactions: Transaction[]): DashboardStats {
    return calculateDashboardStats(transactions);
  }
}

export const dashboardService = DashboardService.getInstance();

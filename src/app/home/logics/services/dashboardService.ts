import { Transaction, DashboardStats } from '../../types/dashboard.types';
import { calculateDashboardStats } from '../calculations/financeCalculations';

/**
 * Serviço para buscar dados do dashboard
 * Por enquanto retorna dados mockados, preparado para integração com API real
 */
export class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Busca estatísticas do dashboard
   * @returns Estatísticas do dashboard
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    // TODO: Integrar com API real
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`);
    // return response.json();

    // Dados mockados por enquanto
    return {
      totalBalance: 12450.00,
      totalIncome: 8500.00,
      totalExpenses: 5230.00,
      savings: 3270.00,
      savingsRate: 38.5,
      monthlyGrowth: 12.5,
    };
  }

  /**
   * Busca transações recentes
   * @returns Lista de transações recentes
   */
  async fetchRecentTransactions(): Promise<Transaction[]> {
    // TODO: Integrar com API real
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/transactions`);
    // return response.json();

    // Dados mockados por enquanto
    return [
      {
        id: '1',
        name: 'Supermercado',
        amount: -450.50,
        category: 'Alimentação',
        date: 'Hoje',
        type: 'expense',
      },
      {
        id: '2',
        name: 'Salário',
        amount: 5000.00,
        category: 'Receita',
        date: 'Ontem',
        type: 'income',
      },
      {
        id: '3',
        name: 'Uber',
        amount: -35.00,
        category: 'Transporte',
        date: 'Ontem',
        type: 'expense',
      },
      {
        id: '4',
        name: 'Netflix',
        amount: -55.90,
        category: 'Entretenimento',
        date: '2 dias atrás',
        type: 'expense',
      },
    ];
  }

  /**
   * Calcula estatísticas baseadas em transações
   * @param transactions - Lista de transações
   * @returns Estatísticas calculadas
   */
  calculateStats(transactions: Transaction[]): DashboardStats {
    return calculateDashboardStats(transactions);
  }
}

export const dashboardService = DashboardService.getInstance();

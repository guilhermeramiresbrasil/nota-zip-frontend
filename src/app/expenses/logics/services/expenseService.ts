import { Transaction } from '@/app/home/types/dashboard.types';
import { ExpenseFormData } from '../../types/expense.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Serviço para gerenciar transações de despesas/receitas
 */
export class ExpenseService {
  private static instance: ExpenseService;

  private constructor() {}

  static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  /**
   * Busca todas as transações
   * @returns Lista de transações
   */
  async fetchTransactions(): Promise<Transaction[]> {
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/transactions`);
    // return response.json();

    // Dados mockados por enquanto
    return [
      {
        id: '1',
        name: 'Supermercado',
        amount: -450.50,
        category: 'Alimentação',
        date: '2024-01-15',
        type: 'expense',
      },
      {
        id: '2',
        name: 'Salário',
        amount: 5000.00,
        category: 'Receita',
        date: '2024-01-14',
        type: 'income',
      },
      {
        id: '3',
        name: 'Uber',
        amount: -35.00,
        category: 'Transporte',
        date: '2024-01-13',
        type: 'expense',
      },
      {
        id: '4',
        name: 'Netflix',
        amount: -55.90,
        category: 'Entretenimento',
        date: '2024-01-12',
        type: 'expense',
      },
    ];
  }

  /**
   * Cria uma nova transação
   * @param formData - Dados do formulário
   * @param type - Tipo de transação (income ou expense)
   * @returns Transação criada
   */
  async createTransaction(
    formData: ExpenseFormData,
    type: 'income' | 'expense'
  ): Promise<Transaction> {
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/transactions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ...formData, type }),
    // });
    // return response.json();

    // Dados mockados por enquanto
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: formData.description || formData.category,
      amount: type === 'expense' ? -parseFloat(formData.amount) : parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      type,
    };

    return newTransaction;
  }

  /**
   * Atualiza uma transação existente
   * @param id - ID da transação
   * @param formData - Dados atualizados
   * @returns Transação atualizada
   */
  async updateTransaction(
    id: string,
    formData: Partial<ExpenseFormData>
  ): Promise<Transaction> {
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/transactions/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });
    // return response.json();

    throw new Error('Not implemented');
  }

  /**
   * Deleta uma transação
   * @param id - ID da transação
   */
  async deleteTransaction(id: string): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/transactions/${id}`, {
    //   method: 'DELETE',
    // });

    throw new Error('Not implemented');
  }
}

export const expenseService = ExpenseService.getInstance();

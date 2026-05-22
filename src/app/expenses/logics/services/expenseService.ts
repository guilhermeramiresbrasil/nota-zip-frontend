import { Transaction } from '@/app/home/types/dashboard.types';
import { ExpenseFormData } from '../../types/expense.types';
import { generateCorrelationId } from '@/lib/utils';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ExpenseService {
  private static instance: ExpenseService;

  private constructor() {}

  static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  private getHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId();
    return {
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
  }

  async fetchTransactions(userId: string, startDate?: string, endDate?: string): Promise<Transaction[]> {
    try {
      const body: Record<string, unknown> = {
        userId,
        limit: 100,
        offset: 0,
      };

      if (startDate && endDate) {
        body.startDate = startDate;
        body.endDate = endDate;
      }

      const response = await fetch(`${GATEWAY_URL}/api/transactions/list`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar transacoes');
      }

      const result = await response.json();
      const data = result.data || [];

      return data.map((t: { id: string; description: string; amount: number; type: string; category: string; date: string }) => ({
        id: t.id,
        name: t.description,
        amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
        category: t.category,
        date: t.date,
        type: t.type === 'credit' ? 'income' : 'expense',
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async createTransaction(
    formData: ExpenseFormData,
    type: 'income' | 'expense',
    userId: string
  ): Promise<Transaction> {
    const response = await fetch(`${GATEWAY_URL}/api/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        userId,
        amount: parseFloat(formData.amount),
        type: type === 'income' ? 'credit' : 'debit',
        category: formData.category,
        description: formData.description || formData.category,
        date: formData.date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar transacao');
    }

    const result = await response.json();
    const t = result.data;

    return {
      id: t.id,
      name: t.description,
      amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
      category: t.category,
      date: t.date,
      type: t.type === 'credit' ? 'income' : 'expense',
    };
  }

  async updateTransaction(
    id: string,
    formData: Partial<ExpenseFormData>,
    userId: string
  ): Promise<Transaction> {
    const body: Record<string, unknown> = {};
    if (formData.amount !== undefined) body.amount = parseFloat(formData.amount);
    if (formData.category !== undefined) body.category = formData.category;
    if (formData.description !== undefined) body.description = formData.description;
    if (formData.date !== undefined) body.date = formData.date;

    const response = await fetch(`${GATEWAY_URL}/api/transactions/${id}?userId=${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar transacao');
    }

    const result = await response.json();
    const t = result.data;

    return {
      id: t.id,
      name: t.description,
      amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
      category: t.category,
      date: t.date,
      type: t.type === 'credit' ? 'income' : 'expense',
    };
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const response = await fetch(`${GATEWAY_URL}/api/transactions/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar transacao');
    }
  }
}

export const expenseService = ExpenseService.getInstance();

import { Transaction } from '@/app/home/types/dashboard.types';
import { ExpenseFormData } from '../../types/expense.types';
import { generateCorrelationId } from '@/lib/utils';
import { categoryService } from './categoryService';
import { cardService } from '@/app/cartoes/logics/cardService';

// Hardcoded production URL
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
        userId: String(userId),
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

      return data.map((t: any) => ({
        id: t.id,
        name: t.description,
        description: t.description,
        amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
        category: t.category,
        categoryId: t.categoryId,
        subcategoryId: t.subcategoryId,
        date: t.date,
        type: t.type === 'credit' ? 'income' : 'expense',
        payment_method: t.payment_method || undefined,
        cardId: t.card_id || undefined,
        installments: t.installments || undefined,
        firstBillingMonth: t.firstBillingMonth || undefined,
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
    let categoryId = formData.subcategoryId || formData.categoryId;

    if (categoryId === 'new' && formData.newCategoryName) {
      const categoryType = type === 'income' ? 'credit' : 'debit';
      const category = await categoryService.createCategory({
        name: formData.newCategoryName,
        type: categoryType,
        parentId: formData.newParentCategoryId,
        userId,
      });
      categoryId = category.id;
    }

    const isCreditCardPurchase =
      type === 'expense' &&
      formData.payment_method === 'credit_card' &&
      formData.card_id;

    if (isCreditCardPurchase) {
      const today = new Date().toISOString().split('T')[0];
      const nowMonth = new Date().toISOString().slice(0, 7);
      await cardService.createPurchase(formData.card_id!, userId, {
        categoryId,
        description: formData.description || '',
        totalAmount: String(parseFloat(formData.amount)),
        installments: formData.installments || '1',
        purchaseDate: formData.date || today,
        firstBillingMonth: formData.firstBillingMonth || nowMonth,
      });
      const total = parseFloat(formData.amount);
      return {
        id: crypto.randomUUID(),
        name: formData.description || 'Compra no crédito',
        amount: -Math.abs(total),
        category: categoryId,
        date: formData.date,
        type: 'expense',
      };
    }

    const response = await fetch(`${GATEWAY_URL}/api/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        userId,
        categoryId,
        amount: parseFloat(formData.amount),
        type: type === 'income' ? 'credit' : 'debit',
        description: formData.description || '',
        date: formData.date,
        ...(formData.payment_method ? { payment_method: formData.payment_method } : {}),
        ...(formData.card_id ? { card_id: formData.card_id } : {}),
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
      category: t.categoryId,
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
    if (formData.amount !== undefined) {
      const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
      body.amount = parseCurrencyToNumber(formData.amount);
    }
    if (formData.categoryId !== undefined) body.categoryId = formData.categoryId;
    if (formData.subcategoryId !== undefined) body.subcategoryId = formData.subcategoryId;
    if (formData.description !== undefined) body.description = formData.description;
    if (formData.date !== undefined) body.date = formData.date;
    if (formData.payment_method !== undefined) body.payment_method = formData.payment_method;
    if (formData.card_id !== undefined) body.card_id = formData.card_id;
    if (formData.installments !== undefined) body.installments = parseInt(formData.installments);
    if (formData.firstBillingMonth !== undefined) body.firstBillingMonth = formData.firstBillingMonth;

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
      description: t.description,
      amount: t.type === 'debit' ? -Math.abs(t.amount) : Math.abs(t.amount),
      category: t.category,
      categoryId: t.categoryId,
      subcategoryId: t.subcategoryId,
      date: t.date,
      type: t.type === 'credit' ? 'income' : 'expense',
      payment_method: t.payment_method,
      cardId: t.card_id,
      installments: t.installments,
      firstBillingMonth: t.firstBillingMonth,
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

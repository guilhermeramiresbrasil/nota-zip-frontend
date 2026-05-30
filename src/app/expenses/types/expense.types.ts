import { Transaction } from '@/app/home/types/dashboard.types';

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  newCategoryName?: string;
}

export interface Expense extends Transaction {
  id: string;
}

export type ExpenseCategory = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Entretenimento' | 'Educação' | 'Shopping' | 'Outros';

export type IncomeCategory = 'Salário' | 'Freelance' | 'Investimentos' | 'Bonificação' | 'Vendas' | 'Outros';

export const expenseCategories: ExpenseCategory[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Entretenimento',
  'Educação',
  'Shopping',
  'Outros',
];

export const incomeCategories: IncomeCategory[] = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Bonificação',
  'Vendas',
  'Outros',
];

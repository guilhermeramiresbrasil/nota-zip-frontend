import { Transaction } from '@/app/home/types/dashboard.types';

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  date: string;
  newCategoryName?: string;
  newParentCategoryId?: string;
  payment_method?: string;
  card_id?: string;
  installments?: string;
  firstBillingMonth?: string;
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

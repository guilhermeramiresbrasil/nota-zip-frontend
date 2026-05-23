export type TransactionType = 'income' | 'expense' | 'credit' | 'debit';

export interface Transaction {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  monthlyGrowth: number;
}

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: 'primary' | 'outline';
}

export interface StatsCardProps {
  title: string;
  value: number;
  trend?: number;
  variant?: 'balance' | 'income' | 'expense' | 'savings';
}

export interface TransactionItemProps {
  transaction: Transaction;
}

export interface QuickActionsProps {
  actions: QuickAction[];
}

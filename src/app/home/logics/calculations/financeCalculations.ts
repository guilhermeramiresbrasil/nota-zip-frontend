import { Transaction, DashboardStats } from '../../types/dashboard.types';

/**
 * Calcula o saldo total baseado nas transações
 * @param transactions - Lista de transações
 * @returns Saldo total
 */
export function calculateTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Calcula o total de receitas
 * @param transactions - Lista de transações
 * @returns Total de receitas
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'income' || transaction.type === 'credit')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
}

/**
 * Calcula o total de despesas
 * @param transactions - Lista de transações
 * @returns Total de despesas (valor absoluto)
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'expense' || transaction.type === 'debit')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
}

/**
 * Calcula a taxa de economia (savings rate)
 * @param income - Total de receitas
 * @param expenses - Total de despesas
 * @returns Taxa de economia em porcentagem (0-100)
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
}

/**
 * Calcula o crescimento mensal
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Taxa de crescimento em porcentagem
 */
export function calculateMonthlyGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcula todas as estatísticas do dashboard
 * @param transactions - Lista de transações
 * @param previousMonthTransactions - Lista de transações do mês anterior (opcional)
 * @returns Estatísticas completas do dashboard
 */
export function calculateDashboardStats(
  transactions: Transaction[],
  previousMonthTransactions?: Transaction[]
): DashboardStats {
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const totalBalance = totalIncome - totalExpenses;
  const savings = totalBalance;
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  let monthlyGrowth = 0;
  if (previousMonthTransactions) {
    const previousBalance = calculateTotalBalance(previousMonthTransactions);
    monthlyGrowth = calculateMonthlyGrowth(totalBalance, previousBalance);
  }

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    monthlyGrowth,
  };
}

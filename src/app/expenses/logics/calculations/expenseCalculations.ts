import { Transaction, TransactionType } from '@/app/home/types/dashboard.types';

/**
 * Conta o número de transações de um tipo na última semana
 * @param transactions - Lista de transações
 * @param type - Tipo de transação (income ou expense)
 * @returns Número de transações na última semana
 */
export function countWeeklyTransactions(
  transactions: Transaction[],
  type: TransactionType
): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return transactions.filter(
    (t) =>
      t.type === type &&
      new Date(t.date) >= oneWeekAgo
  ).length;
}

/**
 * Filtra transações por categoria
 * @param transactions - Lista de transações
 * @param category - Categoria para filtrar
 * @returns Transações filtradas
 */
export function filterByCategory(
  transactions: Transaction[],
  category: string
): Transaction[] {
  return transactions.filter((t) => t.category === category);
}

/**
 * Calcula o total de um tipo de transação
 * @param transactions - Lista de transações
 * @param type - Tipo de transação (income ou expense)
 * @returns Total calculado
 */
export function calculateTotalByType(
  transactions: Transaction[],
  type: TransactionType
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((total, t) => total + Math.abs(t.amount), 0);
}

/**
 * Filtra transações por período
 * @param transactions - Lista de transações
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Transações filtradas
 */
export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

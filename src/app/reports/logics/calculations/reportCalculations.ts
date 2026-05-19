import { CategoryData, MonthlyData } from '../../types/report.types';

/**
 * Calcula o total de despesas por categoria
 * @param categoryData - Dados das categorias
 * @returns Total de despesas
 */
export function calculateTotalExpenses(categoryData: CategoryData[]): number {
  return categoryData.reduce((sum, item) => sum + item.value, 0);
}

/**
 * Calcula o total de receitas mensais
 * @param monthlyData - Dados mensais
 * @returns Total de receitas
 */
export function calculateTotalIncome(monthlyData: MonthlyData[]): number {
  return monthlyData.reduce((sum, item) => sum + item.receitas, 0);
}

/**
 * Calcula a média de despesas
 * @param categoryData - Dados das categorias
 * @returns Média de despesas
 */
export function calculateAvgExpenses(categoryData: CategoryData[]): number {
  const total = calculateTotalExpenses(categoryData);
  return total / categoryData.length;
}

/**
 * Calcula a tendência de crescimento mensal
 * @param monthlyData - Dados mensais
 * @returns Porcentagem de crescimento
 */
export function calculateGrowthRate(monthlyData: MonthlyData[]): number {
  if (monthlyData.length < 2) return 0;

  const lastMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const incomeGrowth =
    ((lastMonth.receitas - previousMonth.receitas) / previousMonth.receitas) * 100;
  const expenseGrowth =
    ((lastMonth.despesas - previousMonth.despesas) / previousMonth.despesas) * 100;

  return incomeGrowth - expenseGrowth;
}

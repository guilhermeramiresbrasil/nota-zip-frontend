'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '../home/components/StatsCard';
import { ExpenseFilter } from './components/ExpenseFilter';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { useTransactionsStore } from '@/stores/useTransactionsStore';
import { usePlanLimitsStore } from '@/stores/usePlanLimitsStore';
import { useExpensePageStore } from './stores/useExpensePageStore';
import { countWeeklyTransactions, calculateTotalByType } from './logics/calculations/expenseCalculations';

export default function ExpensesPage() {
  const { transactions, loading, fetchTransactions } = useTransactionsStore();
  const { limits, canAddTransaction, refresh } = usePlanLimitsStore();
  const { transactionType, setTransactionType, setDialogOpen } = useExpensePageStore();

  useEffect(() => {
    fetchTransactions();
    refresh();
  }, [fetchTransactions, refresh]);

  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpenses = calculateTotalByType(transactions, 'expense');
  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    const weeklyCount = countWeeklyTransactions(transactions, transactionType);
    if (!canAddTransaction(transactionType, weeklyCount)) {
      // TODO: Show limit error
      return;
    }
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader title="Transações" description="Gerencie suas receitas e despesas" />

        <div className="flex justify-between items-center mb-6">
          <ExpenseFilter
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
          />
          <Button onClick={handleAddTransaction}>
            <Plus className="h-5 w-5 mr-2" />
            Nova Transação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Receitas" value={totalIncome} variant="income" />
          <StatsCard title="Total Despesas" value={totalExpenses} variant="expense" />
          <StatsCard title="Saldo" value={balance} variant="balance" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <ExpenseList transactions={transactions} />
            )}
          </CardContent>
        </Card>

        <ExpenseForm />
      </div>
    </ProtectedRoute>
  );
}

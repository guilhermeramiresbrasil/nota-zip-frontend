'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '../home/components/StatsCard';
import { ExpenseFilter } from './components/ExpenseFilter';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { expenseService } from './logics/services/expenseService';
import { calculateTotalByType } from './logics/calculations/expenseCalculations';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/app/home/types/dashboard.types';

interface FormData {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  newCategoryName?: string;
  payment_method?: string;
  card_id?: string;
  installments?: string;
  firstBillingMonth?: string;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user?.id || !dateRange.startDate) return;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const transactionsData = await expenseService.fetchTransactions(user.id, dateRange.startDate, dateRange.endDate);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.id, dateRange]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpenses = calculateTotalByType(transactions, 'expense');
  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: '',
      card_id: '',
      installments: '1',
      firstBillingMonth: new Date().toISOString().slice(0, 7),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const newTransaction = await expenseService.createTransaction(formData, transactionType, user.id);
      setDialogOpen(false);
      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      await expenseService.deleteTransaction(id, user.id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader title="Transações" description="Gerencie suas receitas e despesas" />

        <div className="flex justify-between items-center mb-6">
          <ExpenseFilter
            onDateRangeChange={handleDateRangeChange}
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
              <ExpenseList
                transactions={transactions}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        <ExpenseForm 
          dialogOpen={dialogOpen} 
          onDialogOpenChange={setDialogOpen} 
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          formData={formData}
          onChangeFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </ProtectedRoute>
  );
}

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
import { countWeeklyTransactions, calculateTotalByType } from './logics/calculations/expenseCalculations';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  amount: string;
  category: string;
  description: string;
  date: string;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsData = await expenseService.fetchTransactions();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpenses = calculateTotalByType(transactions, 'expense');
  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData, transactionType);
    setDialogOpen(false);
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

        <ExpenseForm 
          dialogOpen={dialogOpen} 
          onDialogOpenChange={setDialogOpen} 
          transactionType={transactionType}
          formData={formData}
          onChangeFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </ProtectedRoute>
  );
}

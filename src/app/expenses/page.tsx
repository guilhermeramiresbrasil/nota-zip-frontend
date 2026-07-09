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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { expenseService } from './logics/services/expenseService';
import { calculateTotalByType } from './logics/calculations/expenseCalculations';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/app/home/types/dashboard.types';

interface FormData {
  amount: string;
  categoryId: string;
  subcategoryId?: string;
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
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
    setEditingTransaction(null);
    setFormData({
      amount: '',
      categoryId: '',
      subcategoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: '',
      card_id: '',
      installments: '1',
      firstBillingMonth: new Date().toISOString().slice(0, 7),
    });
    setDialogOpen(true);
  };

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        categoryId: transaction.category,
        subcategoryId: '',
        description: transaction.description || '',
        date: transaction.date,
        payment_method: '',
        card_id: '',
        installments: '1',
        firstBillingMonth: new Date().toISOString().slice(0, 7),
      });
      setTransactionType(transaction.type as 'income' | 'expense');
      setDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      if (editingTransaction) {
        // Update existing transaction
        const updatedTransaction = await expenseService.updateTransaction(
          editingTransaction.id,
          formData,
          user.id
        );
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t))
        );
      } else {
        // Create new transaction
        const newTransaction = await expenseService.createTransaction(formData, transactionType, user.id);
        setTransactions((prev) => [newTransaction, ...prev]);
      }
      setDialogOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user?.id || !transactionToDelete) return;

    try {
      await expenseService.deleteTransaction(transactionToDelete, user.id);
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete));
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
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
                onEdit={handleEditTransaction}
                onDelete={handleDeleteClick}
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

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir Transação"
          description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}

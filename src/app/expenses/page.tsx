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
import { useViewMode } from '@/contexts/ViewModeContext';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('expenses');
  const { user } = useAuth();
  const { isSharedView } = useViewMode();
  const parseCurrencyToNumber = (v: string) => {
    if (user?.currency === 'USD') {
      return parseFloat(v.replace(/,/g, '')) || 0;
    }
    return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch shared group info to get partner ID
  useEffect(() => {
    if (!user?.id || user?.plan !== 'shared') return;
    const fetchSharedGroup = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/shared-groups/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        if (data.success && data.data) {
          const group = data.data;
          // Set partner ID based on whether user is owner or partner
          if (group.ownerId === user.id) {
            setPartnerId(group.partnerId);
          } else if (group.partnerId === user.id) {
            setPartnerId(group.ownerId);
          }
        }
      } catch (error) {
        console.error('Error fetching shared group:', error);
      }
    };
    fetchSharedGroup();
  }, [user?.id, user?.plan]);

  useEffect(() => {
    if (!user?.id || !dateRange.startDate) return;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let transactionsData: Transaction[] = [];

        // Fetch user's transactions
        const userTransactions = await expenseService.fetchTransactions(user.id, dateRange.startDate, dateRange.endDate);
        transactionsData = [...userTransactions];

        // If in shared view and partner exists, fetch partner's transactions
        if (isSharedView && partnerId) {
          const partnerTransactions = await expenseService.fetchTransactions(partnerId, dateRange.startDate, dateRange.endDate);
          transactionsData = [...transactionsData, ...partnerTransactions];
        }

        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.id, dateRange, isSharedView, partnerId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const amountValue = parseCurrencyToNumber(formData.amount);
    if (!formData.amount || amountValue <= 0) {
      alert(t('amountRequired'));
      return;
    }
    if (!formData.categoryId) {
      alert(t('categoryRequired'));
      return;
    }
    if (transactionType === 'expense' && !formData.payment_method) {
      alert(t('paymentMethodRequired'));
      return;
    }

    try {
      if (editingTransactionId) {
        const updatedTransaction = await expenseService.updateTransaction(editingTransactionId, formData, user.id);
        setTransactions((prev) => prev.map((t) => t.id === editingTransactionId ? updatedTransaction : t));
        setEditingTransactionId(null);
      } else {
        const newTransaction = await expenseService.createTransaction(formData, transactionType, user.id);
        setTransactions((prev) => [newTransaction, ...prev]);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
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

  const handleEdit = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    // Format amount to user locale for CurrencyInput
    const amountValue = Math.abs(transaction.amount);
    const formattedAmount = amountValue.toLocaleString(user?.language || 'pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setFormData({
      amount: formattedAmount,
      categoryId: transaction.categoryId || transaction.category || '',
      subcategoryId: transaction.subcategoryId || '',
      description: transaction.description || transaction.name || '',
      date: transaction.date || new Date().toISOString().split('T')[0],
      payment_method: transaction.payment_method || undefined,
      card_id: transaction.cardId || undefined,
      installments: String(transaction.installments || 1),
      firstBillingMonth: transaction.firstBillingMonth || new Date().toISOString().slice(0, 7),
    });
    setTransactionType(transaction.type === 'income' ? 'income' : 'expense');
    setEditingTransactionId(id);
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader title={t('pageTitle')} description={t('pageDescription')} />

        <div className="flex justify-between items-center mb-6">
          <ExpenseFilter
            onDateRangeChange={handleDateRangeChange}
          />
          <Button onClick={handleAddTransaction}>
            <Plus className="h-5 w-5 mr-2" />
            {t('newTransactionButton')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title={t('totalIncome')} value={totalIncome} variant="income" />
          <StatsCard title={t('totalExpenses')} value={totalExpenses} variant="expense" />
          <StatsCard title={t('balance')} value={balance} variant="balance" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('history')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t('loading')}</div>
            ) : (
              <ExpenseList
                transactions={transactions}
                onEdit={handleEdit}
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

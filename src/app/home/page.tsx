'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from './components/StatsCard';
import { QuickActions } from './components/QuickActions';
import { TransactionItem } from './components/TransactionItem';
import { dashboardService } from './logics/services/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData] = await Promise.all([
          dashboardService.fetchRecentTransactions(),
        ]);
        setTransactions(transactionsData);

        // Calculate stats from transactions
        const totalIncome = transactionsData
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        const totalExpenses = transactionsData
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

        setStats({
          totalBalance: totalIncome - totalExpenses,
          totalIncome,
          totalExpenses,
          savings: totalIncome - totalExpenses,
          monthlyGrowth: 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setStatsLoading(false);
        setTransactionsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader
          title="Bem-vindo ao Nota Zip"
          description="Gerencie suas finanças de forma simples e inteligente"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Saldo Total"
            value={stats?.totalBalance || 0}
            trend={stats?.monthlyGrowth}
            variant="balance"
          />
          <StatsCard
            title="Receitas"
            value={stats?.totalIncome || 0}
            trend={stats?.monthlyGrowth}
            variant="income"
          />
          <StatsCard
            title="Despesas"
            value={stats?.totalExpenses || 0}
            trend={stats?.monthlyGrowth}
            variant="expense"
          />
          <StatsCard
            title="Economia"
            value={stats?.savings || 0}
            variant="savings"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando transações...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

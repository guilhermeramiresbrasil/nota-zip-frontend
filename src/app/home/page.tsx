'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from './components/StatsCard';
import { QuickActions } from './components/QuickActions';
import { TransactionItem } from './components/TransactionItem';
import { dashboardService } from './logics/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const [statsData, transactionsData] = await Promise.all([
          dashboardService.fetchDashboardStats(user.id),
          dashboardService.fetchRecentTransactions(user.id),
        ]);
        setStats(statsData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setStatsLoading(false);
        setTransactionsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader
          title={user?.name ? `Bem-vindo, ${user.name.split(' ')[0]}` : 'Bem-vindo ao Nota Zip'}
          description="Gerencie suas finanças de forma simples e inteligente"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))
          ) : (
            <>
              <StatsCard
                title="Saldo Total"
                value={stats?.totalBalance || 0}
                trend={stats?.monthlyGrowth}
                variant="balance"
              />
              <StatsCard
                title="Receitas"
                value={stats?.totalIncome || 0}
                variant="income"
              />
              <StatsCard
                title="Despesas"
                value={stats?.totalExpenses || 0}
                variant="expense"
              />
              <StatsCard
                title="Economia"
                value={stats?.savings || 0}
                variant="savings"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando transações...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma transação encontrada.</p>
                <p className="text-sm mt-1">Adicione sua primeira transação em <strong>Novo Gasto</strong>.</p>
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

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
import { useViewMode } from '@/contexts/ViewModeContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { isSharedView } = useViewMode();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);

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
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        let statsData: any = null;
        let transactionsData: any[] = [];

        // Fetch user's data
        const [userStats, userTransactions] = await Promise.all([
          dashboardService.fetchDashboardStats(user.id),
          dashboardService.fetchRecentTransactions(user.id),
        ]);

        statsData = userStats;
        transactionsData = userTransactions;

        // If in shared view and partner exists, fetch partner's data
        if (isSharedView && partnerId) {
          const [partnerStats, partnerTransactions] = await Promise.all([
            dashboardService.fetchDashboardStats(partnerId),
            dashboardService.fetchRecentTransactions(partnerId),
          ]);

          // Combine stats
          statsData = {
            totalBalance: (userStats?.totalBalance || 0) + (partnerStats?.totalBalance || 0),
            totalIncome: (userStats?.totalIncome || 0) + (partnerStats?.totalIncome || 0),
            totalExpenses: (userStats?.totalExpenses || 0) + (partnerStats?.totalExpenses || 0),
            savings: (userStats?.savings || 0) + (partnerStats?.savings || 0),
            monthlyGrowth: ((userStats?.monthlyGrowth || 0) + (partnerStats?.monthlyGrowth || 0)) / 2,
          };

          // Combine transactions
          transactionsData = [...userTransactions, ...partnerTransactions];
        }

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
  }, [user?.id, isSharedView, partnerId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <PageHeader
            title={user?.name ? `Bem-vindo, ${user.name.split(' ')[0]}` : 'Bem-vindo ao Nota Zip'}
            description="Gerencie suas finanças de forma simples e inteligente"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
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
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Transações Recentes</CardTitle>
              <CardDescription className="text-slate-500">Últimas movimentações do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-500 mt-4">Carregando transações...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhuma transação encontrada.</p>
                  <p className="text-sm mt-1">Adicione sua primeira transação em <strong>Novo Gasto</strong>.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

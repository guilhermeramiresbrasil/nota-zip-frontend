'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { CategoryChart } from './components/CategoryChart';
import { MonthlyChart } from './components/MonthlyChart';
import { PeriodSelector } from './components/PeriodSelector';
import { useReportsStore } from './stores/useReportsStore';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const { reportData, loading, selectedPeriod, fetchReportData, setSelectedPeriod } = useReportsStore();

  useEffect(() => {
    if (user?.id) {
      fetchReportData(user.id, selectedPeriod);
    }
  }, [user?.id, fetchReportData, selectedPeriod]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title="Relatórios" description="Análise detalhada das suas finanças" />
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={(period) => setSelectedPeriod(user?.id ?? '', period)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando relatórios...</div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryChart data={reportData.categoryData} />
              <MonthlyChart data={reportData.monthlyData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Receitas</h3>
                <p className="text-2xl font-bold text-green-600">
                  R$ {reportData.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Despesas</h3>
                <p className="text-2xl font-bold text-red-600">
                  R$ {reportData.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Média de Despesas</h3>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {reportData.avgExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Nenhum dado disponível</div>
        )}
      </div>
    </ProtectedRoute>
  );
}

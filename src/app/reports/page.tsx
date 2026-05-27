'use client';

import { useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { CategoryChart } from './components/CategoryChart';
import { MonthlyChart } from './components/MonthlyChart';
import { PeriodSelector } from './components/PeriodSelector';
import { ChartConfigComponent } from './components/ChartConfig';
import { ExportButton } from './components/ExportButton';
import { SummaryCards } from './components/SummaryCards';
import { AdvancedFilters } from './components/AdvancedFilters';
import { DataTable } from './components/DataTable';
import { useReportsStore } from './stores/useReportsStore';
import { useAuth } from '@/contexts/AuthContext';
import { exportService } from './logics/services/exportService';

export default function ReportsPage() {
  const { user } = useAuth();
  const {
    reportData, loading, selectedPeriod, chartConfig, filters,
    detailedTransactions, summaryStats,
    fetchReportData, setSelectedPeriod,
    updateChartConfig, resetChartConfig,
    updateFilters, resetFilters, fetchDetailedTransactions,
  } = useReportsStore();

  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchReportData(user.id, selectedPeriod);
      fetchDetailedTransactions(user.id);
    }
  }, [user?.id, fetchReportData, selectedPeriod, fetchDetailedTransactions]);

  useEffect(() => {
    if (user?.id) {
      fetchDetailedTransactions(user.id);
    }
  }, [user?.id, filters, fetchDetailedTransactions]);

  const categories = reportData?.categoryData.map((c) => c.name) ?? [];

  const handleExportCSV = () => {
    if (detailedTransactions.length > 0) {
      exportService.exportToCSV(detailedTransactions, 'notazip-transacoes');
    }
  };

  const handleExportSummaryCSV = () => {
    if (summaryStats) {
      exportService.exportSummaryCSV(summaryStats, 'notazip-resumo');
    }
  };

  const handleExportPDF = async () => {
    if (dashboardRef.current) {
      await exportService.exportToPDF(dashboardRef.current, 'notazip-relatorio');
    }
  };

  const handleExportImage = async () => {
    if (chartsRef.current) {
      await exportService.exportChartAsImage(chartsRef.current, 'notazip-graficos');
    }
  };

  const handleExportDashboard = async () => {
    if (dashboardRef.current) {
      await exportService.exportDashboardAsImage(dashboardRef.current, 'notazip-dashboard');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <PageHeader title="Relatórios" description="Análise detalhada das suas finanças" />
          <div className="flex items-center gap-2">
            <ExportButton
              onExportCSV={handleExportCSV}
              onExportSummaryCSV={handleExportSummaryCSV}
              onExportPDF={handleExportPDF}
              onExportImage={handleExportImage}
              onExportDashboard={handleExportDashboard}
            />
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={(period) => setSelectedPeriod(user?.id ?? '', period)}
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            categories={categories}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando relatórios...</div>
        ) : reportData ? (
          <div ref={dashboardRef} className="space-y-6">
            {summaryStats && <SummaryCards stats={summaryStats} />}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CategoryChart data={reportData.categoryData} config={chartConfig} />
                  <MonthlyChart data={reportData.monthlyData} config={chartConfig} />
                </div>
              </div>
              <div>
                <ChartConfigComponent
                  config={chartConfig}
                  onConfigChange={updateChartConfig}
                  onReset={resetChartConfig}
                />
              </div>
            </div>

            <DataTable data={detailedTransactions} />
          </div>
        ) : (
          <div className="text-center py-8">Nenhum dado disponível</div>
        )}
      </div>
    </ProtectedRoute>
  );
}

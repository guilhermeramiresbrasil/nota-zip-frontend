'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { CategoryChart } from './components/CategoryChart';
import { MonthlyChart } from './components/MonthlyChart';
import { PaymentMethodChart } from './components/PaymentMethodChart';
import { ParentCategoryChart } from './components/ParentCategoryChart';
import { SubcategoryChart } from './components/SubcategoryChart';
import { PeriodSelector } from './components/PeriodSelector';
import { ExportButton } from './components/ExportButton';
import { SummaryCards } from './components/SummaryCards';
import { DataTable } from './components/DataTable';
import { SimpleFilter } from './components/SimpleFilter';
import { useReportsStore } from './stores/useReportsStore';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { exportService } from './logics/services/exportService';
import { COLOR_PALETTES, ChartConfig } from './types/report.types';
import { categoryService } from '../expenses/logics/services/categoryService';

export default function ReportsPage() {
  const { user } = useAuth();
  const { isSharedView } = useViewMode();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryChartConfig, setCategoryChartConfig] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: true,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [monthlyChartConfig, setMonthlyChartConfig] = useState<ChartConfig>({
    chartType: 'bar',
    showLegend: true,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [paymentChartConfig, setPaymentChartConfig] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: true,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [parentCategoryConfigCredit, setParentCategoryConfigCredit] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: false,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [parentCategoryConfigDebit, setParentCategoryConfigDebit] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: false,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [subcategoryConfigCredit, setSubcategoryConfigCredit] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: false,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [subcategoryConfigDebit, setSubcategoryConfigDebit] = useState<ChartConfig>({
    chartType: 'pie',
    showLegend: false,
    showLabels: true,
    showTooltip: true,
    colorPalette: 'default',
    orientation: 'horizontal',
  });
  const [categoriesMap, setCategoriesMap] = useState<Map<string, any>>(new Map());
  const {
    reportData, loading, selectedPeriod, filters,
    detailedTransactions, summaryStats,
    fetchReportData, setSelectedPeriod,
    updateFilters, resetFilters, fetchDetailedTransactions,
  } = useReportsStore();

  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  // Fetch categories to build a map for determining parent/subcategory relationships
  useEffect(() => {
    if (!user?.id) return;
    const fetchCategories = async () => {
      try {
        const categories = await categoryService.fetchCategories('both', user.id);
        const map = new Map<string, any>();
        categories.forEach((cat: any) => {
          map.set(cat.id, cat);
        });
        setCategoriesMap(map);
        setCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesMap(new Map());
        setCategories([]);
      }
    };
    fetchCategories();
  }, [user?.id]);

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
    if (user?.id) {
      fetchReportData(user.id, selectedPeriod, isSharedView ? partnerId : null);
      fetchDetailedTransactions(user.id, isSharedView ? partnerId : null);
    }
  }, [user?.id, fetchReportData, selectedPeriod, fetchDetailedTransactions, isSharedView, partnerId]);

  useEffect(() => {
    if (user?.id) {
      fetchDetailedTransactions(user.id, isSharedView ? partnerId : null);
    }
  }, [user?.id, filters, fetchDetailedTransactions, isSharedView, partnerId]);

  const categoryNames = reportData?.categoryData.map((c) => c.name) ?? [];

  // Calculate payment method data from detailed transactions
  const paymentMethodData = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    const methodMap = new Map<string, number>();
    detailedTransactions.forEach(t => {
      const method = t.payment_method || 'Outros';
      methodMap.set(method, (methodMap.get(method) || 0) + Math.abs(t.amount));
    });

    return Array.from(methodMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
    }));
  }, [detailedTransactions]);

  // Calculate category data (parent categories including their subcategories) - separated by type
  const parentCategoryDataCredit = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    if (categoriesMap.size === 0) {
      const categoryMap = new Map<string, number>();
      detailedTransactions.forEach(t => {
        if (t.type !== 'credit') return;
        const category = t.category || 'Outros';
        if (!category.includes(':')) {
          categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(t.amount));
        } else {
          const parentCategory = category.split(':')[0].trim();
          categoryMap.set(parentCategory, (categoryMap.get(parentCategory) || 0) + Math.abs(t.amount));
        }
      });

      return Array.from(categoryMap.entries()).map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
    }

    const categoryMap = new Map<string, number>();
    detailedTransactions.forEach(t => {
      const categoryId = t.categoryId;
      if (!categoryId) return;

      const category = categoriesMap.get(categoryId);
      if (!category) return;

      // Only include credit categories
      if (category.type !== 'credit' && category.type !== 'both') return;

      // Use parentName if available (for subcategories), otherwise use name
      const categoryName = category.parentName || category.name || 'Outros';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + Math.abs(t.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
    }));
  }, [detailedTransactions, categoriesMap]);

  const parentCategoryDataDebit = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    if (categoriesMap.size === 0) {
      const categoryMap = new Map<string, number>();
      detailedTransactions.forEach(t => {
        if (t.type !== 'debit') return;
        const category = t.category || 'Outros';
        if (!category.includes(':')) {
          categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(t.amount));
        } else {
          const parentCategory = category.split(':')[0].trim();
          categoryMap.set(parentCategory, (categoryMap.get(parentCategory) || 0) + Math.abs(t.amount));
        }
      });

      return Array.from(categoryMap.entries()).map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
    }

    const categoryMap = new Map<string, number>();
    detailedTransactions.forEach(t => {
      const categoryId = t.categoryId;
      if (!categoryId) return;

      const category = categoriesMap.get(categoryId);
      if (!category) return;

      // Only include debit categories
      if (category.type !== 'debit' && category.type !== 'both') return;

      // Use parentName if available (for subcategories), otherwise use name
      const categoryName = category.parentName || category.name || 'Outros';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + Math.abs(t.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
    }));
  }, [detailedTransactions, categoriesMap]);

  // Calculate subcategory data (all categories, counting transactions) - separated by type
  const subcategoryDataCredit = React.useMemo(() => {
    if (categoriesMap.size === 0) return [];

    // Get all categories for credit type
    const creditCategories = categories.filter((cat: any) => 
      cat.type === 'credit' || cat.type === 'both'
    );

    // Count transactions for each category
    const categoryCountMap = new Map<string, number>();
    creditCategories.forEach((cat: any) => {
      categoryCountMap.set(cat.name, 0);
    });

    // Count transactions for each category
    detailedTransactions.forEach(t => {
      if (t.type !== 'credit') return;
      const categoryId = t.categoryId;
      if (!categoryId) return;

      const category = categoriesMap.get(categoryId);
      if (!category) return;

      if (category.type === 'credit' || category.type === 'both') {
        const categoryName = category.name || 'Outros';
        categoryCountMap.set(categoryName, (categoryCountMap.get(categoryName) || 0) + 1);
      }
    });

    return Array.from(categoryCountMap.entries())
      .filter(([_, value]) => value > 0)
      .map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
  }, [detailedTransactions, categoriesMap, categories]);

  const subcategoryDataDebit = React.useMemo(() => {
    if (categoriesMap.size === 0) return [];

    // Get all categories for debit type
    const debitCategories = categories.filter((cat: any) => 
      cat.type === 'debit' || cat.type === 'both'
    );

    // Count transactions for each category
    const categoryCountMap = new Map<string, number>();
    debitCategories.forEach((cat: any) => {
      categoryCountMap.set(cat.name, 0);
    });

    // Count transactions for each category
    detailedTransactions.forEach(t => {
      if (t.type !== 'debit') return;
      const categoryId = t.categoryId;
      if (!categoryId) return;

      const category = categoriesMap.get(categoryId);
      if (!category) return;

      if (category.type === 'debit' || category.type === 'both') {
        const categoryName = category.name || 'Outros';
        categoryCountMap.set(categoryName, (categoryCountMap.get(categoryName) || 0) + 1);
      }
    });

    return Array.from(categoryCountMap.entries())
      .filter(([_, value]) => value > 0)
      .map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
  }, [detailedTransactions, categoriesMap, categories]);

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

        {loading ? (
          <div className="text-center py-8">Carregando relatórios...</div>
        ) : reportData ? (
          <div ref={dashboardRef} className="space-y-6">
            <SimpleFilter
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={resetFilters}
            />
            {summaryStats && <SummaryCards stats={summaryStats} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  <ParentCategoryChart 
                    data={parentCategoryDataCredit} 
                    config={parentCategoryConfigCredit}
                    onConfigChange={setParentCategoryConfigCredit}
                    onConfigReset={() => setParentCategoryConfigCredit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title="Categorias - Receitas"
                  />
                  <ParentCategoryChart 
                    data={parentCategoryDataDebit} 
                    config={parentCategoryConfigDebit}
                    onConfigChange={setParentCategoryConfigDebit}
                    onConfigReset={() => setParentCategoryConfigDebit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title="Categorias - Despesas"
                  />
                  <SubcategoryChart 
                    data={subcategoryDataCredit} 
                    config={subcategoryConfigCredit}
                    onConfigChange={setSubcategoryConfigCredit}
                    onConfigReset={() => setSubcategoryConfigCredit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title="Subcategorias - Receitas"
                  />
                  <SubcategoryChart 
                    data={subcategoryDataDebit} 
                    config={subcategoryConfigDebit}
                    onConfigChange={setSubcategoryConfigDebit}
                    onConfigReset={() => setSubcategoryConfigDebit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title="Subcategorias - Despesas"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyChart 
                data={reportData.monthlyData} 
                config={monthlyChartConfig}
                onConfigChange={setMonthlyChartConfig}
                onConfigReset={() => setMonthlyChartConfig({
                  chartType: 'bar',
                  showLegend: true,
                  showLabels: true,
                  showTooltip: true,
                  colorPalette: 'default',
                  orientation: 'horizontal',
                })}
              />
            </div>

            <DataTable 
              data={detailedTransactions} 
              isSharedView={isSharedView}
            />
          </div>
        ) : (
          <div className="text-center py-8">Nenhum dado disponível</div>
        )}
      </div>
    </ProtectedRoute>
  );
}

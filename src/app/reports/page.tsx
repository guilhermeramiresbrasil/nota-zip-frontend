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
import { useTranslations } from 'next-intl';
import { exportService } from './logics/services/exportService';
import { COLOR_PALETTES, ChartConfig } from './types/report.types';
import { categoryService } from '../expenses/logics/services/categoryService';

export default function ReportsPage() {
  const t = useTranslations('reports');
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
        const parentMap = new Map<string, string>(); // id -> parent name

        // Flatten categories array (extract subcategories)
        const flatCategories: any[] = [];
        categories.forEach((cat: any) => {
          flatCategories.push(cat);
          if (cat.subcategories && cat.subcategories.length > 0) {
            cat.subcategories.forEach((sub: any) => {
              flatCategories.push(sub);
            });
          }
        });

        // First pass: create map of all categories
        flatCategories.forEach((cat: any) => {
          map.set(cat.id, cat);
        });

        // Second pass: populate parentMap with parent names
        flatCategories.forEach((cat: any) => {
          if (cat.parentId && map.has(cat.parentId)) {
            const parent = map.get(cat.parentId);
            parentMap.set(cat.id, parent.name);
          }
        });

        // Add parentName to each category in the map
        map.forEach((cat: any, id: string) => {
          if (parentMap.has(id)) {
            cat.parentName = parentMap.get(id);
          }
        });

        setCategoriesMap(map);
        setCategories(flatCategories);
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

  // Calculate category data (parent categories only, aggregating subcategories) - separated by type
  const parentCategoryDataCredit = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    const categoryMap = new Map<string, number>();
    detailedTransactions.forEach(t => {
      if (t.type !== 'credit') return;

      let categoryName = 'Outros';

      // Try to get category name from categoriesMap first
      if (t.categoryId && categoriesMap.size > 0) {
        const category = categoriesMap.get(t.categoryId);
        if (category) {
          // Check if category type is compatible with transaction type
          // If category is debit but transaction is credit, skip this category
          if (category.type === 'debit') return;
          // For parent category chart, use parentName if it's a subcategory, otherwise use name
          categoryName = category.parentName || category.name || 'Outros';
        } else {
          // Fallback to category field
          categoryName = t.category || 'Outros';
        }
      } else {
        // Fallback to category field
        categoryName = t.category || 'Outros';
      }

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

    const categoryMap = new Map<string, number>();
    detailedTransactions.forEach(t => {
      if (t.type !== 'debit') return;

      let categoryName = 'Outros';

      // Try to get category name from categoriesMap first
      if (t.categoryId && categoriesMap.size > 0) {
        const category = categoriesMap.get(t.categoryId);
        if (category) {
          // Check if category type is compatible with transaction type
          // If category is credit but transaction is debit, skip this category
          if (category.type === 'credit') return;
          categoryName = category.parentName || category.name || 'Outros';
        } else {
          // Fallback to category field
          categoryName = t.category || 'Outros';
        }
      } else {
        // Fallback to category field
        categoryName = t.category || 'Outros';
      }

      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + Math.abs(t.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
    }));
  }, [detailedTransactions, categoriesMap]);

  // Calculate subcategory data (all categories and subcategories) - separated by type
  const subcategoryDataCredit = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    const categoryAmountMap = new Map<string, number>();

    detailedTransactions.forEach(t => {
      if (t.type !== 'credit') return;

      let categoryName = 'Outros';

      // Try to get category name from categoriesMap first
      if (t.categoryId && categoriesMap.size > 0) {
        const category = categoriesMap.get(t.categoryId);
        if (category) {
          // Check if category type is compatible with transaction type
          // If category is debit but transaction is credit, skip this category
          if (category.type === 'debit') return;
          categoryName = category.name || 'Outros';
        } else {
          // Fallback to category field
          categoryName = t.category || 'Outros';
        }
      } else {
        // Fallback to category field
        categoryName = t.category || 'Outros';
      }

      categoryAmountMap.set(categoryName, (categoryAmountMap.get(categoryName) || 0) + Math.abs(t.amount));
    });

    return Array.from(categoryAmountMap.entries())
      .filter(([_, value]) => value > 0)
      .map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
  }, [detailedTransactions, categoriesMap]);

  const subcategoryDataDebit = React.useMemo(() => {
    if (!detailedTransactions || detailedTransactions.length === 0) return [];

    const categoryAmountMap = new Map<string, number>();

    detailedTransactions.forEach(t => {
      if (t.type !== 'debit') return;

      let categoryName = 'Outros';

      // Try to get category name from categoriesMap first
      if (t.categoryId && categoriesMap.size > 0) {
        const category = categoriesMap.get(t.categoryId);
        if (category) {
          // Check if category type is compatible with transaction type
          // If category is credit but transaction is debit, skip this category
          if (category.type === 'credit') return;
          categoryName = category.name || 'Outros';
        } else {
          // Fallback to category field
          categoryName = t.category || 'Outros';
        }
      } else {
        // Fallback to category field
        categoryName = t.category || 'Outros';
      }

      categoryAmountMap.set(categoryName, (categoryAmountMap.get(categoryName) || 0) + Math.abs(t.amount));
    });

    return Array.from(categoryAmountMap.entries())
      .filter(([_, value]) => value > 0)
      .map(([name, value], i) => ({
        name,
        value,
        color: COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
      }));
  }, [detailedTransactions, categoriesMap]);

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

  // Wrapper functions for chart config changes
  const handleParentCategoryConfigCreditChange = (config: Partial<ChartConfig>) => {
    setParentCategoryConfigCredit(prev => ({ ...prev, ...config }));
  };

  const handleParentCategoryConfigDebitChange = (config: Partial<ChartConfig>) => {
    setParentCategoryConfigDebit(prev => ({ ...prev, ...config }));
  };

  const handleSubcategoryConfigCreditChange = (config: Partial<ChartConfig>) => {
    setSubcategoryConfigCredit(prev => ({ ...prev, ...config }));
  };

  const handleSubcategoryConfigDebitChange = (config: Partial<ChartConfig>) => {
    setSubcategoryConfigDebit(prev => ({ ...prev, ...config }));
  };

  const handleMonthlyChartConfigChange = (config: Partial<ChartConfig>) => {
    setMonthlyChartConfig(prev => ({ ...prev, ...config }));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <PageHeader title={t('title')} description={t('description')} />
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
          <div className="text-center py-8">{t('loading')}</div>
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
                    onConfigChange={handleParentCategoryConfigCreditChange}
                    onConfigReset={() => setParentCategoryConfigCredit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title={t('incomeCategories')}
                  />
                  <ParentCategoryChart 
                    data={parentCategoryDataDebit} 
                    config={parentCategoryConfigDebit}
                    onConfigChange={handleParentCategoryConfigDebitChange}
                    onConfigReset={() => setParentCategoryConfigDebit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title={t('expenseCategories')}
                  />
                  <SubcategoryChart 
                    data={subcategoryDataCredit} 
                    config={subcategoryConfigCredit}
                    onConfigChange={handleSubcategoryConfigCreditChange}
                    onConfigReset={() => setSubcategoryConfigCredit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title={t('incomeSubcategories')}
                  />
                  <SubcategoryChart 
                    data={subcategoryDataDebit} 
                    config={subcategoryConfigDebit}
                    onConfigChange={handleSubcategoryConfigDebitChange}
                    onConfigReset={() => setSubcategoryConfigDebit({
                      chartType: 'pie',
                      showLegend: true,
                      showLabels: true,
                      showTooltip: true,
                      colorPalette: 'default',
                      orientation: 'horizontal',
                    })}
                    title={t('expenseSubcategories')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyChart 
                data={reportData.monthlyData} 
                config={monthlyChartConfig}
                onConfigChange={handleMonthlyChartConfigChange}
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
          <div className="text-center py-8">{t('noData')}</div>
        )}
      </div>
    </ProtectedRoute>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { SummaryStats } from '../types/report.types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const t = useTranslations('reports');
  const { user } = useAuth();
  const cards = [
    { key: 'totalIncome', value: stats.totalIncome, color: 'text-green-600', icon: TrendingUp, isCurrency: true },
    { key: 'totalExpenses', value: stats.totalExpenses, color: 'text-red-600', icon: TrendingDown, isCurrency: true },
    { key: 'balance', value: stats.balance, color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600', icon: DollarSign, isCurrency: true },
    { key: 'avgDaily', value: stats.avgDaily, color: 'text-blue-600', icon: BarChart3, isCurrency: true },
    { key: 'largestExpense', value: stats.largestExpense, color: 'text-red-500', icon: ArrowDownRight, isCurrency: true },
    { key: 'largestIncome', value: stats.largestIncome, color: 'text-green-500', icon: ArrowUpRight, isCurrency: true },
    { key: 'topCategory', value: stats.topCategory, color: 'text-purple-600', icon: BarChart3, isCurrency: false },
    { key: 'growthRate', value: stats.growthRate, color: stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600', icon: TrendingUp, isCurrency: false, suffix: '%' },
  ];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(user?.language || 'pt-BR', { style: 'currency', currency: user?.currency || 'BRL' }).format(v);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs font-medium text-gray-500">{t(card.key)}</p>
              </div>
              <p className={`text-lg font-bold ${card.color}`}>
                {typeof card.value === 'number'
                  ? card.isCurrency
                    ? formatCurrency(card.value)
                    : `${card.value.toFixed(2)}${card.suffix || ''}`
                  : card.value || '-'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

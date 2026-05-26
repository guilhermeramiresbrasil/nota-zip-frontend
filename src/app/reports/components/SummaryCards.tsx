'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SummaryStats } from '../types/report.types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    { label: 'Total Receitas', value: stats.totalIncome, color: 'text-green-600', icon: TrendingUp, prefix: 'R$ ' },
    { label: 'Total Despesas', value: stats.totalExpenses, color: 'text-red-600', icon: TrendingDown, prefix: 'R$ ' },
    { label: 'Saldo', value: stats.balance, color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600', icon: DollarSign, prefix: 'R$ ' },
    { label: 'Média Diária', value: stats.avgDaily, color: 'text-blue-600', icon: BarChart3, prefix: 'R$ ' },
    { label: 'Maior Despesa', value: stats.largestExpense, color: 'text-red-500', icon: ArrowDownRight, prefix: 'R$ ' },
    { label: 'Maior Receita', value: stats.largestIncome, color: 'text-green-500', icon: ArrowUpRight, prefix: 'R$ ' },
    { label: 'Categoria Top', value: stats.topCategory, color: 'text-purple-600', icon: BarChart3, prefix: '' },
    { label: 'Evolução', value: stats.growthRate, color: stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600', icon: TrendingUp, prefix: '', suffix: '%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs font-medium text-gray-500">{card.label}</p>
              </div>
              <p className={`text-lg font-bold ${card.color}`}>
                {typeof card.value === 'number'
                  ? `${card.prefix}${card.value.toFixed(2)}${card.suffix || ''}`
                  : card.value || '-'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

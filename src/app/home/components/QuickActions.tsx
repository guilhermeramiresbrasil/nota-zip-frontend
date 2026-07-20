'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActionButton } from '@/components/QuickActionButton';
import { Plus, Wallet, ArrowRight, BarChart3, CreditCard } from 'lucide-react';
import { QuickAction } from '../types/dashboard.types';

interface QuickActionsProps {
  actions?: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const t = useTranslations('home');
  const defaultActions: QuickAction[] = [
    { label: t('newExpense'), icon: Plus, href: '/expenses', variant: 'primary' },
    { label: t('viewReports'), icon: BarChart3, href: '/reports', variant: 'outline' },
    { label: t('myCards'), icon: CreditCard, href: '/cartoes', variant: 'outline' },
  ];
  const renderedActions = actions || defaultActions;

  return (
    <Card className="mb-8 border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-800">{t('quickActions')}</CardTitle>
        <CardDescription className="text-slate-500">{t('quickActionsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderedActions.map((action, index) => (
            <QuickActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

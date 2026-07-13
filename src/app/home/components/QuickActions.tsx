import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActionButton } from '@/components/QuickActionButton';
import { Plus, Wallet, ArrowRight, BarChart3, CreditCard } from 'lucide-react';
import { QuickAction } from '../types/dashboard.types';

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { label: 'Novo Gasto', icon: Plus, href: '/expenses', variant: 'primary' },
  { label: 'Ver Relatórios', icon: BarChart3, href: '/reports', variant: 'outline' },
  { label: 'Meus Cartões', icon: CreditCard, href: '/cartoes', variant: 'outline' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ actions = defaultActions }) => {
  return (
    <Card className="mb-8 border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-800">Ações Rápidas</CardTitle>
        <CardDescription className="text-slate-500">Acesse rapidamente as funcionalidades mais usadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <QuickActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActionButton } from '@/components/QuickActionButton';
import { Plus, Wallet, ArrowRight } from 'lucide-react';
import { QuickAction } from '../types/dashboard.types';

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { label: 'Novo Gasto', icon: Plus, href: '/expenses', variant: 'primary' },
  { label: 'Ver Relatórios', icon: Wallet, href: '/reports', variant: 'outline' },
  { label: 'Guarda Garantias', icon: ArrowRight, href: '/garantias', variant: 'outline' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ actions = defaultActions }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
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

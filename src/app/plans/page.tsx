'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { PlanCard } from './components/PlanCard';
import { PlanComparison } from './components/PlanComparison';
import { planService } from '../../services/planService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plan } from './types/plan.types';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await planService.fetchPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: 'free' | 'basic' | 'premium') => {
    if (planId === 'free') {
      showSuccess('Plano Grátis ativado!');
      router.push('/home');
      return;
    }
    showError('Pagamento em breve disponível. Continue no plano Grátis por enquanto.');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        title="Planos e Preços"
        description="Escolha o plano ideal para suas necessidades"
      />

      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={() => router.push('/home')}>
          Pular por enquanto
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={user?.plan}
            isCurrentPlan={user?.plan === plan.id}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanComparison plans={plans} />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { PlanCard } from './components/PlanCard';
import { PlanComparison } from './components/PlanComparison';
import { planService } from './logics/services/planService';
import { useAuthStore } from '@/stores/useAuthStore';
import { Plan } from './types/plan.types';

export default function PlansPage() {
  const { user } = useAuthStore();
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
    try {
      await planService.upgradePlan({ planId });
      // TODO: Refresh user data
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { PlanCard } from './components/PlanCard';
import { PlanComparison } from './components/PlanComparison';
import { StripePricingTable } from './components/StripePricingTable';
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
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

  const handleUpgrade = async (planId: 'free' | 'basic' | 'premium' | 'shared') => {
    if (planId === 'free') {
      showSuccess('Plano Grátis ativado!');
      router.push('/home');
      return;
    }
    const plan = plans.find(p => p.id === planId);
    if (plan) setSelectedPlan(plan);
  };

  const handleCheckout = async () => {
    console.log('🔍 Debug - user:', user);
    console.log('🔍 Debug - user.id:', user?.id);
    console.log('🔍 Debug - selectedPlan:', selectedPlan);
    
    if (!selectedPlan) {
      showError('Selecione um plano primeiro.');
      return;
    }
    if (!user?.id) {
      showError('Usuário não autenticado. Faça login novamente.');
      return;
    }
    if (!selectedPlan.planUuid) {
      showError('Plano não encontrado. Tente recarregar a página.');
      return;
    }
    setCheckoutLoading(selectedPlan.id);
    try {
      const { checkoutUrl } = await planService.createPaymentLink({
        userId: user.id,
        planId: selectedPlan.planUuid,
        billingCycle,
      });
      window.location.href = checkoutUrl;
    } catch (error: any) {
      showError(error.message || 'Erro ao gerar link de pagamento.');
      setCheckoutLoading(null);
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
      {/* Stripe Pricing Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Assinar Plano</h2>
        <StripePricingTable
          pricingTableId="prctbl_1TqyyS7ZGxkJBfmcxJlfeIGA"
          publishableKey="pk_test_51TXREK7ZGxkJBfmch0Ltz9BeQ9D9q3PD1BygSFZ0tM1rlSDkbAK8fmqvkW6wS4zzlREVn0IVM4e3vz5yP8FX1ay700sXOu9Zhx"
          customerEmail={user?.email}
          clientReferenceId={user?.id}
          successUrl="http://localhost:3000/home"
        />
      </div>
    </div>
  );
}

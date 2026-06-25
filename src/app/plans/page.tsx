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

  const handleUpgrade = async (planId: 'free' | 'basic' | 'premium') => {
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

      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={() => router.push('/home')}>
          Pular por enquanto
        </Button>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assinar {selectedPlan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2">Ciclo de cobrança</p>
                <div className="flex gap-2">
                  <Button variant={billingCycle === 'monthly' ? 'default' : 'outline'} className="flex-1" onClick={() => setBillingCycle('monthly')}>Mensal</Button>
                  <Button variant={billingCycle === 'yearly' ? 'default' : 'outline'} className="flex-1" onClick={() => setBillingCycle('yearly')}>Anual <span className="ml-1 text-xs opacity-70">-10%</span></Button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedPlan(null)}>Cancelar</Button>
                <Button className="flex-1" disabled={!!checkoutLoading} onClick={handleCheckout}>
                  {checkoutLoading ? 'Aguarde...' : 'Ir para pagamento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

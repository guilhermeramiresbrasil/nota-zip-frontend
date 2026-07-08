'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, plans.length - 1));
    setActiveIndex(clamped);
    const container = carouselRef.current;
    if (!container) return;
    const card = container.children[clamped] as HTMLElement;
    if (card) {
      container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'smooth' });
    }
  };

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
      if (selectedPlan.id === 'shared') {
        router.push('/shared-group/setup');
      } else {
        window.location.href = checkoutUrl;
      }
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

      {/* Plans Carousel */}
      <div className="relative mb-12 -mx-4 sm:mx-0">
        {/* Seta esquerda */}
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all hidden sm:flex"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Cards */}
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 sm:px-8"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          onScroll={(e) => {
            const el = e.currentTarget;
            const cardWidth = el.scrollWidth / plans.length;
            setActiveIndex(Math.round(el.scrollLeft / cardWidth));
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="snap-start flex-shrink-0 w-[80vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]"
            >
              <PlanCard
                plan={plan}
                currentPlan={user?.plan}
                isCurrentPlan={user?.plan === plan.id}
                onUpgrade={handleUpgrade}
              />
            </div>
          ))}
        </div>

        {/* Seta direita */}
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === plans.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all hidden sm:flex"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {plans.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all ${
                i === activeIndex ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
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

import { Plan, PlanUpgradeRequest, CreatePaymentLinkRequest } from '../app/plans/types/plan.types';
import { generateCorrelationId } from '../lib/utils';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getHeaders(): Record<string, string> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    'x-correlation-id': generateCorrelationId(),
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
  };
}

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    description: 'Para começar a experimentar',
    price: 'R$ 0',
    period: '/mês',
    features: [
      'Transações ilimitadas',
    ],
    notIncluded: [
      'WhatsApp para inserir notas em áudio, foto ou texto',
      'Exportação de dados',
      'Suporte prioritário',
    ],
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
    uploadLimit: 15,
  },
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para começar a organizar suas finanças',
    price: 'R$ 29,90',
    period: '/mês',
    features: [
      'Transações ilimitadas',
      'Relatórios',
      'Guarda Garantia (notas salvas pelo tempo que você escolher)',
    ],
    notIncluded: [
      'WhatsApp para inserir notas em áudio, foto ou texto',
      'Exportação de dados',
      'Suporte prioritário',
    ],
    popular: false,
    gradient: 'from-blue-500 to-blue-600',
    uploadLimit: 400,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Experiência completa com todas as funcionalidades',
    price: 'R$ 59,90',
    period: '/mês',
    features: [
      'Transações ilimitadas',
      'Relatórios',
      'Guarda Garantia (notas salvas pelo tempo que você escolher)',
      'WhatsApp para inserir notas em áudio, foto ou texto',
      'Exportação de dados',
      'Suporte prioritário',
    ],
    notIncluded: [],
    popular: true,
    gradient: 'from-purple-500 to-purple-600',
    uploadLimit: 1024,
  },
];

export class PlanService {
  private static instance: PlanService;

  private constructor() {}

  static getInstance(): PlanService {
    if (!PlanService.instance) {
      PlanService.instance = new PlanService();
    }
    return PlanService.instance;
  }

  async fetchPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/subscriptions/plans`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((p: any) => ({
          id: p.name as 'free' | 'basic' | 'premium',
          planUuid: p.id,
          name: p.name === 'free' ? 'Grátis' : p.name === 'basic' ? 'Básico' : 'Premium',
          description: FALLBACK_PLANS.find(f => f.id === p.name)?.description || '',
          price: !p.price || p.price === 0 ? 'R$ 0' : `R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}`,
          period: '/mês',
          features: p.features || FALLBACK_PLANS.find(f => f.id === p.name)?.features || [],
          notIncluded: FALLBACK_PLANS.find(f => f.id === p.name)?.notIncluded || [],
          popular: p.name === 'premium',
          gradient: FALLBACK_PLANS.find(f => f.id === p.name)?.gradient || 'from-gray-500 to-gray-600',
          uploadLimit: FALLBACK_PLANS.find(f => f.id === p.name)?.uploadLimit || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch plans from API, using fallback:', error);
    }
    return FALLBACK_PLANS;
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<{ checkoutUrl: string; orderNsu: string }> {
    console.log('🔍 planService.createPaymentLink - request:', request);
    const response = await fetch(`${GATEWAY_URL}/api/subscriptions/create-payment-link`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    const data = await response.json();
    console.log('🔍 planService.createPaymentLink - response:', data);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Erro ao criar link de pagamento');
    }
    return data.data || data;
  }

  async upgradePlan(request: PlanUpgradeRequest): Promise<void> {
    if (request.planId === 'free') {
      return;
    }
    throw new Error('Pagamento em breve disponível');
  }

  async downgradePlan(request: PlanUpgradeRequest): Promise<void> {
    throw new Error('Pagamento em breve disponível');
  }
}

export const planService = PlanService.getInstance();

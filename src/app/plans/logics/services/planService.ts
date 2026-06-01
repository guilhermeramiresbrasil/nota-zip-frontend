import { Plan, PlanUpgradeRequest } from '../../types/plan.types';

// Hardcoded production URL
const GATEWAY_URL = 'https://api.notazip.com.br';

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
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/plans`);
    // return response.json();

    return [
      {
        id: 'free',
        name: 'Grátis',
        description: 'Para começar a experimentar',
        price: 'R$ 0',
        period: '/mês',
        features: [
          '1 receita por semana',
          '5 despesas por semana',
          'Relatórios',
        ],
        notIncluded: [
          'Transações ilimitadas',
          'WhatsApp para inserir notas',
          'Envio de fotos de notas',
          'Envio de áudio de notas',
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
          'WhatsApp para inserir notas',
          'Envio de fotos de notas',
          'Envio de áudio de notas',
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
          'WhatsApp para inserir notas',
          'Envio de fotos de notas',
          'Envio de áudio de notas',
          'Exportação de dados',
          'Suporte prioritário',
        ],
        notIncluded: [],
        popular: true,
        gradient: 'from-purple-500 to-purple-600',
        uploadLimit: 1024,
      },
    ];
  }

  async upgradePlan(request: PlanUpgradeRequest): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/plans/upgrade`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request),
    // });

    throw new Error('Not implemented');
  }

  async downgradePlan(request: PlanUpgradeRequest): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/plans/downgrade`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request),
    // });

    throw new Error('Not implemented');
  }
}

export const planService = PlanService.getInstance();

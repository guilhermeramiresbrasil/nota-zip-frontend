export interface Plan {
  id: 'free' | 'basic' | 'premium' | 'shared';
  planUuid?: string; // UUID real do banco
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  notIncluded: string[];
  popular: boolean;
  gradient: string;
  uploadLimit: number; // em MB
}

export interface PlanComparison {
  feature: string;
  free: string;
  basic: string;
  premium: string;
}

export interface PlanUpgradeRequest {
  planId: 'free' | 'basic' | 'premium' | 'shared';
}

export interface CreatePaymentLinkRequest {
  userId: string;
  planId: string; // UUID do banco
  billingCycle: 'monthly' | 'yearly';
  paymentMethod?: 'credit_card' | 'pix';
}

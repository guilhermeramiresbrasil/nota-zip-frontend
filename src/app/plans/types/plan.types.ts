export interface Plan {
  id: 'free' | 'basic' | 'premium';
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
  planId: 'free' | 'basic' | 'premium';
}

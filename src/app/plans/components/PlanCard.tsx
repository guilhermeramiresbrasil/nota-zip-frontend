import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Star, ArrowRight, Users } from 'lucide-react';
import { Plan } from '../types/plan.types';

interface PlanCardProps {
  plan: Plan;
  currentPlan?: 'free' | 'basic' | 'premium' | 'shared';
  onUpgrade?: (planId: 'free' | 'basic' | 'premium' | 'shared') => void;
  isCurrentPlan?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onUpgrade,
  isCurrentPlan,
}) => {
  const hasBadge = plan.popular || plan.isShared;

  return (
    <div className={`relative flex flex-col h-full ${hasBadge ? 'pt-5' : ''}`}>
      {plan.popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
            <Star className="h-3 w-3 fill-current" />
            Mais Popular
          </div>
        </div>
      )}
      {plan.isShared && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
            <Users className="h-3 w-3" />
            2 pessoas
          </div>
        </div>
      )}

      <Card className={`flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        plan.popular ? 'border-2 border-blue-500 shadow-md' :
        plan.isShared ? 'border-2 border-rose-400 shadow-md' : 'border shadow-sm'
      }`}>
        {/* Header colorido */}
        <div className={`bg-gradient-to-br ${plan.gradient} px-5 py-4 text-white relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{plan.description}</p>
            <h3 className="text-xl font-bold mt-0.5">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-white/80 text-sm">{plan.period}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <CardContent className="flex-1 flex flex-col pt-4 pb-4 px-4">
          <ul className="space-y-2 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 leading-snug">{feature}</span>
              </li>
            ))}
            {plan.notIncluded.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <X className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 leading-snug">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full mt-4 font-semibold transition-all ${
              isCurrentPlan
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : plan.isShared
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
            onClick={() => onUpgrade?.(plan.id)}
          >
            {isCurrentPlan ? 'Plano Atual' : (
              <span className="flex items-center justify-center gap-1">
                {plan.isShared ? 'Compartilhar' : plan.id === 'free' ? 'Continuar grátis' : 'Assinar'}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

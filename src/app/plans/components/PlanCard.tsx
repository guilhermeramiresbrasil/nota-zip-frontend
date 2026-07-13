import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Star, ArrowRight } from 'lucide-react';
import { Plan } from '../types/plan.types';

interface PlanCardProps {
  plan: Plan;
  currentPlan?: 'free' | 'basic' | 'premium' | 'shared';
  onUpgrade?: (planId: 'free' | 'basic' | 'premium' | 'shared') => void;
  isCurrentPlan?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlan,
  onUpgrade,
  isCurrentPlan,
}) => {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      plan.popular ? 'border-2 border-blue-500 shadow-lg' : 'shadow-md'
    }`}>
      {plan.popular && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
            <Star className="h-4 w-4 fill-current" />
            Mais Popular
          </div>
        </div>
      )}
      <div className={`bg-gradient-to-br ${plan.gradient} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        <h3 className="text-2xl font-bold relative z-10">{plan.name}</h3>
        <p className="text-white/90 text-sm mt-2 relative z-10">
          {plan.description}
        </p>
        <div className="mt-6 flex items-baseline relative z-10">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-white/90 text-lg ml-2">{plan.period}</span>
        </div>
      </div>
      <CardContent className="pt-8 pb-6">
        <div className="space-y-5">
          <div>
            <h4 className="font-semibold mb-4 text-sm text-gray-900 uppercase tracking-wide">
              Incluído
            </h4>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">
                  Upload de {plan.uploadLimit === 0 ? '0 MB (não permitido)' : plan.uploadLimit >= 1024 ? `${(plan.uploadLimit / 1024).toFixed(0)} GB` : `${plan.uploadLimit} MB`}
                </span>
              </li>
            </ul>
          </div>

          {plan.notIncluded.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 text-sm text-gray-900 uppercase tracking-wide">
                Não incluído
              </h4>
              <ul className="space-y-3">
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                      <X className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            className={`w-full h-12 font-semibold text-base transition-all ${
              isCurrentPlan
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
            onClick={() => onUpgrade?.(plan.id)}
          >
            {isCurrentPlan ? 'Plano Atual' : (
              <>
                Escolher Plano <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

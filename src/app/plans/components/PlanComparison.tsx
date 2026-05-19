import React from 'react';
import { Plan } from '../types/plan.types';

interface PlanComparisonProps {
  plans: Plan[];
}

export const PlanComparison: React.FC<PlanComparisonProps> = ({ plans }) => {
  const allFeatures = Array.from(
    new Set(
      plans.flatMap((plan) => [...plan.features, ...plan.notIncluded])
    )
  ).sort();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-semibold">Recurso</th>
            {plans.map((plan) => (
              <th key={plan.id} className="p-4 font-semibold text-center">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature} className="border-b">
              <td className="p-4 text-sm">{feature}</td>
              {plans.map((plan) => {
                const isIncluded = plan.features.includes(feature);
                return (
                  <td key={plan.id} className="p-4 text-center">
                    {isIncluded ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

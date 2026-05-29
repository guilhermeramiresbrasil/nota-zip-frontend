import { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

interface WelcomeStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function WelcomeStep({ title, description, icon: Icon }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
          <Icon className="h-10 w-10 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Controle completo de suas finanças</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Relatórios detalhados e insights</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Notas e anotações financeiras</span>
        </div>
      </div>
    </div>
  );
}

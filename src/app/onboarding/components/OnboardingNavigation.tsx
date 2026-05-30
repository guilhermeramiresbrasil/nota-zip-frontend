import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isStepSkippable: boolean;
  isNextDisabled?: boolean;
  emailVerified?: boolean;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  isStepSkippable,
  isNextDisabled = false,
  emailVerified,
}: OnboardingNavigationProps) {
  return (
    <>
      <div className="flex gap-3 mt-8">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Voltar
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ${
            currentStep === 1 ? 'flex-1' : ''
          } ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {currentStep === 2 && emailVerified ? 'Próximo' : currentStep === 2 ? 'Verificar Email' : currentStep === totalSteps ? 'Concluir' : 'Próximo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {isStepSkippable && currentStep < totalSteps && (
        <div className="text-center mt-4">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Pular este passo
          </button>
        </div>
      )}
    </>
  );
}

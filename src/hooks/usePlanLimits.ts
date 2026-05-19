import { useAuth } from '@/contexts/AuthContext';

interface PlanLimits {
  maxIncomePerWeek: number;
  maxExpensePerWeek: number;
  canExport: boolean;
  canUseWhatsAppAudio: boolean;
  canUseWhatsAppPhoto: boolean;
  canUseWhatsApp: boolean;
}

export function usePlanLimits() {
  const { user } = useAuth();

  const getPlanLimits = (plan?: 'free' | 'basic' | 'premium'): PlanLimits => {
    switch (plan || 'free') {
      case 'free':
        return {
          maxIncomePerWeek: 1,
          maxExpensePerWeek: 5,
          canExport: false,
          canUseWhatsAppAudio: false,
          canUseWhatsAppPhoto: false,
          canUseWhatsApp: false,
        };
      case 'basic':
        return {
          maxIncomePerWeek: Infinity,
          maxExpensePerWeek: Infinity,
          canExport: false,
          canUseWhatsAppAudio: false,
          canUseWhatsAppPhoto: false,
          canUseWhatsApp: false,
        };
      case 'premium':
        return {
          maxIncomePerWeek: Infinity,
          maxExpensePerWeek: Infinity,
          canExport: true,
          canUseWhatsAppAudio: true,
          canUseWhatsAppPhoto: true,
          canUseWhatsApp: true,
        };
      default:
        return {
          maxIncomePerWeek: 1,
          maxExpensePerWeek: 5,
          canExport: false,
          canUseWhatsAppAudio: false,
          canUseWhatsAppPhoto: false,
          canUseWhatsApp: false,
        };
    }
  };

  const canAddTransaction = (type: 'income' | 'expense', weeklyCount: number): boolean => {
    const limits = getPlanLimits(user?.plan);
    if (type === 'income') {
      return weeklyCount < limits.maxIncomePerWeek;
    }
    return weeklyCount < limits.maxExpensePerWeek;
  };

  const canUpgrade = (currentPlan?: 'free' | 'basic' | 'premium'): boolean => {
    if (!currentPlan) return true;
    return currentPlan !== 'premium';
  };

  const canDowngrade = (currentPlan?: 'free' | 'basic' | 'premium'): boolean => {
    if (!currentPlan) return false;
    return currentPlan !== 'free';
  };

  const getNextPlan = (currentPlan?: 'free' | 'basic' | 'premium'): 'free' | 'basic' | 'premium' | null => {
    switch (currentPlan) {
      case 'free':
        return 'basic';
      case 'basic':
        return 'premium';
      case 'premium':
        return null;
      default:
        return 'basic';
    }
  };

  const getPreviousPlan = (currentPlan?: 'free' | 'basic' | 'premium'): 'free' | 'basic' | 'premium' | null => {
    switch (currentPlan) {
      case 'premium':
        return 'basic';
      case 'basic':
        return 'free';
      case 'free':
        return null;
      default:
        return 'free';
    }
  };

  return {
    limits: getPlanLimits(user?.plan),
    currentPlan: user?.plan || 'free',
    canAddTransaction,
    canUpgrade,
    canDowngrade,
    getNextPlan,
    getPreviousPlan,
  };
}

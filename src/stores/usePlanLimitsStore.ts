import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

interface PlanLimits {
  maxIncomePerWeek: number;
  maxExpensePerWeek: number;
  canExport: boolean;
  canUseWhatsAppAudio: boolean;
  canUseWhatsAppPhoto: boolean;
  canUseWhatsApp: boolean;
}

interface PlanLimitsState {
  limits: PlanLimits;
  currentPlan: 'free' | 'basic' | 'premium';
  getPlanLimits: (plan?: 'free' | 'basic' | 'premium') => PlanLimits;
  canAddTransaction: (type: 'income' | 'expense', weeklyCount: number) => boolean;
  canUpgrade: (currentPlan?: 'free' | 'basic' | 'premium') => boolean;
  canDowngrade: (currentPlan?: 'free' | 'basic' | 'premium') => boolean;
  getNextPlan: (currentPlan?: 'free' | 'basic' | 'premium') => 'free' | 'basic' | 'premium' | null;
  getPreviousPlan: (currentPlan?: 'free' | 'basic' | 'premium') => 'free' | 'basic' | 'premium' | null;
  refresh: () => void;
}

export const usePlanLimitsStore = create<PlanLimitsState>((set, get) => ({
  limits: {
    maxIncomePerWeek: 1,
    maxExpensePerWeek: 5,
    canExport: false,
    canUseWhatsAppAudio: false,
    canUseWhatsAppPhoto: false,
    canUseWhatsApp: false,
  },
  currentPlan: 'free',

  getPlanLimits: (plan?: 'free' | 'basic' | 'premium') => {
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
  },

  canAddTransaction: (type: 'income' | 'expense', weeklyCount: number) => {
    const limits = get().limits;
    if (type === 'income') {
      return weeklyCount < limits.maxIncomePerWeek;
    }
    return weeklyCount < limits.maxExpensePerWeek;
  },

  canUpgrade: (currentPlan?: 'free' | 'basic' | 'premium') => {
    if (!currentPlan) return true;
    return currentPlan !== 'premium';
  },

  canDowngrade: (currentPlan?: 'free' | 'basic' | 'premium') => {
    if (!currentPlan) return false;
    return currentPlan !== 'free';
  },

  getNextPlan: (currentPlan?: 'free' | 'basic' | 'premium') => {
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
  },

  getPreviousPlan: (currentPlan?: 'free' | 'basic' | 'premium') => {
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
  },

  refresh: () => {
    const user = useAuthStore.getState().user;
    const limits = get().getPlanLimits(user?.plan);
    set({
      limits,
      currentPlan: user?.plan || 'free',
    });
  },
}));

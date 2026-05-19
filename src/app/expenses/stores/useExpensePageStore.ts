import { create } from 'zustand';
import { TransactionType } from '@/app/home/types/dashboard.types';

interface ExpensePageState {
  isDialogOpen: boolean;
  transactionType: TransactionType;
  formData: {
    amount: string;
    category: string;
    description: string;
    date: string;
  };
  limitError: string;
  setDialogOpen: (open: boolean) => void;
  setTransactionType: (type: TransactionType) => void;
  setFormData: (data: Partial<ExpensePageState['formData']>) => void;
  setLimitError: (error: string) => void;
  resetForm: () => void;
}

export const useExpensePageStore = create<ExpensePageState>((set) => ({
  isDialogOpen: false,
  transactionType: 'expense',
  formData: {
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  },
  limitError: '',

  setDialogOpen: (open) => set({ isDialogOpen: open }),

  setTransactionType: (type) => set({ transactionType: type }),

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setLimitError: (error) => set({ limitError: error }),

  resetForm: () =>
    set({
      formData: {
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      },
      limitError: '',
    }),
}));

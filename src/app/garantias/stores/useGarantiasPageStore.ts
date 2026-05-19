import { create } from 'zustand';

interface GarantiasPageState {
  dialogOpen: boolean;
  searchQuery: string;
  selectedTag: string;
  formData: {
    nome: string;
    arquivo: File | null;
    dataExpiracao: string;
    tags: string[];
  };
  setDialogOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  setFormData: (data: Partial<GarantiasPageState['formData']>) => void;
  resetFormData: () => void;
}

export const useGarantiasPageStore = create<GarantiasPageState>((set) => ({
  dialogOpen: false,
  searchQuery: '',
  selectedTag: '',
  formData: {
    nome: '',
    arquivo: null,
    dataExpiracao: '',
    tags: [],
  },
  setDialogOpen: (open) => set({ dialogOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  resetFormData: () => set({
    formData: {
      nome: '',
      arquivo: null,
      dataExpiracao: '',
      tags: [],
    },
  }),
}));

import { create } from 'zustand';

interface AppState {
  selectedMonth: string | null;
  availableMonths: string[];
  setSelectedMonth: (month: string) => void;
  setAvailableMonths: (months: string[]) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedMonth: null,
  availableMonths: [],
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setAvailableMonths: (months) => set({ availableMonths: months }),
}));


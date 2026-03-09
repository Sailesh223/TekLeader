import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  email: string;
  displayName: string;
  isAdmin: boolean;
}

interface AppState {
  selectedMonth: string | null;
  availableMonths: string[];
  userInfo: UserInfo | null;
  setSelectedMonth: (month: string) => void;
  setAvailableMonths: (months: string[]) => void;
  setUserInfo: (user: UserInfo | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedMonth: null,
      availableMonths: [],
      userInfo: null,
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setAvailableMonths: (months) => set({ availableMonths: months }),
      setUserInfo: (user) => set({ userInfo: user }),
      logout: () => set({ userInfo: null, selectedMonth: null }),
    }),
    {
      name: 'tekleader-storage',
    }
  )
);


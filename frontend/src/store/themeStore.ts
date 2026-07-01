import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        set({ dark: !get().dark });
        get().apply();
      },
      apply: () => {
        document.documentElement.classList.toggle('dark', get().dark);
      },
    }),
    { name: 'rs-theme' }
  )
);

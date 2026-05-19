import { create } from 'zustand';
import { useEffect } from 'react';

const useDarkModeStore = create((set) => ({
  isDark: localStorage.getItem('darkMode') === 'true',
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      localStorage.setItem('darkMode', next);
      return { isDark: next };
    }),
}));

export function useDarkMode() {
  const { isDark, toggle } = useDarkModeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle };
}

export default useDarkMode;

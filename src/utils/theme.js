// Simple theme manager for class-based dark mode
const STORAGE_KEY = 'theme';

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getPreferredTheme = () => {
  const stored = getStoredTheme();
  if (stored === 'dark' || stored === 'light') return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const applyThemeClass = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const setTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  applyThemeClass(theme);
};

export const toggleTheme = () => {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  return next;
};

export const initTheme = () => {
  const theme = getPreferredTheme();
  applyThemeClass(theme);
};

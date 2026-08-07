import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';

import { loadCurrentUserPreferences, updateCurrentUserPreferences } from './util/backendClient';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(ThemeContext);

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  useEffect(() => {
    let isMounted = true;

    loadCurrentUserPreferences().then((preferences) => {
      if (!isMounted || !preferences?.themeMode) {
        return;
      }

      setMode(preferences.themeMode);
      localStorage.setItem('themeMode', preferences.themeMode);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      void updateCurrentUserPreferences({ themeMode: newMode });
      return newMode;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : '');
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

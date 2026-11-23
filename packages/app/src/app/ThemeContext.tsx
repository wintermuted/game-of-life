import React, { useState, useEffect } from 'react';
import { ThemeModeProvider, ThemeMode } from '@game-of-life/ui';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps): React.ReactElement {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode === 'dark' || savedMode === 'light' ? savedMode : 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : '');
  }, [mode]);

  return (
    <ThemeModeProvider mode={mode} toggleTheme={toggleTheme}>
      {children}
    </ThemeModeProvider>
  );
}

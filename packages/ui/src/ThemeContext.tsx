import { createContext, useContext, ReactElement, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export interface ThemeModeProviderProps extends ThemeContextType {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode(): ThemeContextType {
  return useContext(ThemeContext);
}

export function ThemeModeProvider({ children, mode, toggleTheme }: ThemeModeProviderProps): ReactElement {
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

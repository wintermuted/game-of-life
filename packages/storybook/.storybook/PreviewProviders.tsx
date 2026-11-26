import { ThemeModeProvider, type ThemeMode } from '@game-of-life/ui';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import instances from './i18n';

interface PreviewProvidersProps {
  children: ReactNode;
  mode: ThemeMode;
  locale: 'en' | 'es';
  applyDocumentTheme: boolean;
  toggleTheme: () => void;
}

export default function PreviewProviders({
  children,
  mode,
  locale,
  applyDocumentTheme,
  toggleTheme,
}: PreviewProvidersProps): ReactElement {
  useEffect(() => {
    if (!applyDocumentTheme) return;
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme');
    const previousLanguage = root.lang;
    root.setAttribute('data-theme', mode === 'dark' ? 'dark' : '');
    root.lang = locale;
    return () => {
      if (previousTheme === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', previousTheme);
      root.lang = previousLanguage;
    };
  }, [mode, locale, applyDocumentTheme]);

  return (
    <I18nextProvider i18n={instances[locale]}>
      <ThemeModeProvider mode={mode} toggleTheme={toggleTheme}>
        <div className="storybook-frame" data-theme={mode === 'dark' ? 'dark' : ''} lang={locale}>
          {children}
        </div>
      </ThemeModeProvider>
    </I18nextProvider>
  );
}

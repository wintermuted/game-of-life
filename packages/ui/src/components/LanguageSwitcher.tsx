import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@game-of-life/ui-staging';
import type { ReactElement } from 'react';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

interface LanguageSwitcherProps {
  className?: string;
  dropUp?: boolean;
}

function LanguageSwitcher({ className, dropUp = false }: LanguageSwitcherProps): ReactElement {
  const { i18n } = useTranslation();
  return (
    <LanguageSelector
      options={languages}
      value={i18n.language.startsWith('es') ? 'es' : 'en'}
      onChange={(value) => {
        void i18n.changeLanguage(value);
      }}
      label="Change language"
      variant={dropUp ? 'dropup' : 'native'}
      className={className || (dropUp ? '' : 'docs-topbar-version docs-topbar-language')}
    />
  );
}

export default LanguageSwitcher;

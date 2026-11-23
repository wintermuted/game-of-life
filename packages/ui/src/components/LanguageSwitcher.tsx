import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
];

interface LanguageSwitcherProps {
  className?: string;
  dropUp?: boolean;
}

function LanguageSwitcher({ className, dropUp = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const activeLanguage = i18n.language.startsWith('es') ? 'es' : 'en';
  const activeLanguageLabel = languages.find((language) => language.code === activeLanguage)?.name || 'English';

  function handleChange(languageCode: string) {
    i18n.changeLanguage(languageCode);
    setOpen(false);
  }

  useEffect(() => {
    if (!dropUp) return;

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropUp]);

  if (dropUp) {
    return (
      <div ref={wrapperRef} className={`language-switcher-dropup ${className || ''}`}>
        <button
          type="button"
          className="language-switcher-dropup-trigger"
          aria-label="Change language"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{activeLanguageLabel}</span>
          <span aria-hidden="true">▴</span>
        </button>
        {open && (
          <div className="language-switcher-dropup-menu" role="listbox" aria-label="Change language">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={activeLanguage === language.code}
                className={`language-switcher-dropup-option${activeLanguage === language.code ? ' is-active' : ''}`}
                onClick={() => handleChange(language.code)}
              >
                {language.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <select
      className={className || "docs-topbar-version docs-topbar-language"}
      aria-label="Change language"
      value={activeLanguage}
      onChange={(event) => handleChange(event.target.value)}
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSwitcher;

import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const activeLanguage = i18n.language.startsWith('es') ? 'es' : 'en';

  function handleChange(languageCode: string) {
    i18n.changeLanguage(languageCode);
  }

  return (
    <select
      className="docs-topbar-version docs-topbar-language"
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

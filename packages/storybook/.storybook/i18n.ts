import { createInstance, type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../app/src/i18n/locales/en';
import es from '../../app/src/i18n/locales/es';
import { en as controlsEn, es as controlsEs } from '../../app/src/i18n/locales/uiControls';

function createPreviewI18n(language: string): i18n {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    resources: {
      en: { translation: en, uiControls: controlsEn },
      es: { translation: es, uiControls: controlsEs },
    },
    lng: language,
    fallbackLng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}

const instances = {
  en: createPreviewI18n('en'),
  es: createPreviewI18n('es'),
};

export default instances;

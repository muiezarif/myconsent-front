import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en/translation.json';
import es from '@/locales/es/translation.json';
import pt from '@/locales/pt/translation.json';
import th from '@/locales/th/translation.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  pt: {
    translation: pt,
  },
  th: {
    translation: th,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ['cookie', 'localStorage', 'queryString', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
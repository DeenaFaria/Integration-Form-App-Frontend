import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import bnTranslation from './locales/bn/translation.json';

i18n
  .use(LanguageDetector) // Automatically detect language (optional)
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
      bn: {
        translation: bnTranslation,
      },
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;

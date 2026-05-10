import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import fr from './fr.js';
import ro from './ro.js';
import hu from './hu.js';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ro: { translation: ro },
    hu: { translation: hu },
  },
  lng: localStorage.getItem('cc_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

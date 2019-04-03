import en from './locales/en';
import zh from './locales/zh';
import flatten from 'flat';

// I18n.fallbacks = true;
// I18n.defaultLocale = 'en';
// I18n.locale = 'en';
//
const translations = {
  en: flatten(en),
  zh: flatten(zh),
};

export default function (key) {
  return translations.zh[key];
}

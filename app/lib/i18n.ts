import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';

import en from '@/locales/en/translation.json';

export const resources = {
  en: { translation: en },
} as const;

type SupportedLocale = keyof typeof resources;

export const supportedLocales = Object.keys(resources) as SupportedLocale[];

type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

const getClientLocale = () => {
  const userLanguage = 'userLanguage' in navigator ? navigator.userLanguage : null;

  return navigator.language ?? (userLanguage as string);
};

i18n.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  fallbackLng: defaultLocale,
  lng: getClientLocale(),
  resources,
  saveMissing: true,
  saveMissingTo: 'current',
  supportedLngs: supportedLocales,
});

z.setErrorMap(zodI18nMap);

export { default } from 'i18next';

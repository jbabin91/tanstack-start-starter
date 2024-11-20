import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/start';
import { getHeader } from 'vinxi/http';

import { defaultLocale, supportedLocales } from '@/lib/i18n';

export const getLocale = createServerFn({ method: 'GET' }).handler(() => {
  const header = getHeader('Accept-Language');
  const languages = header?.split(',') ?? [];

  return supportedLocales.find((lang) => languages.includes(lang)) ?? defaultLocale;
});

export const i18nQueryOptions = queryOptions({
  queryFn: () => getLocale(),
  queryKey: ['i18n'],
});

export function useI18nQuery() {
  return useSuspenseQuery(i18nQueryOptions);
}

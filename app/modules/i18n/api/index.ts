import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { lookup } from 'geoip';
import { getHeader } from 'vinxi/http';

import {
  defaultLocale,
  defaultTimeZone,
  detectLocale,
  type Messages,
  parseAcceptLanguage,
  type SupportedLocales,
  supportedLocalesSchema,
  type TimeZone,
} from '@/lib/i18n.ts';
import { logger } from '@/lib/logger.ts';
import { getVinxiSessionHelper } from '@/lib/session.ts';

export const getI18n = createServerFn({ method: 'GET' }).handler(async () => {
  logger.info('Getting i18n...');

  const session = await getVinxiSessionHelper();

  if (!session.data.locale) {
    const acceptLanguageHeader = getHeader('Accept-Language');
    const acceptLanguages = parseAcceptLanguage(acceptLanguageHeader);
    const locale = detectLocale(acceptLanguages) ?? defaultLocale;

    await session.update({ locale });
  }

  if (!session.data.timeZone) {
    const ip = getHeader('x-forwarded-for');
    const geo = await lookup(ip ?? '');
    const timeZone = geo?.timezone ?? defaultTimeZone;

    await session.update({ timeZone });
  }

  const messages = await import(`../../../messages/${session.data.locale}.ts`);

  return {
    locale: session.data.locale!,
    messages: messages.default as Messages,
    timeZone: session.data.timeZone as string,
  };
});

export const setLocale = createServerFn({ method: 'POST' })
  .validator(supportedLocalesSchema)
  .handler(async ({ data }) => {
    const session = await getVinxiSessionHelper();
    await session.update({ locale: data });
  });

export const setTimeZone = createServerFn({ method: 'POST' })
  .validator((timeZone: TimeZone) => timeZone as string)
  .handler(async ({ data }) => {
    const session = await getVinxiSessionHelper();
    await session.update({ timeZone: data });
  });

export const i18nQueryOptions = () =>
  queryOptions({
    queryFn: () => getI18n(),
    queryKey: ['i18n'],
  });

export function useI18nQuery() {
  return useSuspenseQuery(i18nQueryOptions());
}

export function useSetLocaleMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locale: SupportedLocales) => setLocale({ data: locale }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(i18nQueryOptions());
      await router.invalidate();
    },
  });
}

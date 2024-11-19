import { IntlProvider } from 'use-intl';

import { Toaster } from '@/components/ui/sonner.tsx';
import { useI18nQuery } from '@/modules/i18n';

import { ThemeProvider } from './theme-provider.tsx';

export function Providers({ children }: { children: React.ReactNode }) {
  const { data: i18n } = useI18nQuery();
  return (
    <IntlProvider {...i18n}>
      <ThemeProvider>
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </IntlProvider>
  );
}

import { useRouteContext } from '@tanstack/react-router';
import { I18nextProvider } from 'react-i18next';

import { Toaster } from '@/components/ui/sonner';
import i18n from '@/lib/i18n';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const { locale } = useRouteContext({ from: '__root__' });

  return (
    <I18nextProvider i18n={i18n.cloneInstance({ lng: locale })}>
      <ThemeProvider>
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </I18nextProvider>
  );
}

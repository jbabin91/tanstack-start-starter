import { Toaster } from '~/components/ui/sonner';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}

import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './SessionProvider';
import { NavigationProvider } from './NavigationProvider';
import { I18nProvider } from '../i18n/I18nProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <I18nProvider>
        <SessionProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </SessionProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

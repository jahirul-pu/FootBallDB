import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';
import { CommandPalette } from '@/components/navigation/command-palette';
import { MobileSidebar } from '@/components/navigation/mobile-sidebar';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          {/* Global singletons — rendered outside page content */}
          <CommandPalette />
          <MobileSidebar />
          <ToastProvider />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

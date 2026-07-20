import { type Metadata } from 'next';
import { RootProvider } from '@/providers/root-provider';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FootballDB',
    template: '%s | FootballDB',
  },
  description: 'The world-class football intelligence database.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

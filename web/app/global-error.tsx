'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorLayout } from '@/components/layout/error-layout';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <ErrorLayout error={error} reset={reset} />
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}

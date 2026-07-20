import Link from 'next/link';
import { type Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = { title: '403 — Access Denied' };

export default function ForbiddenPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
        <ShieldAlert className="text-destructive h-10 w-10" />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground/20 text-7xl font-black select-none">403</p>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You do not have the required permissions to view this page. Contact your administrator if
          you believe this is an error.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}

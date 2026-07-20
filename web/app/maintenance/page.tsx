import { type Metadata } from 'next';
import { Wrench } from 'lucide-react';

export const metadata: Metadata = { title: 'Maintenance — FootballDB' };

export default function MaintenancePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-warning/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
        <Wrench className="text-warning h-10 w-10" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Under Maintenance</h1>
        <p className="text-muted-foreground max-w-md">
          FootballDB is currently undergoing scheduled maintenance. We will be back shortly. Thank
          you for your patience.
        </p>
      </div>
      <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="bg-warning absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-warning relative inline-flex h-2 w-2 rounded-full" />
        </span>
        System currently offline
      </div>
    </div>
  );
}

import { type Metadata } from 'next';
import { ContentLayout } from '@/components/layout/content-layout';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <ContentLayout>
      <div className="text-muted-foreground rounded-md border border-dashed p-12 text-center">
        Dashboard — widgets will be implemented in the Dashboard module.
      </div>
    </ContentLayout>
  );
}

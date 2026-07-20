import { ProtectedLayout } from '@/components/layout/protected-layout';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { AppHeader } from '@/components/navigation/app-header';

/**
 * (protected) route group layout.
 * Enforces auth, wraps every authenticated page with Sidebar + Header.
 */
export default function ProtectedGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <DashboardLayout sidebar={<AppSidebar />} header={<AppHeader />}>
        {children}
      </DashboardLayout>
    </ProtectedLayout>
  );
}

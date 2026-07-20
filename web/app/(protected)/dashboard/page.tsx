import { type Metadata } from 'next';
import { ContentLayout } from '@/components/layout/content-layout';
import {
  PageHeader,
  MetricGrid,
  MetricTile,
  DashboardGrid,
  DashboardSection,
} from '@/components/dashboard';
import { Users, Building2, Shield, Swords } from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };

const MOCK_STATS = [
  {
    label: 'Total Persons',
    value: '48,291',
    icon: <Users className="h-5 w-5" />,
    trend: { value: '4.2%', direction: 'up' as const },
    accentColor: 'hsl(var(--primary))',
  },
  {
    label: 'Organizations',
    value: '1,084',
    icon: <Building2 className="h-5 w-5" />,
    trend: { value: '1.8%', direction: 'up' as const },
    accentColor: 'hsl(142 76% 36%)',
  },
  {
    label: 'Teams',
    value: '6,532',
    icon: <Shield className="h-5 w-5" />,
    trend: { value: '0.5%', direction: 'down' as const },
    accentColor: 'hsl(45 93% 47%)',
  },
  {
    label: 'Matches',
    value: '213,401',
    icon: <Swords className="h-5 w-5" />,
    trend: { value: '12.1%', direction: 'up' as const },
    accentColor: 'hsl(217 91% 60%)',
  },
];

export default function DashboardPage() {
  return (
    <ContentLayout containerSize="wide" noPadding>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to FootballDB — your global football intelligence platform."
      />
      <div className="space-y-6 px-6 py-6 md:px-8">
        <MetricGrid columns={4}>
          {MOCK_STATS.map((stat) => (
            <MetricTile key={stat.label} {...stat} />
          ))}
        </MetricGrid>

        <DashboardGrid columns={2}>
          <DashboardSection
            title="Recent Activity"
            description="Latest changes across all entities"
            isEmpty
            emptyTitle="No recent activity"
            emptyDescription="Activity will appear here as you use the platform."
          />
          <DashboardSection
            title="Quick Access"
            description="Frequently visited records"
            isEmpty
            emptyTitle="No quick access items"
            emptyDescription="Items will populate as you navigate the platform."
          />
        </DashboardGrid>
      </div>
    </ContentLayout>
  );
}

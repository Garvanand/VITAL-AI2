import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { FitnessDashboard } from '@/components/dashboard/fitness/fitness-dashboard';

export default function FitnessDashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Fitness Dashboard'} />
      <FitnessDashboard />
    </main>
  );
}

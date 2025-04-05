import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { ReactNode } from 'react';

export default function FitnessDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

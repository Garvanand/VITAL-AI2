import { Suspense } from 'react';
import { DashboardUsageCardGroup } from './components/dashboard-usage-card-group';
import { DashboardSubscriptionCardGroup } from './components/dashboard-subscription-card-group';
import { DashboardTutorialCard } from './components/dashboard-tutorial-card';
import { DashboardTeamMembersCard } from './components/dashboard-team-members-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Dumbbell, LineChart } from 'lucide-react';
import Link from 'next/link';

export function DashboardLandingPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <DashboardUsageCardGroup />
        </div>
        <div className="col-span-1">
          <DashboardTeamMembersCard />
        </div>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <DashboardSubscriptionCardGroup />
        </div>
        <div className="col-span-1">
          <DashboardTutorialCard />
        </div>
      </div>

      {/* Fitness Dashboard Card */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-1">
        <Link href="/dashboard/fitness">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Fitness Dashboard
                </CardTitle>
                <div className="bg-primary/10 text-primary rounded-full py-1 px-3 text-xs font-medium">New</div>
              </div>
              <CardDescription>Track your workout progress, body measurements, and fitness goals</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 px-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Workout Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Progress Analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Workout } from '@/utils/workout-api';
import { Dumbbell, Flame, Clock, Calendar } from 'lucide-react';

interface WorkoutMetricsCardProps {
  workouts: Workout[];
  isLoading: boolean;
}

export function WorkoutMetricsCard({ workouts, isLoading }: WorkoutMetricsCardProps) {
  // Calculate workout metrics
  const totalWorkouts = workouts?.length || 0;

  // Calculate total duration in minutes
  const totalDuration =
    workouts?.reduce((total, workout) => {
      return total + (workout.duration || 0);
    }, 0) || 0;

  // Calculate average duration per workout
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Calculate completed workouts in the last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentWorkouts =
    workouts?.filter((workout) => {
      const workoutDate = new Date(workout.created_at || '');
      return workoutDate >= last30Days && workout.is_completed;
    }) || [];

  const recentWorkoutsCount = recentWorkouts.length;

  // Calculate total volume (weight × reps across all exercises)
  const totalVolume =
    workouts?.reduce((volume, workout) => {
      return volume + (workout.total_volume || 0);
    }, 0) || 0;

  const metrics = [
    {
      title: 'Total Workouts',
      value: totalWorkouts.toString(),
      icon: <Dumbbell className="h-4 w-4 text-primary" />,
      description: 'All-time completed',
    },
    {
      title: 'Recent Workouts',
      value: recentWorkoutsCount.toString(),
      icon: <Calendar className="h-4 w-4 text-primary" />,
      description: 'Last 30 days',
    },
    {
      title: 'Avg. Duration',
      value: `${avgDuration} min`,
      icon: <Clock className="h-4 w-4 text-primary" />,
      description: 'Per workout',
    },
    {
      title: 'Total Volume',
      value: `${totalVolume.toLocaleString()} kg`,
      icon: <Flame className="h-4 w-4 text-primary" />,
      description: 'Weight × reps',
    },
  ];

  return (
    <>
      {metrics.map((metric) => (
        <Card key={metric.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

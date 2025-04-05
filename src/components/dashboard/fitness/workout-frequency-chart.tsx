'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Workout } from '@/utils/workout-api';
import { addDays, format, startOfWeek, subMonths } from 'date-fns';

interface WorkoutFrequencyChartProps {
  workouts: Workout[];
  isLoading: boolean;
}

export function WorkoutFrequencyChart({ workouts, isLoading }: WorkoutFrequencyChartProps) {
  // Generate chart data for weekly frequency
  const weeklyData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    // Get the last 12 weeks
    const today = new Date();
    const weeks: Record<string, { week: string; count: number; date: Date }> = {};

    // Initialize weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subMonths(today, i / 4));
      const weekLabel = format(weekStart, 'MMM d');
      weeks[weekLabel] = { week: weekLabel, count: 0, date: weekStart };
    }

    // Count workouts by week
    workouts.forEach((workout) => {
      if (!workout.created_at) return;

      const workoutDate = new Date(workout.created_at);
      const weekStart = startOfWeek(workoutDate);
      const weekLabel = format(weekStart, 'MMM d');

      // Only count workouts in the last 12 weeks
      if (weeks[weekLabel]) {
        weeks[weekLabel].count += 1;
      }
    });

    // Convert to array and sort by date
    return Object.values(weeks).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [workouts]);

  // Generate chart data for daily distribution
  const dailyData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    const days = [
      { name: 'Sun', count: 0 },
      { name: 'Mon', count: 0 },
      { name: 'Tue', count: 0 },
      { name: 'Wed', count: 0 },
      { name: 'Thu', count: 0 },
      { name: 'Fri', count: 0 },
      { name: 'Sat', count: 0 },
    ];

    // Count workouts by day of week
    workouts.forEach((workout) => {
      if (!workout.created_at) return;

      const workoutDate = new Date(workout.created_at);
      const dayOfWeek = workoutDate.getDay(); // 0 = Sunday, 6 = Saturday
      days[dayOfWeek].count += 1;
    });

    return days;
  }, [workouts]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (workouts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No workout data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Weekly Workout Frequency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => [`${value} workouts`, 'Frequency']}
              />
              <Legend />
              <Bar dataKey="count" name="Workout Frequency" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Daily Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => [`${value} workouts`, 'Count']}
              />
              <Legend />
              <Bar dataKey="count" name="Workout Count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

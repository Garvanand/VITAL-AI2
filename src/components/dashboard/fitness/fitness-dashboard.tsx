'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutMetricsCard } from './workout-metrics-card';
import { BodyMetricsCard } from './body-metrics-card';
import { ExerciseProgressChart } from './exercise-progress-chart';
import { WorkoutFrequencyChart } from './workout-frequency-chart';
import { useWorkout } from '@/components/workout/context/workout-context';
import { BodyMeasurement, Workout } from '@/utils/workout-api';
import { Dumbbell, LineChart, Scale, Calendar } from 'lucide-react';

export function FitnessDashboard() {
  const {
    workouts,
    workoutHistory,
    bodyMeasurements,
    fetchWorkouts,
    fetchWorkoutHistory,
    fetchBodyMeasurements,
    isLoadingWorkouts,
    isLoadingHistory,
  } = useWorkout();

  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchWorkouts(), fetchWorkoutHistory(), fetchBodyMeasurements()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchWorkouts, fetchWorkoutHistory, fetchBodyMeasurements]);

  useEffect(() => {
    // Sort and get recent workouts
    if (workouts && workouts.length > 0) {
      const sorted = [...workouts]
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 5);
      setRecentWorkouts(sorted);
    }

    // Sort and get recent measurements
    if (bodyMeasurements && bodyMeasurements.length > 0) {
      const sorted = [...bodyMeasurements]
        .sort((a, b) => new Date(b.measurement_date || '').getTime() - new Date(a.measurement_date || '').getTime())
        .slice(0, 5);
      setRecentMeasurements(sorted);
    }
  }, [workouts, bodyMeasurements]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <WorkoutMetricsCard workouts={workouts} isLoading={isLoading || isLoadingWorkouts} />
        <BodyMetricsCard measurements={bodyMeasurements} isLoading={isLoading} />
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Progress</span>
          </TabsTrigger>
          <TabsTrigger value="frequency" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Frequency</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>Exercise Progress</span>
                </CardTitle>
                <CardDescription>Track your strength progression over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ExerciseProgressChart workoutHistory={workoutHistory} isLoading={isLoading || isLoadingHistory} />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  <span>Body Measurements</span>
                </CardTitle>
                <CardDescription>Track your body changes over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  {/* Body measurements chart will go here */}
                  {recentMeasurements.length > 0 ? (
                    <p>Body measurements visualization coming soon</p>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No measurement data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Workout Frequency</span>
              </CardTitle>
              <CardDescription>See your workout consistency over time</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px]">
                <WorkoutFrequencyChart workouts={workouts} isLoading={isLoading || isLoadingWorkouts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

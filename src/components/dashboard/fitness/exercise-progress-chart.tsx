'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';

interface ExerciseProgressChartProps {
  workoutHistory: any[];
  isLoading: boolean;
}

export function ExerciseProgressChart({ workoutHistory, isLoading }: ExerciseProgressChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Extract unique exercises from workout history
  const exercises = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) return [];

    const exerciseSet = new Set<string>();

    workoutHistory.forEach((workout) => {
      if (workout.exercises) {
        workout.exercises.forEach((exercise: any) => {
          if (exercise.name) {
            exerciseSet.add(exercise.name);
          }
        });
      }
    });

    return Array.from(exerciseSet).sort();
  }, [workoutHistory]);

  // Set default exercise if none selected and exercises are available
  useMemo(() => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0 || !selectedExercise) return [];

    const exerciseData: Record<string, { date: string; weight: number; reps: number }> = {};

    workoutHistory.forEach((workout) => {
      const workoutDate = workout.created_at ? format(new Date(workout.created_at), 'MMM dd') : '';

      if (workout.exercises && workoutDate) {
        workout.exercises.forEach((exercise: any) => {
          if (exercise.name === selectedExercise && exercise.sets) {
            // Find the max weight for this exercise on this date
            let maxWeight = 0;
            let maxReps = 0;

            exercise.sets.forEach((set: any) => {
              if (!set.is_warmup && set.weight && set.weight > maxWeight) {
                maxWeight = set.weight;
                maxReps = set.reps || 0;
              }
            });

            if (maxWeight > 0) {
              exerciseData[workoutDate] = {
                date: workoutDate,
                weight: maxWeight,
                reps: maxReps,
              };
            }
          }
        });
      }
    });

    // Convert to array and sort by date
    return Object.values(exerciseData).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [workoutHistory, selectedExercise]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (exercises.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No exercise data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Select value={selectedExercise} onValueChange={setSelectedExercise}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an exercise" />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((exercise) => (
            <SelectItem key={exercise} value={exercise}>
              {exercise}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'Reps', angle: 90, position: 'insideRight', offset: -5, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="var(--chart-1)"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reps"
                name="Reps"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data for selected exercise</p>
          </div>
        )}
      </div>
    </div>
  );
}

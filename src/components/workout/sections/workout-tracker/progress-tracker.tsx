'use client';

import React, { useState } from 'react';
import { useWorkout } from '../../context/workout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import { BodyMeasurement } from '@/utils/workout-api';

export function ProgressTracker() {
  const {
    exerciseCategories = [],
    bodyMeasurements = [],
    workoutHistory = [],
    addBodyMeasurement,
    isLoadingBodyMeasurements,
  } = useWorkout();

  const [activeTab, setActiveTab] = useState('body');
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState('weight');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    measurement_type: 'weight',
    value: '',
    unit: 'kg',
  });

  // Calculate time periods for comparing progress
  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const threeMonthsAgo = subMonths(now, 3);

  // Track workout frequency data
  const workoutFrequencyData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: format(date, 'MMM dd'),
        workouts: 0,
      };
    });

    workoutHistory.forEach((workout) => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      if (workoutDate >= subMonths(now, 1)) {
        const dayIndex = Math.floor((workoutDate.getTime() - lastMonth.getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 30) {
          last30Days[dayIndex].workouts += 1;
        }
      }
    });

    return last30Days;
  }, [workoutHistory]);

  // Get exercise strength progress data
  const getExerciseProgressData = (exerciseId: string) => {
    const progressData: { date: string; weight: number }[] = [];

    workoutHistory.forEach((workout) => {
      if (workout.workout_exercises) {
        const matchingExercise = workout.workout_exercises.find((we) => we.exercise_id === exerciseId);

        if (matchingExercise && matchingExercise.sets && matchingExercise.sets.length > 0) {
          // Find the highest weight for this exercise
          const maxWeightSet = [...matchingExercise.sets].sort((a, b) => b.weight - a.weight)[0];

          progressData.push({
            date: format(new Date(workout.completed_at || workout.created_at), 'MMM dd'),
            weight: maxWeightSet.weight,
          });
        }
      }
    });

    return progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Format weight measurements with appropriate unit
  const formatWeightUnit = (value: number, unit = 'kg') => {
    return `${value} ${unit}`;
  };

  // Get body measurement data
  const getBodyMeasurementData = (type: string) => {
    const filteredMeasurements = bodyMeasurements
      .filter((m) => m.measurement_type === type)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return filteredMeasurements.map((m) => ({
      date: format(new Date(m.created_at), 'MMM dd'),
      value: m.value,
      unit: m.unit,
    }));
  };

  // Handle adding a new body measurement
  const handleAddMeasurement = async () => {
    if (!newMeasurement.value) return;

    await addBodyMeasurement({
      measurement_type: newMeasurement.measurement_type || 'weight',
      value: parseFloat(newMeasurement.value.toString()),
      unit: newMeasurement.unit || 'kg',
    });

    // Reset form and close dialog
    setNewMeasurement({
      measurement_type: 'weight',
      value: '',
      unit: 'kg',
    });
    setIsAddMeasurementOpen(false);
  };

  // Get all exercises from workout history
  const exercisesInHistory = React.useMemo(() => {
    const exercises = new Map();

    workoutHistory.forEach((workout) => {
      if (workout.workout_exercises) {
        workout.workout_exercises.forEach((we) => {
          if (we.exercise) {
            exercises.set(we.exercise.id, we.exercise);
          }
        });
      }
    });

    return Array.from(exercises.values());
  }, [workoutHistory]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="body">Body Measurements</TabsTrigger>
          <TabsTrigger value="exercise">Exercise Progress</TabsTrigger>
        </TabsList>

        {/* Body Measurements Tab */}
        <TabsContent value="body" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Body Measurements</h3>
              <p className="text-sm text-muted-foreground">Track your physical progress over time</p>
            </div>
            <Button onClick={() => setIsAddMeasurementOpen(true)} className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Add Measurement</span>
            </Button>
          </div>

          <Select value={selectedMeasurementType} onValueChange={setSelectedMeasurementType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Measurement Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="chest">Chest</SelectItem>
              <SelectItem value="waist">Waist</SelectItem>
              <SelectItem value="hips">Hips</SelectItem>
              <SelectItem value="biceps">Biceps</SelectItem>
              <SelectItem value="thighs">Thighs</SelectItem>
              <SelectItem value="body_fat">Body Fat %</SelectItem>
            </SelectContent>
          </Select>

          {isLoadingBodyMeasurements ? (
            <div className="text-center py-12">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <p className="mt-4 text-muted-foreground">Loading measurements...</p>
            </div>
          ) : getBodyMeasurementData(selectedMeasurementType).length > 0 ? (
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="h-64 w-full">
                <p className="text-center text-muted-foreground pt-24">Measurement chart would appear here</p>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  (Using recharts library in the real implementation)
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Measurements Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first {selectedMeasurementType.replace('_', ' ')} measurement to start tracking
              </p>
              <Button onClick={() => setIsAddMeasurementOpen(true)}>Add Measurement</Button>
            </div>
          )}

          {/* Summary Cards */}
          {getBodyMeasurementData(selectedMeasurementType).length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatWeightUnit(
                      getBodyMeasurementData(selectedMeasurementType)[
                        getBodyMeasurementData(selectedMeasurementType).length - 1
                      ].value,
                      getBodyMeasurementData(selectedMeasurementType)[
                        getBodyMeasurementData(selectedMeasurementType).length - 1
                      ].unit,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest measurement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Initial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatWeightUnit(
                      getBodyMeasurementData(selectedMeasurementType)[0].value,
                      getBodyMeasurementData(selectedMeasurementType)[0].unit,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">First recorded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Change</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const data = getBodyMeasurementData(selectedMeasurementType);
                    const change = data[data.length - 1].value - data[0].value;
                    const isPositive = change > 0;
                    const isNegative = change < 0;
                    return (
                      <>
                        <div
                          className={`text-2xl font-bold ${isPositive ? 'text-green-500' : ''} ${isNegative ? 'text-red-500' : ''}`}
                        >
                          {change > 0 ? '+' : ''}
                          {change.toFixed(1)} {data[0].unit}
                        </div>
                        <p className="text-xs text-muted-foreground">Total change</p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Exercise Progress Tab */}
        <TabsContent value="exercise" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Exercise Progress</h3>
            <p className="text-sm text-muted-foreground">Track your strength gains over time</p>
          </div>

          <Select value={selectedExercise || ''} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercisesInHistory.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedExercise ? (
            getExerciseProgressData(selectedExercise).length > 0 ? (
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="h-64 w-full">
                  <p className="text-center text-muted-foreground pt-24">Exercise progress chart would appear here</p>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    (Using recharts library in the real implementation)
                  </p>
                </div>

                {getExerciseProgressData(selectedExercise).length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Current Max</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatWeightUnit(
                            getExerciseProgressData(selectedExercise)[
                              getExerciseProgressData(selectedExercise).length - 1
                            ].weight,
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Latest workout</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Initial</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatWeightUnit(getExerciseProgressData(selectedExercise)[0].weight)}
                        </div>
                        <p className="text-xs text-muted-foreground">First recorded</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Strength Gain</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const data = getExerciseProgressData(selectedExercise);
                          const change = data[data.length - 1].weight - data[0].weight;
                          const percentChange = (change / data[0].weight) * 100;
                          return (
                            <>
                              <div className="text-2xl font-bold text-green-500">
                                +{change.toFixed(1)} kg
                                <span className="text-lg ml-1">({percentChange.toFixed(0)}%)</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Total improvement</p>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg mt-4">
                <h3 className="text-lg font-medium mb-2">No Progress Data</h3>
                <p className="text-muted-foreground mb-4">Complete workouts with this exercise to track progress</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-4">
              <h3 className="text-lg font-medium mb-2">Select an Exercise</h3>
              <p className="text-muted-foreground mb-4">Choose an exercise to view your progress</p>
            </div>
          )}

          {/* Workout Frequency */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Workout Frequency</h3>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="h-48 w-full">
                <p className="text-center text-muted-foreground pt-16">Workout frequency chart would appear here</p>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  (Using recharts library in the real implementation)
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Measurement Dialog */}
      <Dialog open={isAddMeasurementOpen} onOpenChange={setIsAddMeasurementOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Body Measurement</DialogTitle>
            <DialogDescription>Record a new body measurement to track your progress</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="measurement-type">
                Measurement Type
              </label>
              <Select
                value={newMeasurement.measurement_type || 'weight'}
                onValueChange={(value) => setNewMeasurement({ ...newMeasurement, measurement_type: value })}
              >
                <SelectTrigger id="measurement-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="waist">Waist</SelectItem>
                  <SelectItem value="hips">Hips</SelectItem>
                  <SelectItem value="biceps">Biceps</SelectItem>
                  <SelectItem value="thighs">Thighs</SelectItem>
                  <SelectItem value="body_fat">Body Fat %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="value">
                Value
              </label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={newMeasurement.value}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
                placeholder="Enter measurement value"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="unit">
                Unit
              </label>
              <Select
                value={newMeasurement.unit || 'kg'}
                onValueChange={(value) => setNewMeasurement({ ...newMeasurement, unit: value })}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMeasurementOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeasurement}>Add Measurement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

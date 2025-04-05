'use client';

import React, { useState, useEffect } from 'react';
import { useWorkout } from '../../context/workout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, Calendar, Clock, Info, Dumbbell } from 'lucide-react';
import { Workout } from '@/utils/workout-api';

export function WorkoutHistory() {
  const { workoutHistory = [], isLoadingWorkoutHistory } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredWorkouts = workoutHistory.filter(
    (workout) => workout && workout.name && workout.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate some workout statistics
  const totalWorkouts = workoutHistory.length;
  const thisMonthWorkouts = workoutHistory.filter((workout) => {
    const workoutDate = new Date(workout.completed_at || workout.created_at);
    const now = new Date();
    return workoutDate.getMonth() === now.getMonth() && workoutDate.getFullYear() === now.getFullYear();
  }).length;

  // Format workout duration in a human-readable way
  const formatDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 'N/A';

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // View workout details
  const viewWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsDetailsOpen(true);
  };

  // Ensure workout_exercises is an array
  const getExerciseCount = (workout: any) => {
    return workout && workout.workout_exercises ? workout.workout_exercises.length : 0;
  };

  return (
    <div className="space-y-6">
      {/* History Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthWorkouts}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Workout</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutHistory.length > 0 ? (
              <>
                <div className="text-lg font-medium line-clamp-1">{workoutHistory[0].name}</div>
                <p className="text-xs text-muted-foreground">
                  {workoutHistory[0].completed_at
                    ? format(new Date(workoutHistory[0].completed_at), 'MMM d, yyyy')
                    : 'N/A'}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No workouts yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Workout History List */}
      {isLoadingWorkoutHistory ? (
        <div className="text-center py-12">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading workout history...</p>
        </div>
      ) : filteredWorkouts.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-card border rounded-lg p-4 flex justify-between items-center hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => viewWorkoutDetails(workout)}
            >
              <div>
                <h3 className="font-medium">{workout.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {workout.completed_at && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(workout.completed_at), 'MMM d, yyyy')}
                    </p>
                  )}
                  {workout.start_time && workout.completed_at && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(workout.start_time, workout.completed_at)}
                    </p>
                  )}
                  {workout.workout_exercises && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Dumbbell size={14} />
                      {getExerciseCount(workout)} exercise{getExerciseCount(workout) !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground ml-2">
                <Info size={18} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No Workout History</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? `No workouts found matching "${searchTerm}"` : 'Complete your first workout to see it here'}
          </p>
        </div>
      )}

      {/* Workout Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name || 'Workout Details'}</DialogTitle>
          </DialogHeader>

          {selectedWorkout && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {selectedWorkout.completed_at
                      ? format(new Date(selectedWorkout.completed_at), 'MMM d, yyyy')
                      : 'Not completed'}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDuration(selectedWorkout.start_time, selectedWorkout.completed_at)}
                  </p>
                </div>
              </div>

              {selectedWorkout.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedWorkout.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-3">Exercises</h4>
                <div className="space-y-4">
                  {selectedWorkout.workout_exercises && selectedWorkout.workout_exercises.length > 0 ? (
                    selectedWorkout.workout_exercises.map((workoutExercise) => {
                      // Safely access nested properties
                      const exerciseName = workoutExercise?.exercise?.name || 'Unknown Exercise';
                      const muscleGroup = workoutExercise?.exercise?.muscle_group;
                      const sets = workoutExercise?.sets || [];

                      return (
                        <div key={workoutExercise.id} className="bg-muted/20 p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{exerciseName}</p>
                              {muscleGroup && (
                                <Badge variant="outline" className="mt-1 font-normal text-xs">
                                  {muscleGroup}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sets.length} set{sets.length !== 1 ? 's' : ''}
                            </p>
                          </div>

                          {sets.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              <div className="text-muted-foreground">Set</div>
                              <div className="text-muted-foreground">Weight</div>
                              <div className="text-muted-foreground">Reps</div>
                              {sets.map((set, idx) => (
                                <React.Fragment key={set.id || idx}>
                                  <div>{idx + 1}</div>
                                  <div>{set.weight || 0} kg</div>
                                  <div>{set.reps || 0}</div>
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground">No exercises recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

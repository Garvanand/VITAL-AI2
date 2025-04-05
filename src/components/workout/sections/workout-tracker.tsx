'use client';

import { useState } from 'react';
import { useWorkout } from '../context/workout-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistance, format } from 'date-fns';
import {
  PlusCircle,
  Dumbbell,
  Calendar,
  BarChart2,
  ClipboardList,
  Trash2,
  Play,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { WorkoutDetails } from './workout-tracker/workout-details';
import { ExerciseLibrary } from './workout-tracker/exercise-library';
import { WorkoutHistory } from './workout-tracker/workout-history';
import { ProgressTracker } from './workout-tracker/progress-tracker';

export function WorkoutTracker() {
  const {
    workouts = [],
    activeWorkout,
    setActiveWorkout,
    createWorkout,
    deleteWorkout,
    fetchWorkoutById,
    completeWorkout,
    updateWorkout,
  } = useWorkout();

  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutNotes, setNewWorkoutNotes] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('workouts');

  // Handle creating a new workout
  const handleCreateWorkout = async () => {
    if (!newWorkoutName) return;

    await createWorkout({
      name: newWorkoutName,
      notes: newWorkoutNotes,
    });

    // Reset form and close dialog
    setNewWorkoutName('');
    setNewWorkoutNotes('');
    setIsCreateDialogOpen(false);
  };

  // Start a workout
  const handleStartWorkout = async (workoutId: string) => {
    const workout = await fetchWorkoutById(workoutId);

    if (workout) {
      // Only update start time if the workout hasn't been started yet
      if (!workout.start_time) {
        updateWorkout(workoutId, { start_time: new Date().toISOString() });
      }

      setActiveWorkout(workout);
      setActiveTab('active');
    }
  };

  // Complete the current workout
  const handleCompleteWorkout = async () => {
    if (activeWorkout) {
      await completeWorkout(activeWorkout.id);
      setActiveWorkout(null);
      setActiveTab('history');
    }
  };

  // Delete a workout
  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(workoutId);
    }
  };

  return (
    <div className="bg-background rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
          Workout Tracker
        </h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>New Workout</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workout</DialogTitle>
              <DialogDescription>Give your workout a name and optional notes to get started.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Workout Name
                </label>
                <Input
                  id="name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g., Upper Body Strength"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="notes">
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  value={newWorkoutNotes}
                  onChange={(e) => setNewWorkoutNotes(e.target.value)}
                  placeholder="Add any details about this workout..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkout}>Create Workout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="workouts" className="flex items-center gap-2 py-2">
            <ClipboardList size={16} />
            <span className="hidden sm:inline">My Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2 py-2" disabled={!activeWorkout}>
            <Play size={16} />
            <span className="hidden sm:inline">Active Workout</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-2">
            <Calendar size={16} />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2 py-2">
            <BarChart2 size={16} />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
        </TabsList>

        {/* My Workouts Tab */}
        <TabsContent value="workouts" className="space-y-4">
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Workouts Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first workout to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create Workout</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <CardDescription>
                          {workout.exercises_count} exercises
                          {workout.is_completed && ' • Completed'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {workout.notes && <p className="text-sm text-muted-foreground">{workout.notes}</p>}
                    {workout.created_at && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Created: {format(new Date(workout.created_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleStartWorkout(workout.id)}
                      variant="secondary"
                      className="w-full"
                      disabled={workout.is_completed}
                    >
                      {workout.is_completed ? 'Completed' : 'Start Workout'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Workout Tab */}
        <TabsContent value="active">
          {activeWorkout ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{activeWorkout.name}</h3>
                  {activeWorkout.start_time && (
                    <p className="text-sm text-muted-foreground">
                      Started {formatDistance(new Date(activeWorkout.start_time), new Date(), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <Button onClick={handleCompleteWorkout} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle size={16} className="mr-2" />
                  Complete Workout
                </Button>
              </div>

              <WorkoutDetails workout={activeWorkout} />
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Workout</h3>
              <p className="text-muted-foreground mb-4">Start a workout to track your progress</p>
              <Button onClick={() => setActiveTab('workouts')}>Go to My Workouts</Button>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <WorkoutHistory />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <ProgressTracker />
        </TabsContent>
      </Tabs>

      {/* Exercise Library */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Exercise Library</h3>
        <ExerciseLibrary />
      </div>
    </div>
  );
}

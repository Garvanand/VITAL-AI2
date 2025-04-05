'use client';

import { useState } from 'react';
import { useWorkout } from '../../context/workout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Workout, Exercise, ExerciseSet } from '@/utils/workout-api';
import { PlusCircle, Trash2, Edit, Plus } from 'lucide-react';

interface WorkoutDetailsProps {
  workout: Workout;
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const {
    exercises = [],
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    updateSet,
    deleteSet,
  } = useWorkout();

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSet, setNewSet] = useState<Partial<ExerciseSet>>({
    weight: '',
    reps: '',
    notes: '',
  });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Filter exercises based on search term
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Add an exercise to workout
  const handleAddExerciseToWorkout = async (exerciseId: string) => {
    await addExerciseToWorkout(workout.id, exerciseId);
    setIsAddExerciseOpen(false);
  };

  // Remove an exercise from workout
  const handleRemoveExercise = async (exerciseId: string) => {
    if (confirm('Are you sure you want to remove this exercise?')) {
      await removeExerciseFromWorkout(workout.id, exerciseId);
    }
  };

  // Add a new set to an exercise
  const handleAddSet = async (exerciseId: string) => {
    if (newSet.weight === '' && newSet.reps === '') return;

    const workoutExercise = workout.workout_exercises?.find((we) => we.exercise_id === exerciseId);
    if (!workoutExercise) return;

    await addSetToExercise(workoutExercise.id, {
      weight: newSet.weight ? parseFloat(newSet.weight.toString()) : 0,
      reps: newSet.reps ? parseInt(newSet.reps.toString()) : 0,
      notes: newSet.notes || '',
    });

    // Reset the form
    setNewSet({
      weight: '',
      reps: '',
      notes: '',
    });

    setEditingExerciseId(null);
  };

  // Delete a set
  const handleDeleteSet = async (exerciseId: string, setId: string) => {
    if (confirm('Are you sure you want to delete this set?')) {
      await deleteSet(setId);
    }
  };

  // Make sure workoutExercise.sets is always an array
  const getSafeSets = (workoutExercise: any) => {
    return workoutExercise && workoutExercise.sets ? workoutExercise.sets : [];
  };

  return (
    <div className="space-y-6">
      {/* Exercise List */}
      {workout && workout.workout_exercises && workout.workout_exercises.length > 0 ? (
        <div className="space-y-6">
          {workout.workout_exercises.map((workoutExercise) => {
            const isEditing = editingExerciseId === workoutExercise.exercise_id;
            const exercise = exercises.find((e) => e.id === workoutExercise.exercise_id);

            if (!exercise) return null;

            const sets = getSafeSets(workoutExercise);

            return (
              <Card key={workoutExercise.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {exercise.name}
                        {exercise.muscle_group && (
                          <Badge variant="outline" className="font-normal text-xs">
                            {exercise.muscle_group}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveExercise(exercise.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Set</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead className="hidden md:table-cell">Notes</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sets.length > 0 ? (
                          sets.map((set, index) => (
                            <TableRow key={set.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{set.weight} kg</TableCell>
                              <TableCell>{set.reps}</TableCell>
                              <TableCell className="hidden md:table-cell">{set.notes}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive h-8 w-8"
                                  onClick={() => handleDeleteSet(exercise.id, set.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                              No sets recorded yet
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Add Set Form */}
                        {isEditing && (
                          <TableRow className="bg-muted/30">
                            <TableCell className="font-medium">{sets.length + 1}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={newSet.weight}
                                onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })}
                                placeholder="Weight (kg)"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={newSet.reps}
                                onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })}
                                placeholder="Reps"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Input
                                value={newSet.notes}
                                onChange={(e) => setNewSet({ ...newSet, notes: e.target.value })}
                                placeholder="Notes"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handleAddSet(exercise.id)} className="h-8">
                                Save
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Add Set Button */}
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setEditingExerciseId(exercise.id)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Set
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No Exercises Added</h3>
          <p className="text-muted-foreground mb-4">Add exercises to your workout to get started</p>
          <Button onClick={() => setIsAddExerciseOpen(true)}>Add Exercises</Button>
        </div>
      )}

      {/* Add Exercise Button */}
      <div className="flex justify-center">
        <Button variant="outline" className="mt-4 flex items-center gap-2" onClick={() => setIsAddExerciseOpen(true)}>
          <PlusCircle size={16} />
          <span>Add Exercise</span>
        </Button>
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>Search and select exercises to add to your workout.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleAddExerciseToWorkout(exercise.id)}
                  >
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      {exercise.muscle_group && (
                        <p className="text-sm text-muted-foreground">{exercise.muscle_group}</p>
                      )}
                    </div>
                    <PlusCircle size={18} className="text-primary" />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No exercises found matching "{searchTerm}"</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExerciseOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

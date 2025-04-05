'use client';

import { useState } from 'react';
import { useWorkout } from '../../context/workout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Exercise, ExerciseCategory } from '@/utils/workout-api';
import { PlusCircle, Search, Info, Edit, Trash2 } from 'lucide-react';

export function ExerciseLibrary() {
  const {
    exercises = [],
    exerciseCategories = [],
    createExercise,
    updateExercise,
    deleteExercise,
    isLoadingExercises,
  } = useWorkout();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter exercises based on search term and selected category
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      searchTerm === '' ||
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === null || exercise.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle creating a new exercise
  const handleCreateExercise = async () => {
    if (!currentExercise?.name || !currentExercise.category_id) return;

    await createExercise({
      name: currentExercise.name,
      description: currentExercise.description || '',
      instructions: currentExercise.instructions || '',
      category_id: currentExercise.category_id,
      muscle_group: currentExercise.muscle_group || '',
      image_url: currentExercise.image_url || '',
    });

    // Reset and close dialog
    setCurrentExercise(null);
    setIsCreateDialogOpen(false);
  };

  // Handle updating an exercise
  const handleUpdateExercise = async () => {
    if (!currentExercise?.id || !currentExercise.name) return;

    await updateExercise(currentExercise.id, {
      name: currentExercise.name,
      description: currentExercise.description || '',
      instructions: currentExercise.instructions || '',
      category_id: currentExercise.category_id || '',
      muscle_group: currentExercise.muscle_group || '',
      image_url: currentExercise.image_url || '',
    });

    // Reset and close dialog
    setCurrentExercise(null);
    setIsEditDialogOpen(false);
  };

  // Handle deleting an exercise
  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      await deleteExercise(exerciseId);
    }
  };

  // Open view dialog with exercise details
  const openViewDialog = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setIsViewDialogOpen(true);
  };

  // Open edit dialog with exercise details
  const openEditDialog = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {exerciseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setCurrentExercise({});
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>New Exercise</span>
        </Button>
      </div>

      {/* Exercise Grid */}
      {isLoadingExercises ? (
        <div className="text-center py-12">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading exercises...</p>
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const category = exerciseCategories.find((c) => c.id === exercise.category_id);

            return (
              <Card key={exercise.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => openViewDialog(exercise)}
                      >
                        <Info size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => openEditDialog(exercise)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {category && <Badge variant="secondary">{category.name}</Badge>}
                    {exercise.muscle_group && <Badge variant="outline">{exercise.muscle_group}</Badge>}
                  </div>
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No Exercises Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory
              ? 'Try changing your search or filter'
              : 'Add your first exercise to get started'}
          </p>
          <Button
            onClick={() => {
              setCurrentExercise({});
              setIsCreateDialogOpen(true);
            }}
          >
            Add Exercise
          </Button>
        </div>
      )}

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exercise</DialogTitle>
            <DialogDescription>Add a new exercise to your library</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                Exercise Name*
              </label>
              <Input
                id="name"
                value={currentExercise?.name || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                placeholder="e.g., Bench Press"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="category">
                Category*
              </label>
              <Select
                value={currentExercise?.category_id || ''}
                onValueChange={(value) => setCurrentExercise({ ...currentExercise, category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="muscle-group">
                Muscle Group
              </label>
              <Input
                id="muscle-group"
                value={currentExercise?.muscle_group || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, muscle_group: e.target.value })}
                placeholder="e.g., Chest, Triceps"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Textarea
                id="description"
                value={currentExercise?.description || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                placeholder="Brief description of the exercise..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="instructions">
                Instructions
              </label>
              <Textarea
                id="instructions"
                value={currentExercise?.instructions || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, instructions: e.target.value })}
                placeholder="Step-by-step instructions..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="image">
                Image URL (optional)
              </label>
              <Input
                id="image"
                value={currentExercise?.image_url || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExercise}>Create Exercise</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exercise Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentExercise?.name}</DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentExercise?.category_id && (
                <Badge variant="secondary">
                  {exerciseCategories.find((c) => c.id === currentExercise.category_id)?.name}
                </Badge>
              )}
              {currentExercise?.muscle_group && <Badge variant="outline">{currentExercise.muscle_group}</Badge>}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {currentExercise?.image_url && (
              <div className="rounded-md overflow-hidden">
                <img src={currentExercise.image_url} alt={currentExercise.name} className="w-full h-48 object-cover" />
              </div>
            )}

            {currentExercise?.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{currentExercise.description}</p>
              </div>
            )}

            {currentExercise?.instructions && (
              <div>
                <h4 className="text-sm font-medium mb-1">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{currentExercise.instructions}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(currentExercise as Exercise);
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update the details of this exercise</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-name">
                Exercise Name*
              </label>
              <Input
                id="edit-name"
                value={currentExercise?.name || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-category">
                Category*
              </label>
              <Select
                value={currentExercise?.category_id || ''}
                onValueChange={(value) => setCurrentExercise({ ...currentExercise, category_id: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-muscle-group">
                Muscle Group
              </label>
              <Input
                id="edit-muscle-group"
                value={currentExercise?.muscle_group || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, muscle_group: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-description">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={currentExercise?.description || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-instructions">
                Instructions
              </label>
              <Textarea
                id="edit-instructions"
                value={currentExercise?.instructions || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, instructions: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="edit-image">
                Image URL (optional)
              </label>
              <Input
                id="edit-image"
                value={currentExercise?.image_url || ''}
                onChange={(e) => setCurrentExercise({ ...currentExercise, image_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExercise}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

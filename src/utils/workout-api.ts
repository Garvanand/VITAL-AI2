import { createClient } from '@/utils/supabase/client';

// Types
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  primary_muscles?: string[];
  secondary_muscles?: string[];
  instructions?: string;
  image_url?: string;
  video_url?: string;
  is_default: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  notes?: string;
  duration?: number;
  is_completed: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
  total_volume?: number; // Calculated field
  exercises_count?: number; // Calculated field
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise; // For joined data
  order_index: number;
  notes?: string;
  sets?: ExerciseSet[]; // For joined data
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  is_completed: boolean;
  is_warmup: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  weight?: number;
  body_fat?: number;
  measurement_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API Functions
/**
 * Get all exercise categories
 */
export async function getExerciseCategories(): Promise<ExerciseCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('exercise_categories').select('*').order('name');

  if (error) {
    console.error('Error fetching exercise categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get exercises with optional filtering
 */
export async function getExercises(categoryId?: string, searchTerm?: string): Promise<Exercise[]> {
  const supabase = createClient();
  let query = supabase.from('exercises').select(`
      *,
      exercise_categories!inner (
        id,
        name
      )
    `);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }

  // Format the data to include category_name
  return (data || []).map((exercise) => ({
    ...exercise,
    category_name: exercise.exercise_categories?.name,
    exercise_categories: undefined,
  }));
}

/**
 * Get a specific exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_categories (
        id,
        name
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching exercise with ID ${id}:`, error);
    return null;
  }

  return data
    ? {
        ...data,
        category_name: data.exercise_categories?.name,
        exercise_categories: undefined,
      }
    : null;
}

/**
 * Create a new exercise
 */
export async function createExercise(
  exercise: Omit<Exercise, 'id' | 'is_default' | 'created_at' | 'updated_at'>,
): Promise<Exercise | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...exercise,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing exercise
 */
export async function updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('exercises').update(exercise).eq('id', id).select().single();

  if (error) {
    console.error(`Error updating exercise with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Delete an exercise
 */
export async function deleteExercise(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('exercises').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting exercise with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get all workouts for the current user
 */
export async function getWorkouts(): Promise<Workout[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      *,
      workout_exercises (
        id
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }

  // Add exercises_count to each workout
  return (data || []).map((workout) => ({
    ...workout,
    exercises_count: workout.workout_exercises?.length || 0,
    workout_exercises: undefined,
  }));
}

/**
 * Get a specific workout by ID with all exercises and sets
 */
export async function getWorkoutById(id: string): Promise<Workout | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      *
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching workout with ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  // Get all exercises for this workout
  const { data: workoutExercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select(
      `
      *,
      exercises (
        *,
        exercise_categories (
          id,
          name
        )
      )
    `,
    )
    .eq('workout_id', id)
    .order('order_index');

  if (exercisesError) {
    console.error(`Error fetching exercises for workout with ID ${id}:`, exercisesError);
    return data;
  }

  // Format exercise data
  const formattedExercises = (workoutExercises || []).map((we) => ({
    ...we,
    exercise: we.exercises
      ? {
          ...we.exercises,
          category_name: we.exercises.exercise_categories?.name,
          exercise_categories: undefined,
        }
      : undefined,
    exercises: undefined,
  }));

  // Get all sets for all exercises
  const exerciseIds = formattedExercises.map((we) => we.id);
  if (exerciseIds.length > 0) {
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_exercise_id', exerciseIds)
      .order('set_number');

    if (setsError) {
      console.error(`Error fetching sets for workout with ID ${id}:`, setsError);
    } else {
      // Organize sets by workout_exercise_id
      const setsByExercise: Record<string, ExerciseSet[]> = {};
      (sets || []).forEach((set) => {
        if (!setsByExercise[set.workout_exercise_id]) {
          setsByExercise[set.workout_exercise_id] = [];
        }
        setsByExercise[set.workout_exercise_id].push(set);
      });

      // Add sets to each exercise
      formattedExercises.forEach((exercise) => {
        exercise.sets = setsByExercise[exercise.id] || [];
      });
    }
  }

  // Calculate total volume (weight * reps across all sets)
  let totalVolume = 0;
  formattedExercises.forEach((exercise) => {
    (exercise.sets || []).forEach((set) => {
      if (set.weight && set.reps && !set.is_warmup) {
        totalVolume += set.weight * set.reps;
      }
    });
  });

  // Return the workout with exercises and sets
  return {
    ...data,
    workout_exercises: formattedExercises,
    exercises_count: formattedExercises.length,
    total_volume: totalVolume,
  } as Workout;
}

/**
 * Create a new workout
 */
export async function createWorkout(
  workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
): Promise<Workout | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('workouts').insert(workout).select().single();

  if (error) {
    console.error('Error creating workout:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing workout
 */
export async function updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('workouts').update(workout).eq('id', id).select().single();

  if (error) {
    console.error(`Error updating workout with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Delete a workout
 */
export async function deleteWorkout(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('workouts').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting workout with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Add an exercise to a workout
 */
export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  orderIndex: number,
): Promise<WorkoutExercise | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error(`Error adding exercise to workout with ID ${workoutId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Remove an exercise from a workout
 */
export async function removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId);

  if (error) {
    console.error(`Error removing exercise with ID ${workoutExerciseId} from workout:`, error);
    throw error;
  }
}

/**
 * Add a set to an exercise
 */
export const addSetToExercise = async (
  workoutExerciseId: string,
  set: {
    weight?: number;
    reps?: number;
    notes?: string;
    is_completed?: boolean;
    is_warmup?: boolean;
  },
): Promise<ExerciseSet | null> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('exercise_sets')
      .insert({
        workout_exercise_id: workoutExerciseId,
        ...set,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding set to exercise:', error);
    return null;
  }
};

/**
 * Update a set
 */
export async function updateSet(id: string, set: Partial<ExerciseSet>): Promise<ExerciseSet | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('exercise_sets').update(set).eq('id', id).select().single();

  if (error) {
    console.error(`Error updating set with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Delete a set
 */
export async function deleteSet(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('exercise_sets').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting set with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get body measurements for the current user
 */
export async function getBodyMeasurements(): Promise<BodyMeasurement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .order('measurement_date', { ascending: false });

  if (error) {
    console.error('Error fetching body measurements:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a body measurement
 */
export async function addBodyMeasurement(
  measurement: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
): Promise<BodyMeasurement | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('body_measurements').insert(measurement).select().single();

  if (error) {
    console.error('Error adding body measurement:', error);
    throw error;
  }

  return data;
}

/**
 * Get workout history data for progress tracking
 */
export async function getWorkoutHistory(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      id,
      name,
      is_completed,
      created_at,
      start_time,
      end_time,
      workout_exercises (
        id,
        exercise_id,
        exercises (
          id,
          name,
          category_id
        ),
        exercise_sets (
          id,
          weight,
          reps,
          is_warmup
        )
      )
    `,
    )
    .eq('is_completed', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workout history:', error);
    throw error;
  }

  // Process data to calculate volume, max weight, etc.
  return (data || []).map((workout) => {
    let totalVolume = 0;
    const exerciseData: Record<
      string,
      {
        maxWeight: number;
        totalSets: number;
        totalReps: number;
        totalVolume: number;
      }
    > = {};

    (workout.workout_exercises || []).forEach((we) => {
      if (!we.exercises) return;

      const exerciseId = we.exercise_id;
      if (!exerciseData[exerciseId]) {
        exerciseData[exerciseId] = {
          maxWeight: 0,
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
        };
      }

      (we.exercise_sets || []).forEach((set) => {
        if (set.is_warmup) return;

        if (set.weight && set.reps) {
          const volume = set.weight * set.reps;
          totalVolume += volume;
          exerciseData[exerciseId].totalVolume += volume;
          exerciseData[exerciseId].totalReps += set.reps;
          exerciseData[exerciseId].totalSets += 1;

          if (set.weight > exerciseData[exerciseId].maxWeight) {
            exerciseData[exerciseId].maxWeight = set.weight;
          }
        }
      });
    });

    return {
      id: workout.id,
      name: workout.name,
      date: workout.start_time || workout.created_at,
      totalVolume,
      exerciseData,
    };
  });
}

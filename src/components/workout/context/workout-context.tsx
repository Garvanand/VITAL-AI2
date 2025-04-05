'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Workout,
  Exercise,
  WorkoutExercise,
  ExerciseSet,
  BodyMeasurement,
  getWorkouts,
  getExercises,
  getExerciseCategories,
  getBodyMeasurements,
  getWorkoutHistory,
} from '@/utils/workout-api';

// Types
interface WorkoutContextType {
  // User preferences
  userPreferences: {
    fitnessLevel: string;
    workoutDuration: number;
    workoutFrequency: number;
    fitnessGoals: string[];
    availableEquipment: string[];
  };
  updateUserPreferences: (preferences: Partial<WorkoutContextType['userPreferences']>) => void;

  // Workout data
  workoutSuggestions: any[];
  isLoadingWorkouts: boolean;

  // Fasting data
  fastingSchedule: {
    active: boolean;
    startTime: string | null;
    endTime: string | null;
    targetHours: number;
  };
  updateFastingSchedule: (schedule: Partial<WorkoutContextType['fastingSchedule']>) => void;

  // Water intake
  waterIntake: {
    goal: number; // in ml
    current: number;
    unit: 'ml' | 'oz';
    history: Array<{ timestamp: string; amount: number }>;
  };
  addWaterIntake: (amount: number) => void;
  updateWaterGoal: (goal: number) => void;

  // Macros
  macros: {
    goal: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    current: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    history: Array<{
      timestamp: string;
      food: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  };
  addFoodEntry: (entry: { food: string; calories: number; protein: number; carbs: number; fat: number }) => void;

  // Google Fit
  googleFit: {
    connected: boolean;
    steps: number;
    calories: number;
    activeMinutes: number;
  };
  connectGoogleFit: () => Promise<void>;
  disconnectGoogleFit: () => void;

  // Heart health
  heartHealth: {
    lastAssessment: string | null;
    heartRate: number | null;
    bloodPressure: { systolic: number | null; diastolic: number | null };
    stressLevel: number | null;
    sleepHours: number | null;
  };
  updateHeartHealth: (data: Partial<WorkoutContextType['heartHealth']>) => void;

  // Workout Tracking (New)
  workouts: Workout[];
  activeWorkout: Workout | null;
  exercises: Exercise[];
  bodyMeasurements: BodyMeasurement[];
  workoutHistory: any[];
  isLoadingExercises: boolean;
  isLoadingActive: boolean;
  isLoadingHistory: boolean;

  // Workout Tracking Actions
  fetchWorkouts: () => Promise<void>;
  fetchExercises: (categoryId?: string, searchTerm?: string) => Promise<void>;
  fetchWorkoutById: (id: string) => Promise<Workout | null>;
  createWorkout: (workout: { name: string; notes?: string }) => Promise<Workout | null>;
  updateWorkout: (id: string, data: Partial<Workout>) => Promise<Workout | null>;
  deleteWorkout: (id: string) => Promise<void>;
  completeWorkout: (id: string) => Promise<void>;
  setActiveWorkout: (workout: Workout | null) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => Promise<void>;
  removeExerciseFromActiveWorkout: (workoutExerciseId: string) => Promise<void>;
  addSetToExercise: (
    workoutExerciseId: string,
    set: {
      weight?: number;
      reps?: number;
      notes?: string;
      is_warmup?: boolean;
    },
  ) => Promise<void>;
  updateSet: (setId: string, data: Partial<ExerciseSet>) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
  fetchBodyMeasurements: () => Promise<void>;
  addBodyMeasurement: (measurement: {
    weight?: number;
    body_fat?: number;
    measurement_date: string;
    notes?: string;
  }) => Promise<void>;
  fetchWorkoutHistory: () => Promise<void>;
}

// Default values
const defaultContext: WorkoutContextType = {
  userPreferences: {
    fitnessLevel: 'beginner',
    workoutDuration: 30,
    workoutFrequency: 3,
    fitnessGoals: [],
    availableEquipment: [],
  },
  updateUserPreferences: () => {},

  workoutSuggestions: [],
  isLoadingWorkouts: false,

  fastingSchedule: {
    active: false,
    startTime: null,
    endTime: null,
    targetHours: 16,
  },
  updateFastingSchedule: () => {},

  waterIntake: {
    goal: 3000,
    current: 0,
    unit: 'ml',
    history: [],
  },
  addWaterIntake: () => {},
  updateWaterGoal: () => {},

  macros: {
    goal: {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    },
    current: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    history: [],
  },
  addFoodEntry: () => {},

  googleFit: {
    connected: false,
    steps: 0,
    calories: 0,
    activeMinutes: 0,
  },
  connectGoogleFit: async () => {},
  disconnectGoogleFit: () => {},

  heartHealth: {
    lastAssessment: null,
    heartRate: null,
    bloodPressure: { systolic: null, diastolic: null },
    stressLevel: null,
    sleepHours: null,
  },
  updateHeartHealth: () => {},

  // Workout Tracking (New)
  workouts: [],
  activeWorkout: null,
  exercises: [],
  bodyMeasurements: [],
  workoutHistory: [],
  isLoadingExercises: false,
  isLoadingActive: false,
  isLoadingHistory: false,

  // Workout Tracking Actions
  fetchWorkouts: async () => {},
  fetchExercises: async () => {},
  fetchWorkoutById: async () => null,
  createWorkout: async () => null,
  updateWorkout: async () => null,
  deleteWorkout: async () => {},
  completeWorkout: async () => {},
  setActiveWorkout: () => {},
  addExerciseToActiveWorkout: async () => {},
  removeExerciseFromActiveWorkout: async () => {},
  addSetToExercise: async () => {},
  updateSet: async () => {},
  deleteSet: async () => {},
  fetchBodyMeasurements: async () => {},
  addBodyMeasurement: async () => {},
  fetchWorkoutHistory: async () => {},
};

// Create context
const WorkoutContext = createContext<WorkoutContextType>(defaultContext);

// Hook to use the context
export const useWorkout = () => useContext(WorkoutContext);

// Provider component
export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [userPreferences, setUserPreferences] = useState(defaultContext.userPreferences);
  const [workoutSuggestions, setWorkoutSuggestions] = useState<any[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [fastingSchedule, setFastingSchedule] = useState(defaultContext.fastingSchedule);
  const [waterIntake, setWaterIntake] = useState(defaultContext.waterIntake);
  const [macros, setMacros] = useState(defaultContext.macros);
  const [googleFit, setGoogleFit] = useState(defaultContext.googleFit);
  const [heartHealth, setHeartHealth] = useState(defaultContext.heartHealth);

  // Workout tracking state
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Initialize state using localStorage or default values
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('workoutData');
      if (savedState) {
        return { ...defaultContext, ...JSON.parse(savedState) };
      }
    }
    return defaultContext;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workoutData', JSON.stringify(state));
    }
  }, [state]);

  // Initial data loading
  useEffect(() => {
    // Load workouts on initial render
    fetchWorkouts();

    // Load exercises
    fetchExercises();

    // Load body measurements
    fetchBodyMeasurements();

    // Load workout history
    fetchWorkoutHistory();
  }, []);

  // User preferences
  const updateUserPreferences = (preferences: Partial<WorkoutContextType['userPreferences']>) => {
    setState((prev) => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences },
    }));
  };

  // Fasting schedule
  const updateFastingSchedule = (schedule: Partial<WorkoutContextType['fastingSchedule']>) => {
    setState((prev) => ({
      ...prev,
      fastingSchedule: { ...prev.fastingSchedule, ...schedule },
    }));
  };

  // Water intake
  const addWaterIntake = (amount: number) => {
    setState((prev) => ({
      ...prev,
      waterIntake: {
        ...prev.waterIntake,
        current: prev.waterIntake.current + amount,
        history: [...prev.waterIntake.history, { timestamp: new Date().toISOString(), amount }],
      },
    }));
  };

  const updateWaterGoal = (goal: number) => {
    setState((prev) => ({
      ...prev,
      waterIntake: { ...prev.waterIntake, goal },
    }));
  };

  // Macros
  const addFoodEntry = (entry: { food: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setState((prev) => ({
      ...prev,
      macros: {
        ...prev.macros,
        current: {
          calories: prev.macros.current.calories + entry.calories,
          protein: prev.macros.current.protein + entry.protein,
          carbs: prev.macros.current.carbs + entry.carbs,
          fat: prev.macros.current.fat + entry.fat,
        },
        history: [...prev.macros.history, { ...entry, timestamp: new Date().toISOString() }],
      },
    }));
  };

  // Google Fit
  const connectGoogleFit = async () => {
    // In a real implementation, this would connect to Google Fit API
    setState((prev) => ({
      ...prev,
      googleFit: {
        ...prev.googleFit,
        connected: true,
        steps: 5000 + Math.floor(Math.random() * 3000),
        calories: 150 + Math.floor(Math.random() * 300),
        activeMinutes: 30 + Math.floor(Math.random() * 60),
      },
    }));
  };

  const disconnectGoogleFit = () => {
    setState((prev) => ({
      ...prev,
      googleFit: {
        ...prev.googleFit,
        connected: false,
        steps: 0,
        calories: 0,
        activeMinutes: 0,
      },
    }));
  };

  // Heart health
  const updateHeartHealth = (data: Partial<WorkoutContextType['heartHealth']>) => {
    setState((prev) => ({
      ...prev,
      heartHealth: {
        ...prev.heartHealth,
        ...data,
        lastAssessment: new Date().toISOString(),
      },
    }));
  };

  // Workout Tracking Implementation
  // Fetch all workouts for the current user
  const fetchWorkouts = async () => {
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  // Fetch exercises with optional filtering
  const fetchExercises = async (categoryId?: string, searchTerm?: string) => {
    setIsLoadingExercises(true);
    try {
      const data = await getExercises(categoryId, searchTerm);
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  // Fetch a specific workout by ID
  const fetchWorkoutById = async (id: string) => {
    setIsLoadingActive(true);
    try {
      const workout = await import('@/utils/workout-api').then((api) => api.getWorkoutById(id));

      if (workout) {
        // Ensure workout has required properties
        const safeWorkout = {
          ...workout,
          workout_exercises: workout.workout_exercises || [],
        };
        setActiveWorkout(safeWorkout);
        return safeWorkout;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching workout with ID ${id}:`, error);
      return null;
    } finally {
      setIsLoadingActive(false);
    }
  };

  // Create a new workout
  const createWorkout = async (workout: { name: string; notes?: string }) => {
    try {
      const newWorkout = await import('@/utils/workout-api').then((api) =>
        api.createWorkout({
          ...workout,
          is_completed: false,
        }),
      );

      if (newWorkout) {
        setWorkouts((prev) => [newWorkout, ...prev]);
        setActiveWorkout(newWorkout);
      }

      return newWorkout;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  };

  // Update an existing workout
  const updateWorkout = async (id: string, data: Partial<Workout>) => {
    try {
      const updatedWorkout = await import('@/utils/workout-api').then((api) => api.updateWorkout(id, data));

      if (updatedWorkout) {
        // Update workouts list
        setWorkouts((prev) => prev.map((w) => (w.id === id ? updatedWorkout : w)));

        // Update active workout if it's the same
        if (activeWorkout?.id === id) {
          setActiveWorkout((prev) => (prev ? { ...prev, ...updatedWorkout } : prev));
        }
      }

      return updatedWorkout;
    } catch (error) {
      console.error(`Error updating workout with ID ${id}:`, error);
      return null;
    }
  };

  // Delete a workout
  const deleteWorkout = async (id: string) => {
    try {
      await import('@/utils/workout-api').then((api) => api.deleteWorkout(id));

      // Remove from workouts list
      setWorkouts((prev) => prev.filter((w) => w.id !== id));

      // Clear active workout if it's the same
      if (activeWorkout?.id === id) {
        setActiveWorkout(null);
      }
    } catch (error) {
      console.error(`Error deleting workout with ID ${id}:`, error);
    }
  };

  // Complete a workout
  const completeWorkout = async (id: string) => {
    try {
      const now = new Date().toISOString();
      await updateWorkout(id, {
        is_completed: true,
        end_time: now,
      });

      // Refresh workout history after completing a workout
      fetchWorkoutHistory();
    } catch (error) {
      console.error(`Error completing workout with ID ${id}:`, error);
    }
  };

  // Add an exercise to the active workout
  const addExerciseToActiveWorkout = async (exerciseId: string) => {
    if (!activeWorkout) {
      console.error('No active workout to add exercise to');
      return;
    }

    try {
      // Get the current order index
      const orderIndex = (activeWorkout.workout_exercises?.length || 0) + 1;

      // Add the exercise
      const addedExercise = await import('@/utils/workout-api').then((api) =>
        api.addExerciseToWorkout(activeWorkout.id, exerciseId, orderIndex),
      );

      // Refresh the active workout
      if (addedExercise) {
        fetchWorkoutById(activeWorkout.id);
      }
    } catch (error) {
      console.error(`Error adding exercise to workout with ID ${activeWorkout.id}:`, error);
    }
  };

  // Remove an exercise from the active workout
  const removeExerciseFromActiveWorkout = async (workoutExerciseId: string) => {
    if (!activeWorkout) {
      console.error('No active workout to remove exercise from');
      return;
    }

    try {
      await import('@/utils/workout-api').then((api) => api.removeExerciseFromWorkout(workoutExerciseId));

      // Refresh the active workout
      fetchWorkoutById(activeWorkout.id);
    } catch (error) {
      console.error(`Error removing exercise with ID ${workoutExerciseId}:`, error);
    }
  };

  // Add a set to an exercise
  const addSetToExercise = async (
    workoutExerciseId: string,
    set: {
      weight?: number;
      reps?: number;
      notes?: string;
      is_warmup?: boolean;
    },
  ) => {
    if (!activeWorkout) {
      console.error('No active workout to add set to');
      return;
    }

    try {
      await import('@/utils/workout-api').then((api) =>
        api.addSetToExercise(workoutExerciseId, {
          ...set,
          is_completed: false,
          is_warmup: set.is_warmup || false,
        }),
      );

      // Refresh the active workout
      fetchWorkoutById(activeWorkout.id);
    } catch (error) {
      console.error(`Error adding set to exercise with ID ${workoutExerciseId}:`, error);
    }
  };

  // Update a set
  const updateSet = async (setId: string, data: Partial<ExerciseSet>) => {
    if (!activeWorkout) {
      console.error('No active workout to update set in');
      return;
    }

    try {
      await import('@/utils/workout-api').then((api) => api.updateSet(setId, data));

      // Refresh the active workout
      fetchWorkoutById(activeWorkout.id);
    } catch (error) {
      console.error(`Error updating set with ID ${setId}:`, error);
    }
  };

  // Delete a set
  const deleteSet = async (setId: string) => {
    if (!activeWorkout) {
      console.error('No active workout to delete set from');
      return;
    }

    try {
      await import('@/utils/workout-api').then((api) => api.deleteSet(setId));

      // Refresh the active workout
      fetchWorkoutById(activeWorkout.id);
    } catch (error) {
      console.error(`Error deleting set with ID ${setId}:`, error);
    }
  };

  // Fetch body measurements
  const fetchBodyMeasurements = async () => {
    try {
      const data = await getBodyMeasurements();
      setBodyMeasurements(data);
    } catch (error) {
      console.error('Error fetching body measurements:', error);
    }
  };

  // Add a body measurement
  const addBodyMeasurement = async (measurement: {
    weight?: number;
    body_fat?: number;
    measurement_date: string;
    notes?: string;
  }) => {
    try {
      const newMeasurement = await import('@/utils/workout-api').then((api) => api.addBodyMeasurement(measurement));

      if (newMeasurement) {
        setBodyMeasurements((prev) => [newMeasurement, ...prev]);
      }
    } catch (error) {
      console.error('Error adding body measurement:', error);
    }
  };

  // Fetch workout history for progress tracking
  const fetchWorkoutHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getWorkoutHistory();
      setWorkoutHistory(data);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        updateUserPreferences,
        updateFastingSchedule,
        addWaterIntake,
        updateWaterGoal,
        addFoodEntry,
        connectGoogleFit,
        disconnectGoogleFit,
        updateHeartHealth,
        // Workout tracking
        workouts,
        activeWorkout,
        exercises,
        bodyMeasurements,
        workoutHistory,
        isLoadingExercises,
        isLoadingActive,
        isLoadingHistory,
        fetchWorkouts,
        fetchExercises,
        fetchWorkoutById,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        completeWorkout,
        setActiveWorkout,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        addSetToExercise,
        updateSet,
        deleteSet,
        fetchBodyMeasurements,
        addBodyMeasurement,
        fetchWorkoutHistory,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

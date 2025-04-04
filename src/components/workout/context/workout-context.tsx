'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

// Default values
const defaultContext: WorkoutContextType = {
  userPreferences: {
    fitnessLevel: 'beginner',
    workoutDuration: 30,
    workoutFrequency: 3,
    fitnessGoals: ['general fitness'],
    availableEquipment: ['bodyweight'],
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
    goal: 2500,
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
      fat: 70,
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
};

// Create context
const WorkoutContext = createContext<WorkoutContextType>(defaultContext);

// Hook to use the context
export const useWorkout = () => useContext(WorkoutContext);

// Provider component
export function WorkoutProvider({ children }: { children: ReactNode }) {
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

  // Context value
  const value = {
    ...state,
    updateUserPreferences,
    updateFastingSchedule,
    addWaterIntake,
    updateWaterGoal,
    addFoodEntry,
    connectGoogleFit,
    disconnectGoogleFit,
    updateHeartHealth,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

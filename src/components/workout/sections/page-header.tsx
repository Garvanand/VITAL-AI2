'use client';

import { motion } from 'framer-motion';
import { DumbbellIcon } from 'lucide-react';
import { useWorkout } from '../context/workout-context';

export function PageHeader() {
  const { userPreferences } = useWorkout();

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#15E3E3]/5 to-[#15E3E3]/10 rounded-xl backdrop-blur-sm" />

      <div className="relative px-6 py-8 md:px-10 md:py-10 overflow-hidden rounded-xl border border-[#15E3E3]/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <DumbbellIcon className="w-8 h-8 text-[#15E3E3]" />
            </motion.div>
            <h1 className="text-3xl font-bold">Workout Hub</h1>
          </div>

          <motion.p
            className="text-lg text-muted-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Personalized workout plans, nutrition tracking, and health monitoring to help you achieve your fitness
            goals.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center px-3 py-1.5 bg-card/80 rounded-lg shadow-sm border border-[#15E3E3]/10">
              <span className="text-sm text-muted-foreground mr-1">Level:</span>
              <span className="text-sm font-medium text-[#15E3E3]">
                {userPreferences.fitnessLevel.charAt(0).toUpperCase() + userPreferences.fitnessLevel.slice(1)}
              </span>
            </div>

            <div className="flex items-center px-3 py-1.5 bg-card/80 rounded-lg shadow-sm border border-[#15E3E3]/10">
              <span className="text-sm text-muted-foreground mr-1">Duration:</span>
              <span className="text-sm font-medium text-[#15E3E3]">{userPreferences.workoutDuration} min</span>
            </div>

            <div className="flex items-center px-3 py-1.5 bg-card/80 rounded-lg shadow-sm border border-[#15E3E3]/10">
              <span className="text-sm text-muted-foreground mr-1">Frequency:</span>
              <span className="text-sm font-medium text-[#15E3E3]">{userPreferences.workoutFrequency} days/week</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-[#15E3E3]/5 to-[#15E3E3]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#15E3E3]/5 to-[#15E3E3]/10 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}

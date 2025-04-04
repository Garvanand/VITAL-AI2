'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, DumbbellIcon, HeartIcon, InfoIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '../context/workout-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const workoutDurations = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' },
];

const workoutFrequencies = [
  { value: 1, label: '1 day/week' },
  { value: 2, label: '2 days/week' },
  { value: 3, label: '3 days/week' },
  { value: 4, label: '4 days/week' },
  { value: 5, label: '5+ days/week' },
];

const fitnessGoals = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardiovascular Health' },
];

const equipmentOptions = [
  { value: 'bodyweight', label: 'Bodyweight Only' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'kettlebells', label: 'Kettlebells' },
  { value: 'bench', label: 'Bench' },
  { value: 'pullup_bar', label: 'Pull-up Bar' },
  { value: 'full_gym', label: 'Full Gym Access' },
];

export function PageHeader() {
  const { userPreferences, updateUserPreferences } = useWorkout();

  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userPreferences.fitnessGoals);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(userPreferences.availableEquipment);

  const handleGoalToggle = (value: string) => {
    setSelectedGoals((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleEquipmentToggle = (value: string) => {
    setSelectedEquipment((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const savePreferences = () => {
    updateUserPreferences({
      fitnessGoals: selectedGoals,
      availableEquipment: selectedEquipment,
    });
    setShowPreferences(false);
  };

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl" />

      <div className="relative px-6 py-8 md:px-10 md:py-12 overflow-hidden rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <DumbbellIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Workout Hub</h1>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            Personalized workout plans, nutrition tracking, and health monitoring to help you achieve your fitness
            goals.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center px-4 py-2 bg-white/80 rounded-lg shadow-sm">
              <span className="font-medium text-gray-600 mr-2">Level:</span>
              <span className="text-primary">
                {fitnessLevels.find((l) => l.value === userPreferences.fitnessLevel)?.label}
              </span>
            </div>

            <div className="flex items-center px-4 py-2 bg-white/80 rounded-lg shadow-sm">
              <span className="font-medium text-gray-600 mr-2">Duration:</span>
              <span className="text-primary">{userPreferences.workoutDuration} min</span>
            </div>

            <div className="flex items-center px-4 py-2 bg-white/80 rounded-lg shadow-sm">
              <span className="font-medium text-gray-600 mr-2">Frequency:</span>
              <span className="text-primary">{userPreferences.workoutFrequency} days/week</span>
            </div>

            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <span>Preferences</span>
                  <InfoIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Workout Preferences</DialogTitle>
                  <DialogDescription>Customize your workout experience by adjusting these settings.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Fitness Level</label>
                      <Select
                        defaultValue={userPreferences.fitnessLevel}
                        onValueChange={(value) => updateUserPreferences({ fitnessLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {fitnessLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Workout Duration</label>
                      <Select
                        defaultValue={userPreferences.workoutDuration.toString()}
                        onValueChange={(value) => updateUserPreferences({ workoutDuration: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutDurations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value.toString()}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Workout Frequency</label>
                      <Select
                        defaultValue={userPreferences.workoutFrequency.toString()}
                        onValueChange={(value) => updateUserPreferences({ workoutFrequency: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutFrequencies.map((frequency) => (
                            <SelectItem key={frequency.value} value={frequency.value.toString()}>
                              {frequency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fitness Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {fitnessGoals.map((goal) => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => handleGoalToggle(goal.value)}
                          className={`px-4 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                            selectedGoals.includes(goal.value)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedGoals.includes(goal.value) && <CheckIcon className="w-3.5 h-3.5" />}
                          {goal.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Available Equipment</label>
                    <div className="flex flex-wrap gap-2">
                      {equipmentOptions.map((equipment) => (
                        <button
                          key={equipment.value}
                          type="button"
                          onClick={() => handleEquipmentToggle(equipment.value)}
                          className={`px-4 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                            selectedEquipment.includes(equipment.value)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedEquipment.includes(equipment.value) && <CheckIcon className="w-3.5 h-3.5" />}
                          {equipment.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePreferences}>Save Preferences</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <span>Start Workout</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <HeartIcon className="w-4 h-4 text-red-500" />
                  <span>Health Assessment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Health Assessment</h4>
                  <p className="text-sm text-gray-500">
                    Complete a quick health assessment to get personalized recommendations for your workouts and
                    nutrition.
                  </p>
                  <Button size="sm" className="w-full">
                    Start Assessment
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

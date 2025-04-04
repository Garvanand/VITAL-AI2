'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkout } from '../context/workout-context';

export function MacroTracker() {
  const { macros, addFoodEntry } = useWorkout();
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    food: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const handleAddFood = () => {
    if (newFood.food && (newFood.calories > 0 || newFood.protein > 0 || newFood.carbs > 0 || newFood.fat > 0)) {
      addFoodEntry(newFood);
      setNewFood({
        food: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setShowAddFood(false);
    }
  };

  const calculatePercentage = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Nutrition Tracker</h3>
        <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <PlusCircle className="w-4 h-4" />
              <span>Add Food</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Food Entry</DialogTitle>
              <DialogDescription>Add details about your food intake to track your macros.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="food" className="text-right">
                  Food Item
                </Label>
                <Input
                  id="food"
                  value={newFood.food}
                  onChange={(e) => setNewFood({ ...newFood, food: e.target.value })}
                  placeholder="e.g., Grilled Chicken Breast"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories" className="text-right">
                    Calories
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newFood.calories || ''}
                    onChange={(e) => setNewFood({ ...newFood, calories: parseInt(e.target.value) || 0 })}
                    placeholder="kcal"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="protein" className="text-right">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newFood.protein || ''}
                    onChange={(e) => setNewFood({ ...newFood, protein: parseInt(e.target.value) || 0 })}
                    placeholder="g"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="carbs" className="text-right">
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newFood.carbs || ''}
                    onChange={(e) => setNewFood({ ...newFood, carbs: parseInt(e.target.value) || 0 })}
                    placeholder="g"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fat" className="text-right">
                    Fat (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    value={newFood.fat || ''}
                    onChange={(e) => setNewFood({ ...newFood, fat: parseInt(e.target.value) || 0 })}
                    placeholder="g"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" onClick={handleAddFood}>
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between mb-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-lg text-gray-900">{macros.current.calories}</span>
          <span className="mx-1">/</span>
          <span>{macros.goal.calories} kcal</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Daily calorie goal based on your fitness goals and activity level</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${calculatePercentage(macros.current.calories, macros.goal.calories)}%` }}
        transition={{ duration: 0.5 }}
      >
        <Progress value={calculatePercentage(macros.current.calories, macros.goal.calories)} className="h-2.5 mb-6" />
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Protein</span>
            <span className="text-xs font-medium text-gray-700">{macros.current.protein}g</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculatePercentage(macros.current.protein, macros.goal.protein)}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Progress value={calculatePercentage(macros.current.protein, macros.goal.protein)} className="h-1.5" />
          </motion.div>
          <div className="text-xs text-gray-500 text-right">{macros.goal.protein}g</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Carbs</span>
            <span className="text-xs font-medium text-gray-700">{macros.current.carbs}g</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculatePercentage(macros.current.carbs, macros.goal.carbs)}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Progress value={calculatePercentage(macros.current.carbs, macros.goal.carbs)} className="h-1.5" />
          </motion.div>
          <div className="text-xs text-gray-500 text-right">{macros.goal.carbs}g</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Fat</span>
            <span className="text-xs font-medium text-gray-700">{macros.current.fat}g</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculatePercentage(macros.current.fat, macros.goal.fat)}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Progress value={calculatePercentage(macros.current.fat, macros.goal.fat)} className="h-1.5" />
          </motion.div>
          <div className="text-xs text-gray-500 text-right">{macros.goal.fat}g</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Recent Food Entries</h4>
        {macros.history.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {macros.history
              .slice(-5)
              .reverse()
              .map((entry, index) => (
                <motion.div
                  key={entry.timestamp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm"
                >
                  <div className="font-medium">{entry.food}</div>
                  <div className="text-gray-500">{entry.calories} kcal</div>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic py-2">No entries yet. Add food to track your nutrition.</div>
        )}
      </div>
    </div>
  );
}

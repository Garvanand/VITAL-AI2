'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Info, Utensils, ArrowUpCircle, Camera } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';

// Define interface for the scanned food data
interface ScannedFood {
  food: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
}

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
  const [selectedMacro, setSelectedMacro] = useState<string | null>(null);
  const [scannedEntry, setScannedEntry] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const pulseVariant = {
    pulse: {
      scale: [1, 1.02, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  const progressVariants = {
    initial: { width: '0%' },
    animate: (percent: number) => ({
      width: `${percent}%`,
      transition: { duration: 0.8, ease: 'easeOut' },
    }),
  };

  // Effect to reset selected macro highlight
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedMacro(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [selectedMacro]);

  // Effect to reset the scanned entry highlight
  useEffect(() => {
    if (scannedEntry) {
      const timer = setTimeout(() => {
        setScannedEntry(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [scannedEntry]);

  // Listen for scanned food data from the calorie tracker
  useEffect(() => {
    // Check for existing scanned food in localStorage on mount
    const checkForScannedFood = () => {
      const storedData = localStorage.getItem('scannedFood');
      if (storedData) {
        try {
          const foodData = JSON.parse(storedData) as ScannedFood;
          handleScannedFood(foodData);
          // Clear the localStorage after processing to prevent duplicates on refresh
          localStorage.removeItem('scannedFood');
        } catch (error) {
          console.error('Error parsing scanned food data:', error);
        }
      }
    };

    // Handle storage events from calorie tracker
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'scannedFood' && event.newValue) {
        try {
          const foodData = JSON.parse(event.newValue) as ScannedFood;
          handleScannedFood(foodData);
        } catch (error) {
          console.error('Error parsing scanned food data:', error);
        }
      }
    };

    // Process the scanned food data
    const handleScannedFood = (foodData: ScannedFood) => {
      const newEntry = {
        food: foodData.food,
        calories: typeof foodData.calories === 'string' ? parseInt(foodData.calories) : foodData.calories,
        protein: typeof foodData.protein === 'string' ? parseInt(foodData.protein) : foodData.protein,
        carbs: typeof foodData.carbs === 'string' ? parseInt(foodData.carbs) : foodData.carbs,
        fat: typeof foodData.fat === 'string' ? parseInt(foodData.fat) : foodData.fat,
      };

      // Only add if we have valid data
      if (newEntry.food && (newEntry.calories > 0 || newEntry.protein > 0 || newEntry.carbs > 0 || newEntry.fat > 0)) {
        addFoodEntry(newEntry);
        setScannedEntry(newEntry.food);
        toast({
          title: 'Food Added from Scanner',
          description: `Added ${newEntry.food} with ${newEntry.calories} calories`,
          duration: 3000,
        });
      }
    };

    // Add event listener and check for scanned food on mount
    window.addEventListener('storage', handleStorageChange);
    checkForScannedFood();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [addFoodEntry]);

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

  const highlightMacro = (macro: string) => {
    setSelectedMacro(macro);
  };

  return (
    <motion.div
      className="p-6 bg-card rounded-xl shadow-sm border border-[#15E3E3]/10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex items-center gap-2" variants={itemVariants}>
          <Utensils className="w-5 h-5 text-[#15E3E3]" />
          <h3 className="text-lg font-medium">Nutrition Tracker</h3>
        </motion.div>
        <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
          <DialogTrigger asChild>
            <motion.div variants={itemVariants}>
              <Button variant="outline" size="sm" className="gap-1 border-[#15E3E3]/20">
                <PlusCircle className="w-4 h-4" />
                <span>Add Food</span>
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-card border border-[#15E3E3]/20 backdrop-blur-sm">
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
                  className="mt-1 border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
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
                    className="mt-1 border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
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
                    className="mt-1 border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
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
                    className="mt-1 border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
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
                    className="mt-1 border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddFood}
                className="bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
              >
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div className="flex justify-between mb-2" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="text-sm text-muted-foreground" variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <span className="font-medium text-lg text-foreground">{macros.current.calories}</span>
          <span className="mx-1">/</span>
          <span>{macros.goal.calories} kcal</span>
        </motion.div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants} whileHover={{ rotate: 15 }}>
                <Info className="w-4 h-4 text-[#15E3E3]/70" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Daily calorie goal based on your fitness goals and activity level</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      <div className="relative h-2.5 w-full bg-muted/30 rounded-full mb-6">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-[#15E3E3]"
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={calculatePercentage(macros.current.calories, macros.goal.calories)}
        />
      </div>

      <motion.div
        className="grid grid-cols-3 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className={`space-y-2 p-3 rounded-lg transition-colors duration-300 ${
            selectedMacro === 'protein' ? 'bg-blue-500/10' : 'hover:bg-card/80'
          }`}
          variants={itemVariants}
          onClick={() => highlightMacro('protein')}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Protein</span>
            <span className="text-xs font-medium">{macros.current.protein}g</span>
          </div>
          <div className="relative h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculatePercentage(macros.current.protein, macros.goal.protein)}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">{macros.goal.protein}g</div>
        </motion.div>

        <motion.div
          className={`space-y-2 p-3 rounded-lg transition-colors duration-300 ${
            selectedMacro === 'carbs' ? 'bg-emerald-500/10' : 'hover:bg-card/80'
          }`}
          variants={itemVariants}
          onClick={() => highlightMacro('carbs')}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Carbs</span>
            <span className="text-xs font-medium">{macros.current.carbs}g</span>
          </div>
          <div className="relative h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculatePercentage(macros.current.carbs, macros.goal.carbs)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">{macros.goal.carbs}g</div>
        </motion.div>

        <motion.div
          className={`space-y-2 p-3 rounded-lg transition-colors duration-300 ${
            selectedMacro === 'fat' ? 'bg-amber-500/10' : 'hover:bg-card/80'
          }`}
          variants={itemVariants}
          onClick={() => highlightMacro('fat')}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fat</span>
            <span className="text-xs font-medium">{macros.current.fat}g</span>
          </div>
          <div className="relative h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculatePercentage(macros.current.fat, macros.goal.fat)}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">{macros.goal.fat}g</div>
        </motion.div>
      </motion.div>

      <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h4 className="text-sm font-medium flex items-center gap-2" variants={itemVariants}>
          <span>Recent Food Entries</span>
          {macros.history.length > 0 && (
            <motion.span
              className="text-xs px-2 py-0.5 bg-[#15E3E3]/10 text-[#15E3E3] rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              {macros.history.length}
            </motion.span>
          )}
        </motion.h4>

        {macros.history.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <AnimatePresence>
              {macros.history
                .slice(-5)
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={entry.timestamp}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`flex justify-between items-center p-3 bg-card/60 border ${
                      scannedEntry === entry.food ? 'border-[#15E3E3]/50 bg-[#15E3E3]/5' : 'border-[#15E3E3]/10'
                    } rounded-lg text-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 4px 12px rgba(21, 227, 227, 0.1)',
                      borderColor: 'rgba(21, 227, 227, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#15E3E3]/10 text-[#15E3E3]">
                        {entry.food.toLowerCase().includes('scanned') ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <Utensils className="h-4 w-4" />
                        )}
                      </div>
                      <div className="font-medium">
                        {entry.food}
                        {entry.food.toLowerCase().includes('scanned') && (
                          <motion.span
                            className="ml-2 text-xs px-1.5 py-0.5 bg-[#15E3E3]/20 text-[#15E3E3] rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            Scanned
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {entry.calories} kcal
                      <span className="ml-2 text-xs text-muted-foreground/70">
                        P:{entry.protein}g C:{entry.carbs}g F:{entry.fat}g
                      </span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            variants={pulseVariant}
            animate="pulse"
            className="flex flex-col items-center justify-center py-6 bg-card/60 border border-[#15E3E3]/10 rounded-lg text-center"
          >
            <ArrowUpCircle className="h-10 w-10 text-[#15E3E3]/50 mb-2" />
            <div className="text-sm text-muted-foreground">No entries yet. Add food to track your nutrition.</div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
              <Button variant="outline" size="sm" className="border-[#15E3E3]/20" onClick={() => setShowAddFood(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add First Food
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWorkout } from '../context/workout-context';

// Helper function to convert ml to oz and vice versa
const mlToOz = (ml: number) => Math.round(ml * 0.033814 * 10) / 10;
const ozToMl = (oz: number) => Math.round(oz / 0.033814);

export function WaterIntakeTracker() {
  const { waterIntake, addWaterIntake, updateWaterGoal } = useWorkout();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newGoal, setNewGoal] = useState(waterIntake.goal);
  const [unit, setUnit] = useState<'ml' | 'oz'>(waterIntake.unit);

  // For selecting amount to add
  const [selectedAmount, setSelectedAmount] = useState(250); // Default to 250ml

  const handleAddWater = (amount: number) => {
    // If unit is oz, convert to ml
    const amountInMl = unit === 'oz' ? ozToMl(amount) : amount;
    addWaterIntake(amountInMl);
  };

  const handleUpdateGoal = () => {
    // If unit is oz, convert to ml
    const goalInMl = unit === 'oz' ? ozToMl(newGoal) : newGoal;
    updateWaterGoal(goalInMl);
    setShowSettings(false);
  };

  const getDisplayValue = (value: number) => {
    return unit === 'oz' ? mlToOz(value) : value;
  };

  const getUnitLabel = () => {
    return unit === 'oz' ? 'fl oz' : 'ml';
  };

  // Calculate percentage
  const percentage = Math.min(100, Math.round((waterIntake.current / waterIntake.goal) * 100));

  // Water wave animation
  const waveVariants = {
    animate: {
      x: [0, -100],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 5,
          ease: 'linear',
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium">Water Intake</h3>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <History className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Water Intake History</DialogTitle>
                <DialogDescription>Your water intake logs for today.</DialogDescription>
              </DialogHeader>

              <div className="max-h-[300px] overflow-y-auto">
                {waterIntake.history.length > 0 ? (
                  <ul className="divide-y">
                    {waterIntake.history
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <span className="text-sm text-gray-600">
                            {new Date(entry.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="font-medium">
                            +{getDisplayValue(entry.amount)} {getUnitLabel()}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No entries yet. Start tracking your water intake!
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Water Tracking Settings</DialogTitle>
                <DialogDescription>Customize your daily water intake goal and preferred unit.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="goal" className="text-right">
                    Daily Goal
                  </Label>
                  <div className="flex mt-1">
                    <Input
                      id="goal"
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(Number(e.target.value))}
                      className="rounded-r-none"
                    />
                    <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-gray-50 text-gray-500">
                      {getUnitLabel()}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-right mb-2 block">Preferred Unit</Label>
                  <RadioGroup
                    value={unit}
                    onValueChange={(value) => setUnit(value as 'ml' | 'oz')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ml" id="ml" />
                      <Label htmlFor="ml">Milliliters (ml)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oz" id="oz" />
                      <Label htmlFor="oz">Fluid Ounces (fl oz)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleUpdateGoal}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative h-48 mb-6 overflow-hidden rounded-xl border border-blue-100">
        {/* Water fill visualization */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-blue-400/20 transition-all duration-1000 ease-in-out"
          style={{ height: `${percentage}%` }}
        >
          <motion.div
            className="absolute inset-0 opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            variants={waveVariants}
            animate="animate"
          />
          <motion.div
            className="absolute inset-0 opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              top: '10%',
            }}
            variants={waveVariants}
            animate="animate"
          />
        </div>

        {/* Current volume display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-blue-600">{getDisplayValue(waterIntake.current)}</div>
          <div className="text-sm text-blue-400 font-medium">{getUnitLabel()}</div>
          <div className="text-xs text-gray-500 mt-1">
            of {getDisplayValue(waterIntake.goal)} {getUnitLabel()} goal
          </div>
          <div className="mt-3 text-sm font-medium">{percentage}% completed</div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Quick Add</h4>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Custom</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Add Custom Amount</h4>
                <div className="flex">
                  <Input
                    type="number"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(Number(e.target.value))}
                    className="rounded-r-none"
                  />
                  <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-gray-50 text-gray-500">
                    {getUnitLabel()}
                  </div>
                </div>
                <Button className="w-full mt-2" size="sm" onClick={() => handleAddWater(selectedAmount)}>
                  Add
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {unit === 'ml' ? (
            <>
              <Button variant="outline" onClick={() => handleAddWater(100)} className="h-12">
                100 ml
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(250)} className="h-12">
                250 ml
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(500)} className="h-12">
                500 ml
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(1000)} className="h-12">
                1000 ml
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleAddWater(4)} className="h-12">
                4 oz
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(8)} className="h-12">
                8 oz
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(16)} className="h-12">
                16 oz
              </Button>
              <Button variant="outline" onClick={() => handleAddWater(32)} className="h-12">
                32 oz
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reminders */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-medium">Remind me to drink water</div>
          <Switch id="water-reminders" />
        </div>
        <p className="text-xs text-gray-500">We'll remind you to stay hydrated throughout the day.</p>
      </div>
    </div>
  );
}

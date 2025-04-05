'use client';

import { useState, useEffect } from 'react';
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
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Helper function to convert ml to oz and vice versa
const mlToOz = (ml: number) => Math.round(ml * 0.033814 * 10) / 10;
const ozToMl = (oz: number) => Math.round(oz / 0.033814);

// Format date for database queries
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export function WaterIntakeTracker() {
  const { waterIntake, addWaterIntake, updateWaterGoal } = useWorkout();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newGoal, setNewGoal] = useState(waterIntake.goal);
  const [unit, setUnit] = useState<'ml' | 'oz'>(waterIntake.unit);
  const [isLoading, setIsLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<Array<{ id: string; amount: number; timestamp: string }>>([]);
  const { toast } = useToast();

  // For selecting amount to add
  const [selectedAmount, setSelectedAmount] = useState(250); // Default to 250ml

  // Fetch water intake data from Supabase
  const fetchWaterIntakeData = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // If not authenticated, use local state only
        setIsLoading(false);
        return;
      }

      // First check if the table exists by making a lightweight query
      const { error: tableCheckError } = await supabase
        .from('water_intake')
        .select('id', { count: 'exact', head: true });

      if (tableCheckError) {
        console.warn('Water intake tables may not exist yet:', tableCheckError.message);
        setIsLoading(false);
        return;
      }

      const today = formatDate(new Date());

      // Get today's entries
      const { data: entries, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching water intake data:', error);
        return;
      }

      // Calculate total intake for today
      if (entries && entries.length > 0) {
        const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
        addWaterIntake(totalAmount, false); // Add without incrementing (just set the value)

        // Check if goals table exists
        const { error: goalsTableCheckError } = await supabase
          .from('water_intake_goals')
          .select('id', { count: 'exact', head: true });

        if (!goalsTableCheckError) {
          // Get user's goal
          const { data: goalData, error: goalError } = await supabase
            .from('water_intake_goals')
            .select('goal, unit')
            .eq('user_id', session.user.id)
            .single();

          if (goalData) {
            updateWaterGoal(goalData.goal);
            setUnit(goalData.unit);
          }
        }

        setHistoryEntries(entries);
      }
    } catch (error) {
      console.error('Error fetching water intake data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterIntakeData();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      // If unit is oz, convert to ml
      const amountInMl = unit === 'oz' ? ozToMl(amount) : amount;

      // Update local state
      addWaterIntake(amountInMl);

      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Not signed in',
          description: 'Sign in to save your water intake data',
          variant: 'destructive',
        });
        return;
      }

      // Check if table exists first
      const { error: tableCheckError } = await supabase
        .from('water_intake')
        .select('id', { count: 'exact', head: true });

      if (tableCheckError) {
        console.warn('Water intake tables may not exist yet:', tableCheckError.message);
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL script to create the necessary tables in Supabase',
          variant: 'destructive',
        });
        return;
      }

      const today = formatDate(new Date());

      // Save to Supabase
      const { data, error } = await supabase
        .from('water_intake')
        .insert([
          {
            user_id: session.user.id,
            amount: amountInMl,
            date: today,
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error saving water intake:', error);
        toast({
          title: 'Failed to save',
          description: 'There was an error saving your water intake',
          variant: 'destructive',
        });
        return;
      }

      // Refresh history entries
      fetchWaterIntakeData();
    } catch (error) {
      console.error('Error adding water intake:', error);
    }
  };

  const handleUpdateGoal = async () => {
    try {
      // If unit is oz, convert to ml
      const goalInMl = unit === 'oz' ? ozToMl(newGoal) : newGoal;

      // Update local state
      updateWaterGoal(goalInMl);

      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Not signed in',
          description: 'Sign in to save your water intake goal',
          variant: 'destructive',
        });
        setShowSettings(false);
        return;
      }

      // Check if table exists first
      const { error: tableCheckError } = await supabase
        .from('water_intake_goals')
        .select('id', { count: 'exact', head: true });

      if (tableCheckError) {
        console.warn('Water intake goals table may not exist yet:', tableCheckError.message);
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL script to create the necessary tables in Supabase',
          variant: 'destructive',
        });
        setShowSettings(false);
        return;
      }

      // Upsert to Supabase (update if exists, insert if not)
      const { data, error } = await supabase
        .from('water_intake_goals')
        .upsert([
          {
            user_id: session.user.id,
            goal: goalInMl,
            unit,
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error saving water intake goal:', error);
        toast({
          title: 'Failed to save goal',
          description: 'There was an error saving your water intake goal',
          variant: 'destructive',
        });
      }

      setShowSettings(false);
    } catch (error) {
      console.error('Error updating water goal:', error);
    }
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

  // Liquid fill animation
  const fillVariants = {
    initial: { height: '0%' },
    animate: {
      height: `${percentage}%`,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  // Ripple effect on adding water
  const rippleVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: {
      scale: 2.5,
      opacity: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-[#15E3E3]/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-[#15E3E3]" />
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
                {historyEntries.length > 0 ? (
                  <ul className="divide-y">
                    {historyEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <li key={entry.id} className="py-3 flex justify-between">
                          <span className="text-sm text-muted-foreground">
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
                  <div className="py-8 text-center text-muted-foreground">
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
                      className="rounded-r-none border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                    />
                    <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-background/30 text-muted-foreground border-[#15E3E3]/20">
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
                <Button
                  type="submit"
                  onClick={handleUpdateGoal}
                  className="bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative h-48 mb-6 overflow-hidden rounded-xl border border-[#15E3E3]/30">
        {/* Water fill visualization */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-[#15E3E3]/30"
          variants={fillVariants}
          initial="initial"
          animate="animate"
          key={waterIntake.current} // Re-animate when value changes
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
        </motion.div>

        {/* Ripple effect when adding water */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <motion.div
            className="w-20 h-20 rounded-full bg-[#15E3E3]/20"
            variants={rippleVariants}
            initial="initial"
            animate="animate"
            key={`ripple-${waterIntake.current}`} // Re-animate when value changes
          />
        </div>

        {/* Current volume display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-[#15E3E3]">{getDisplayValue(waterIntake.current)}</div>
          <div className="text-sm text-[#15E3E3]/70 font-medium">{getUnitLabel()}</div>
          <div className="text-xs text-muted-foreground mt-1">
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
              <Button variant="outline" size="sm" className="gap-1 border-[#15E3E3]/20">
                <Plus className="w-3.5 h-3.5" />
                <span>Custom</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 border-[#15E3E3]/20 bg-card/80 backdrop-blur-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Add Custom Amount</h4>
                <div className="flex">
                  <Input
                    type="number"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(Number(e.target.value))}
                    className="rounded-r-none border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                  />
                  <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-background/30 text-muted-foreground border-[#15E3E3]/20">
                    {getUnitLabel()}
                  </div>
                </div>
                <Button
                  className="w-full mt-2 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
                  size="sm"
                  onClick={() => handleAddWater(selectedAmount)}
                >
                  Add
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {unit === 'ml' ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleAddWater(100)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                100 ml
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(250)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                250 ml
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(500)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                500 ml
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(1000)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                1000 ml
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleAddWater(4)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                4 oz
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(8)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                8 oz
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(16)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                16 oz
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddWater(32)}
                className="h-12 border-[#15E3E3]/20 hover:border-[#15E3E3]/50"
              >
                32 oz
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reminders */}
      <div className="mt-6 pt-6 border-t border-[#15E3E3]/10">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-medium">Remind me to drink water</div>
          <Switch id="water-reminders" />
        </div>
        <p className="text-xs text-muted-foreground">We'll remind you to stay hydrated throughout the day.</p>
      </div>
    </div>
  );
}

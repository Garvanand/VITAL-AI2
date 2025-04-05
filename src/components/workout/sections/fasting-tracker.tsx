'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useWorkout } from '../context/workout-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Helper functions
const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
};

// Format date for database queries
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export function FastingTracker() {
  const { fastingSchedule, updateFastingSchedule } = useWorkout();
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fastingHistory, setFastingHistory] = useState<any[]>([]);
  const { toast } = useToast();

  // Convert target hours to milliseconds
  const targetDuration = fastingSchedule.targetHours * 60 * 60 * 1000;

  // Fetch user's fasting data from Supabase
  const fetchFastingData = async () => {
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
        .from('fasting_sessions')
        .select('id', { count: 'exact', head: true });

      if (tableCheckError) {
        console.warn('Fasting tables may not exist yet:', tableCheckError.message);
        setIsLoading(false);
        return;
      }

      // Get active fasting session if exists
      const { data: activeFasting, error: activeError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (activeError && activeError.code !== 'PGRST116') {
        console.error('Error fetching active fasting session:', activeError);
      }

      // Check if preferences table exists
      const { error: prefTableCheckError } = await supabase
        .from('fasting_preferences')
        .select('id', { count: 'exact', head: true });

      if (!prefTableCheckError) {
        // Get user's fasting preferences
        const { data: preferences, error: prefError } = await supabase
          .from('fasting_preferences')
          .select('target_hours')
          .eq('user_id', session.user.id)
          .single();

        if (prefError && prefError.code !== 'PGRST116') {
          console.error('Error fetching fasting preferences:', prefError);
        }

        // Update state with fetched data
        if (activeFasting) {
          updateFastingSchedule({
            active: true,
            startTime: activeFasting.start_time,
            endTime: null,
            targetHours: preferences?.target_hours || fastingSchedule.targetHours,
          });
        } else if (preferences) {
          updateFastingSchedule({
            targetHours: preferences.target_hours,
          });
        }
      }

      // Only try to get history if the table exists
      const { data: history, error: historyError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false })
        .limit(5);

      if (historyError) {
        console.error('Error fetching fasting history:', historyError);
      } else if (history) {
        setFastingHistory(history);
      }
    } catch (error) {
      console.error('Error fetching fasting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFastingData();
  }, []);

  // Handle toggle fasting
  const toggleFasting = async () => {
    try {
      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const now = new Date();

      if (fastingSchedule.active) {
        // Stop fasting
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }

        const endTime = now.toISOString();
        updateFastingSchedule({
          active: false,
          endTime,
        });

        // Save to Supabase if logged in
        if (session) {
          // Check if table exists first
          const { error: tableCheckError } = await supabase
            .from('fasting_sessions')
            .select('id', { count: 'exact', head: true });

          if (tableCheckError) {
            console.warn('Fasting tables may not exist yet:', tableCheckError.message);
            toast({
              title: 'Database setup required',
              description: 'The fasting tracker tables need to be created in Supabase first',
              variant: 'destructive',
            });
            return;
          }

          const { error } = await supabase
            .from('fasting_sessions')
            .update({
              end_time: endTime,
              duration_minutes: Math.floor(timeElapsed / (60 * 1000)),
              completed: timeElapsed >= targetDuration,
            })
            .eq('user_id', session.user.id)
            .is('end_time', null);

          if (error) {
            console.error('Error updating fasting session:', error);
            toast({
              title: 'Failed to save',
              description: 'There was an error saving your fasting session',
              variant: 'destructive',
            });
          } else {
            fetchFastingData(); // Refresh data
          }
        }
      } else {
        // Start fasting
        const startTime = now.toISOString();
        updateFastingSchedule({
          active: true,
          startTime,
          endTime: null,
        });

        // Save to Supabase if logged in
        if (session) {
          // Check if table exists first
          const { error: tableCheckError } = await supabase
            .from('fasting_sessions')
            .select('id', { count: 'exact', head: true });

          if (tableCheckError) {
            console.warn('Fasting tables may not exist yet:', tableCheckError.message);
            toast({
              title: 'Database setup required',
              description: 'Please run the SQL script to create the necessary tables in Supabase',
              variant: 'destructive',
            });
            return;
          }

          const { error } = await supabase.from('fasting_sessions').insert([
            {
              user_id: session.user.id,
              start_time: startTime,
              target_hours: fastingSchedule.targetHours,
            },
          ]);

          if (error) {
            console.error('Error creating fasting session:', error);
            toast({
              title: 'Failed to start',
              description: 'There was an error starting your fasting session',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Not signed in',
            description: 'Sign in to save your fasting progress',
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling fasting:', error);
    }
  };

  // Reset fasting
  const resetFasting = async () => {
    try {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      updateFastingSchedule({
        active: false,
        startTime: null,
        endTime: null,
      });

      setTimeElapsed(0);
      setTimeRemaining(targetDuration);
      setProgress(0);

      // If there's an active session in Supabase, cancel it
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { error } = await supabase
          .from('fasting_sessions')
          .update({
            end_time: new Date().toISOString(),
            canceled: true,
            duration_minutes: Math.floor(timeElapsed / (60 * 1000)),
          })
          .eq('user_id', session.user.id)
          .is('end_time', null);

        if (error) {
          console.error('Error canceling fasting session:', error);
        }
      }
    } catch (error) {
      console.error('Error resetting fasting:', error);
    }
  };

  // Update target hours
  const updateTargetHours = async (hours: number) => {
    try {
      updateFastingSchedule({
        targetHours: hours,
      });

      // Save preferences to Supabase if logged in
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { error } = await supabase.from('fasting_preferences').upsert({
          user_id: session.user.id,
          target_hours: hours,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error saving fasting preferences:', error);
          toast({
            title: 'Failed to save preferences',
            description: 'There was an error saving your fasting preferences',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error updating target hours:', error);
    }
  };

  // Update timer when active
  useEffect(() => {
    if (fastingSchedule.active && fastingSchedule.startTime) {
      // Clear any existing interval
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Create a new interval
      const id = setInterval(() => {
        const startTime = new Date(fastingSchedule.startTime!).getTime();
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;

        setTimeElapsed(elapsed);
        setTimeRemaining(Math.max(0, targetDuration - elapsed));
        setProgress(Math.min(100, (elapsed / targetDuration) * 100));

        // If the fast is complete and still active
        if (elapsed >= targetDuration && fastingSchedule.active) {
          updateFastingSchedule({
            active: false,
            endTime: new Date().toISOString(),
          });

          // Update Supabase
          const updateFastingSession = async () => {
            const supabase = createClient();
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              const { error } = await supabase
                .from('fasting_sessions')
                .update({
                  end_time: new Date().toISOString(),
                  duration_minutes: fastingSchedule.targetHours * 60,
                  completed: true,
                })
                .eq('user_id', session.user.id)
                .is('end_time', null);

              if (error) {
                console.error('Error completing fasting session:', error);
              } else {
                toast({
                  title: 'Fasting Complete',
                  description: `You've successfully completed your ${fastingSchedule.targetHours}-hour fast!`,
                  variant: 'default',
                });
                fetchFastingData(); // Refresh data
              }
            }
          };

          updateFastingSession();
          clearInterval(id);
          setIntervalId(null);
        }
      }, 1000);

      setIntervalId(id);

      // Cleanup on unmount
      return () => {
        if (id) clearInterval(id);
      };
    }
  }, [fastingSchedule.active, fastingSchedule.startTime, targetDuration]);

  // Initial calculation
  useEffect(() => {
    if (fastingSchedule.startTime && fastingSchedule.active) {
      const startTime = new Date(fastingSchedule.startTime).getTime();
      const currentTime = new Date().getTime();
      const elapsed = currentTime - startTime;

      setTimeElapsed(elapsed);
      setTimeRemaining(Math.max(0, targetDuration - elapsed));
      setProgress(Math.min(100, (elapsed / targetDuration) * 100));
    }
  }, [fastingSchedule.startTime, fastingSchedule.active, targetDuration]);

  const elapsedFormatted = formatTime(timeElapsed);
  const remainingFormatted = formatTime(timeRemaining);

  // Circle animation variants
  const circleVariants = {
    pending: {
      pathLength: 0,
      opacity: 0.5,
      transition: { duration: 0 },
    },
    progress: {
      pathLength: progress / 100,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  // Pulse animation for active fasting
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-[#15E3E3]/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-[#15E3E3]" />
          <h3 className="text-lg font-medium">Intermittent Fasting</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="fasting-mode" checked={fastingSchedule.active} onCheckedChange={toggleFasting} />
          <Label htmlFor="fasting-mode" className={fastingSchedule.active ? 'text-[#15E3E3]' : 'text-muted-foreground'}>
            {fastingSchedule.active ? 'Active' : 'Inactive'}
          </Label>
        </div>
      </div>

      {/* Circular progress indicator */}
      <div className="relative flex justify-center items-center mb-6">
        <motion.div
          className="relative h-52 w-52 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background circle */}
          <svg className="absolute w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/10"
            />
          </svg>

          {/* Progress circle */}
          <svg className="absolute w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-[#15E3E3]"
              variants={circleVariants}
              initial="pending"
              animate="progress"
              key={progress} // Re-animate when progress changes
            />
          </svg>

          {/* Inner content */}
          <div className="text-center">
            <div className="text-4xl font-bold text-[#15E3E3] mb-1">{Math.round(progress)}%</div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {elapsedFormatted.hours}h {elapsedFormatted.minutes}m<span className="opacity-50"> / </span>
                {fastingSchedule.targetHours}h
              </span>
              <span className="text-xs text-muted-foreground/70 mt-1">
                {remainingFormatted.hours}h {remainingFormatted.minutes}m remaining
              </span>
            </div>

            {fastingSchedule.active && (
              <motion.div className="absolute inset-0" variants={pulseVariants} animate="pulse">
                <div className="w-full h-full rounded-full border-2 border-[#15E3E3]/30" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <motion.div
          className="p-3 bg-card/60 rounded-lg border border-[#15E3E3]/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-muted-foreground mb-1">Elapsed</div>
          <div className="font-mono text-lg font-bold">
            {elapsedFormatted.hours}h {elapsedFormatted.minutes}m
          </div>
        </motion.div>

        <motion.div
          className="p-3 bg-card/60 rounded-lg border border-[#15E3E3]/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-muted-foreground mb-1">Remaining</div>
          <div className="font-mono text-lg font-bold">
            {remainingFormatted.hours}h {remainingFormatted.minutes}m
          </div>
        </motion.div>

        <motion.div
          className="p-3 bg-card/60 rounded-lg border border-[#15E3E3]/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-muted-foreground mb-1">Target</div>
          <div className="font-mono text-lg font-bold">{fastingSchedule.targetHours}h</div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Fasting Schedule</div>
            <div className="text-muted-foreground">{fastingSchedule.targetHours}:8 Protocol</div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#15E3E3]/20">
                Change
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 border-[#15E3E3]/20 bg-card/80 backdrop-blur-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Fasting Protocol</h4>
                <Select
                  value={fastingSchedule.targetHours.toString()}
                  onValueChange={(value) => updateTargetHours(parseInt(value))}
                >
                  <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12:12 Protocol</SelectItem>
                    <SelectItem value="14">14:10 Protocol</SelectItem>
                    <SelectItem value="16">16:8 Protocol</SelectItem>
                    <SelectItem value="18">18:6 Protocol</SelectItem>
                    <SelectItem value="20">20:4 Protocol</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-2">
                  Fast for {fastingSchedule.targetHours} hours, eat within a {24 - fastingSchedule.targetHours}-hour
                  window
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant={fastingSchedule.active ? 'destructive' : 'default'}
            className={
              fastingSchedule.active
                ? 'w-full gap-2'
                : 'w-full gap-2 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black'
            }
            onClick={toggleFasting}
          >
            {fastingSchedule.active ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop Fasting</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Fasting</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            disabled={!fastingSchedule.startTime}
            onClick={resetFasting}
            className="px-3 border-[#15E3E3]/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {fastingSchedule.active && timeElapsed > 0 && (
          <motion.div
            className="flex items-center mt-4 p-2 bg-[#15E3E3]/10 text-[#15E3E3] rounded text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Fasting in progress</span>
              {' - '}
              Started at{' '}
              {fastingSchedule.startTime &&
                new Date(fastingSchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

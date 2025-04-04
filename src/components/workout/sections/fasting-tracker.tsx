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

export function FastingTracker() {
  const { fastingSchedule, updateFastingSchedule } = useWorkout();
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Convert target hours to milliseconds
  const targetDuration = fastingSchedule.targetHours * 60 * 60 * 1000;

  // Handle toggle fasting
  const toggleFasting = () => {
    if (fastingSchedule.active) {
      // Stop fasting
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      updateFastingSchedule({
        active: false,
        endTime: new Date().toISOString(),
      });
    } else {
      // Start fasting
      const now = new Date().toISOString();
      updateFastingSchedule({
        active: true,
        startTime: now,
        endTime: null,
      });
    }
  };

  // Reset fasting
  const resetFasting = () => {
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
  };

  // Update target hours
  const updateTargetHours = (hours: number) => {
    updateFastingSchedule({
      targetHours: hours,
    });
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
  }, []);

  const elapsedFormatted = formatTime(timeElapsed);
  const remainingFormatted = formatTime(timeRemaining);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Intermittent Fasting</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="fasting-mode" checked={fastingSchedule.active} onCheckedChange={toggleFasting} />
          <Label htmlFor="fasting-mode">{fastingSchedule.active ? 'Active' : 'Inactive'}</Label>
        </div>
      </div>

      <div className="flex justify-between items-center mb-1 text-sm text-gray-500">
        <span>Progress</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>

      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}>
        <Progress value={progress} className="h-2.5 mb-4" />
      </motion.div>

      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Elapsed</div>
          <div className="font-mono text-lg font-bold">
            {elapsedFormatted.hours}h {elapsedFormatted.minutes}m
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Remaining</div>
          <div className="font-mono text-lg font-bold">
            {remainingFormatted.hours}h {remainingFormatted.minutes}m
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Target</div>
          <div className="font-mono text-lg font-bold">{fastingSchedule.targetHours}h</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Fasting Schedule</div>
            <div className="text-gray-500">{fastingSchedule.targetHours}:8 Protocol</div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Fasting Protocol</h4>
                <Select
                  value={fastingSchedule.targetHours.toString()}
                  onValueChange={(value) => updateTargetHours(parseInt(value))}
                >
                  <SelectTrigger>
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
                <div className="text-xs text-gray-500 mt-2">
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
            className="w-full gap-2"
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

          <Button variant="outline" disabled={!fastingSchedule.startTime} onClick={resetFasting} className="px-3">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {fastingSchedule.active && timeElapsed > 0 && (
          <div className="flex items-center mt-4 p-2 bg-blue-50 text-blue-700 rounded text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Fasting in progress</span>
              {' - '}
              Started at{' '}
              {fastingSchedule.startTime &&
                new Date(fastingSchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

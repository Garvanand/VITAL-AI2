'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  BarChart,
  Moon,
  Clock,
  PlusCircle,
  AlertTriangle,
  BadgeCheck,
  LineChart,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkout } from '../context/workout-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock heart health data
const mockHeartHealthData = {
  restingHeartRate: 68,
  recoveryRate: 85,
  vo2Max: 42.5,
  hrvScore: 78,
  stressScore: 32,
  heartRateZones: [
    { zone: 'Rest', min: 60, max: 70, timeSpent: 12.5 },
    { zone: 'Fat Burn', min: 70, max: 100, timeSpent: 5.3 },
    { zone: 'Cardio', min: 100, max: 140, timeSpent: 2.1 },
    { zone: 'Peak', min: 140, max: 180, timeSpent: 0.5 },
  ],
  weeklyTrends: [
    { day: 'Mon', restingHR: 67, hrvScore: 76 },
    { day: 'Tue', restingHR: 68, hrvScore: 75 },
    { day: 'Wed', restingHR: 65, hrvScore: 79 },
    { day: 'Thu', restingHR: 69, hrvScore: 74 },
    { day: 'Fri', restingHR: 66, hrvScore: 80 },
    { day: 'Sat', restingHR: 64, hrvScore: 82 },
    { day: 'Sun', restingHR: 68, hrvScore: 78 },
  ],
};

export function HeartHealthAssessment() {
  const { heartHealth, updateHeartHealth, userPreferences } = useWorkout();
  const [showAssessment, setShowAssessment] = useState(false);
  const [formData, setFormData] = useState({
    heartRate: heartHealth.heartRate || 0,
    systolic: heartHealth.bloodPressure.systolic || 0,
    diastolic: heartHealth.bloodPressure.diastolic || 0,
    stressLevel: heartHealth.stressLevel || 5,
    sleepHours: heartHealth.sleepHours || 7,
  });
  const [activeTab, setActiveTab] = useState('overview');

  const handleInputChange = (key: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmitAssessment = () => {
    updateHeartHealth({
      heartRate: formData.heartRate,
      bloodPressure: {
        systolic: formData.systolic,
        diastolic: formData.diastolic,
      },
      stressLevel: formData.stressLevel,
      sleepHours: formData.sleepHours,
    });

    setShowAssessment(false);
  };

  // Helper to determine health status
  const getHeartRateStatus = () => {
    if (!heartHealth.heartRate) return { status: 'unknown', message: 'No data available' };

    if (heartHealth.heartRate < 60) {
      return {
        status: 'good',
        message: 'Your resting heart rate is low, which is often a sign of good cardiovascular fitness.',
      };
    } else if (heartHealth.heartRate < 100) {
      return { status: 'normal', message: 'Your heart rate is within normal range.' };
    } else {
      return {
        status: 'alert',
        message: 'Your heart rate is elevated. This could be due to stress, caffeine, or other factors.',
      };
    }
  };

  const getBloodPressureStatus = () => {
    if (!heartHealth.bloodPressure.systolic || !heartHealth.bloodPressure.diastolic) {
      return { status: 'unknown', message: 'No data available' };
    }

    const { systolic, diastolic } = heartHealth.bloodPressure;

    if (systolic < 120 && diastolic < 80) {
      return { status: 'good', message: 'Your blood pressure is normal.' };
    } else if (systolic < 130 && diastolic < 80) {
      return { status: 'normal', message: 'Your blood pressure is elevated but not high.' };
    } else {
      return {
        status: 'alert',
        message: 'Your blood pressure is higher than recommended. Consider consulting a healthcare professional.',
      };
    }
  };

  const getStressStatus = () => {
    if (!heartHealth.stressLevel) return { status: 'unknown', message: 'No data available' };

    if (heartHealth.stressLevel <= 3) {
      return { status: 'good', message: 'Your reported stress level is low.' };
    } else if (heartHealth.stressLevel <= 7) {
      return { status: 'normal', message: "You're experiencing moderate stress levels." };
    } else {
      return { status: 'alert', message: 'Your stress level is high. Consider stress-reduction activities.' };
    }
  };

  const getSleepStatus = () => {
    if (!heartHealth.sleepHours) return { status: 'unknown', message: 'No data available' };

    if (heartHealth.sleepHours >= 7 && heartHealth.sleepHours <= 9) {
      return { status: 'good', message: "You're getting the recommended amount of sleep." };
    } else if (heartHealth.sleepHours >= 6 && heartHealth.sleepHours < 7) {
      return { status: 'normal', message: "You're getting slightly less sleep than recommended." };
    } else {
      return {
        status: 'alert',
        message: heartHealth.sleepHours < 6 ? 'You may not be getting enough sleep.' : 'You might be oversleeping.',
      };
    }
  };

  const heartRateStatus = getHeartRateStatus();
  const bloodPressureStatus = getBloodPressureStatus();
  const stressStatus = getStressStatus();
  const sleepStatus = getSleepStatus();

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <BadgeCheck className="w-5 h-5 text-green-500" />;
      case 'normal':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Calculate health age based on various factors
  const calculateHeartHealthAge = () => {
    // This would normally involve complex calculations using many factors
    // For demo purposes, use a simple calculation
    const baseAge = 30; // Default age if not available
    const activityModifier =
      userPreferences.fitnessLevel === 'advanced' ? -3 : userPreferences.fitnessLevel === 'intermediate' ? -1 : 2;
    const hrModifier =
      mockHeartHealthData.restingHeartRate > 80 ? 2 : mockHeartHealthData.restingHeartRate < 60 ? -2 : 0;
    const healthAge = baseAge + activityModifier + hrModifier;

    return Math.max(18, healthAge); // Ensure minimum age of 18
  };

  const heartHealthAge = calculateHeartHealthAge();

  return (
    <Card className="col-span-full md:col-span-2 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Heart Health Assessment
        </CardTitle>
        <CardDescription>Track and understand your cardiovascular health metrics</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="zones">Heart Rate Zones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="flex flex-col items-center justify-center p-4 bg-rose-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm text-rose-700 font-medium">Heart Health Age</p>
                <h3 className="text-3xl font-bold text-rose-800">{heartHealthAge}</h3>
                <p className="text-xs text-rose-600 mt-1">
                  {heartHealthAge < 30 ? 'Better than your actual age!' : 'Room for improvement'}
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <p className="text-sm text-blue-700 font-medium">Resting Heart Rate</p>
                <h3 className="text-3xl font-bold text-blue-800">{mockHeartHealthData.restingHeartRate}</h3>
                <p className="text-xs text-blue-600 mt-1">bpm</p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-sm text-purple-700 font-medium">HRV Score</p>
                <h3 className="text-3xl font-bold text-purple-800">{mockHeartHealthData.hrvScore}</h3>
                <p className="text-xs text-purple-600 mt-1">ms</p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-sm text-green-700 font-medium">VO2 Max</p>
                <h3 className="text-3xl font-bold text-green-800">{mockHeartHealthData.vo2Max}</h3>
                <p className="text-xs text-green-600 mt-1">ml/kg/min</p>
              </motion.div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Activity className="h-4 w-4 mr-2" />
              Take Heart Health Test
            </Button>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-48 flex items-center justify-center border rounded-md bg-slate-50">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto text-slate-400" />
                <p className="text-sm text-slate-500 mt-2">Weekly heart rate and HRV trends chart would appear here</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mt-4">
              {mockHeartHealthData.weeklyTrends.map((day) => (
                <div key={day.day} className="text-center">
                  <p className="text-xs font-medium">{day.day}</p>
                  <p className="text-xs">{day.restingHR}</p>
                  <div className="w-full bg-blue-100 mt-1" style={{ height: `${day.hrvScore / 2}px` }}></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-center mt-2 text-slate-500">Weekly HRV Score (ms)</p>
          </TabsContent>

          <TabsContent value="zones">
            <div className="space-y-3">
              {mockHeartHealthData.heartRateZones.map((zone) => (
                <div key={zone.zone} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{zone.zone}</p>
                    <p className="text-sm text-slate-500">
                      {zone.min}-{zone.max} bpm
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={
                        zone.zone === 'Rest'
                          ? 'bg-green-500 h-full'
                          : zone.zone === 'Fat Burn'
                            ? 'bg-blue-500 h-full'
                            : zone.zone === 'Cardio'
                              ? 'bg-amber-500 h-full'
                              : 'bg-rose-500 h-full'
                      }
                      style={{ width: `${(zone.timeSpent / 20) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500">{zone.timeSpent} hours this week</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 px-2 py-3 bg-slate-50 rounded-md">
              <div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600">Your time in the fat burn zone has increased by 12% this week</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

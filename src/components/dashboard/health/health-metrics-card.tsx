'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HealthMetric } from '@/utils/health-assessment-api';
import { Activity, Heart, Droplet, Brain, Scale } from 'lucide-react';
import { ReactNode } from 'react';

interface HealthMetricsCardProps {
  metrics: HealthMetric | null;
  isLoading: boolean;
  getTrendIcon: (trend: 'up' | 'down' | 'stable', isGood: boolean) => ReactNode;
  getMetricTrend: (metricName: string) => { value: number; trend: 'up' | 'down' | 'stable' };
}

export function HealthMetricsCard({ metrics, isLoading, getTrendIcon, getMetricTrend }: HealthMetricsCardProps) {
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No data';
    return new Date(dateString).toLocaleDateString();
  };

  // Define metric cards
  const metricCards = [
    {
      title: 'Blood Pressure',
      icon: <Heart className="h-4 w-4 text-primary" />,
      value:
        metrics?.blood_pressure_systolic && metrics?.blood_pressure_diastolic
          ? `${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic} mmHg`
          : 'No data',
      trend: getMetricTrend('bloodPressureSystolic').trend,
      isHigherBetter: false,
      description: 'Systolic/Diastolic',
    },
    {
      title: 'Heart Rate',
      icon: <Activity className="h-4 w-4 text-primary" />,
      value: metrics?.resting_heart_rate ? `${metrics.resting_heart_rate} bpm` : 'No data',
      trend: getMetricTrend('restingHeartRate').trend,
      isHigherBetter: false,
      description: 'Resting',
    },
    {
      title: 'Blood Glucose',
      icon: <Droplet className="h-4 w-4 text-primary" />,
      value: metrics?.blood_glucose_level ? `${metrics.blood_glucose_level} mg/dL` : 'No data',
      trend: getMetricTrend('bloodGlucose').trend,
      isHigherBetter: false,
      description: 'Fasting',
    },
    {
      title: 'Stress Level',
      icon: <Brain className="h-4 w-4 text-primary" />,
      value: metrics?.stress_level !== undefined ? `${metrics.stress_level}/10` : 'No data',
      trend: getMetricTrend('stressLevel').trend,
      isHigherBetter: false,
      description: 'Self-reported',
    },
    {
      title: 'Sleep Quality',
      icon: <Brain className="h-4 w-4 text-primary" />,
      value: metrics?.sleep_quality !== undefined ? `${metrics.sleep_quality}/10` : 'No data',
      trend: getMetricTrend('sleepQuality').trend,
      isHigherBetter: true,
      description: 'Self-reported',
    },
    {
      title: 'BMI',
      icon: <Scale className="h-4 w-4 text-primary" />,
      value: metrics?.bmi ? metrics.bmi.toFixed(1) : 'No data',
      trend: getMetricTrend('bmi').trend,
      isHigherBetter: false,
      description: 'Body Mass Index',
    },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-xl">Health Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !metrics ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No health metrics available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Last updated: {formatDate(metrics.measurement_date)}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {metricCards.map((metric) => (
                <div key={metric.title} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm">{metric.title}</div>
                    {metric.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.value !== 'No data' && getTrendIcon(metric.trend, metric.isHigherBetter)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BodyMeasurement } from '@/utils/workout-api';
import { Scale, TrendingDown, ArrowDown, ArrowUp } from 'lucide-react';

interface BodyMetricsCardProps {
  measurements: BodyMeasurement[];
  isLoading: boolean;
}

export function BodyMetricsCard({ measurements, isLoading }: BodyMetricsCardProps) {
  // Sort measurements by date (newest first)
  const sortedMeasurements = [...(measurements || [])].sort((a, b) => {
    return new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime();
  });

  // Get latest and previous measurements
  const latest = sortedMeasurements[0];
  const previous = sortedMeasurements[1];

  // Calculate metrics
  const currentWeight = latest?.weight || 0;
  const previousWeight = previous?.weight || currentWeight;

  const currentBodyFat = latest?.body_fat || 0;
  const previousBodyFat = previous?.body_fat || currentBodyFat;

  // Calculate changes and trends
  const weightChange = currentWeight - previousWeight;
  const bodyFatChange = currentBodyFat - previousBodyFat;

  const weightTrend =
    weightChange < 0 ? (
      <TrendingDown className="h-4 w-4 text-green-500" />
    ) : weightChange > 0 ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : null;

  const bodyFatTrend =
    bodyFatChange < 0 ? (
      <TrendingDown className="h-4 w-4 text-green-500" />
    ) : bodyFatChange > 0 ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : null;

  // Function to format change value with + or - sign
  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  };

  // Get latest measurement date
  const latestDate = latest?.measurement_date ? new Date(latest.measurement_date).toLocaleDateString() : 'No data';

  return (
    <>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
          <Scale className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{currentWeight ? `${currentWeight} kg` : 'No data'}</div>
                {weightChange !== 0 && latest && previous && (
                  <div className="ml-2 flex items-center text-xs">
                    <span className={weightChange < 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatChange(weightChange)} kg
                    </span>
                    {weightTrend}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Last updated: {latestDate}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Body Fat Percentage</CardTitle>
          <TrendingDown className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{currentBodyFat ? `${currentBodyFat}%` : 'No data'}</div>
                {bodyFatChange !== 0 && latest && previous && (
                  <div className="ml-2 flex items-center text-xs">
                    <span className={bodyFatChange < 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatChange(bodyFatChange)}%
                    </span>
                    {bodyFatTrend}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Last updated: {latestDate}</p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

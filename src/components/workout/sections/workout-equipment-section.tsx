'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, ChevronRight, AlertTriangle, RefreshCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getWorkoutEquipment } from '@/lib/services/exercise-db';

export function WorkoutEquipmentSection() {
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchEquipment = async () => {
    setIsLoading(true);
    setError(null);
    setIsMockData(false);

    try {
      // Keep track of current time to detect if mock data is used (which would be fast)
      const startTime = Date.now();

      const equipment = await getWorkoutEquipment();

      // If response is too fast, it's likely mock data
      const responseTime = Date.now() - startTime;
      if (responseTime < 100) {
        setIsMockData(true);
      }

      setEquipmentList(equipment);
    } catch (err) {
      console.error('Failed to fetch workout equipment:', err);
      setError('Failed to load equipment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Available Workout Equipment
          </div>
          {!isLoading && !error && (
            <Badge variant="outline" className="ml-2 font-normal">
              {equipmentList.length}
            </Badge>
          )}
        </CardTitle>
        {isMockData && (
          <CardDescription className="flex items-center gap-1 text-amber-500 mt-2">
            <Info className="h-4 w-4" />
            <span>Using demo data (API key required for live data)</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg bg-muted p-4 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" className="mx-auto flex items-center gap-1" onClick={fetchEquipment}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {equipmentList.map((equipment, index) => (
              <motion.div
                key={equipment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{equipment}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { WorkoutProvider } from './context/workout-context';
import { PageHeader } from './sections/page-header';
import { WorkoutRecommendations } from './sections/workout-recommendations';
import { MacroTracker } from './sections/macro-tracker';
import { FastingTracker } from './sections/fasting-tracker';
import { GoogleFitIntegration } from './sections/google-fit-integration';
import { RecipeSuggestions } from './sections/recipe-suggestions';
import { WaterIntakeTracker } from './sections/water-intake-tracker';
import { HeartHealthAssessment } from './sections/heart-health-assessment';
import { CalorieTracker } from './sections/calorie-tracker';
import { WorkoutEquipmentSection } from './sections/workout-equipment-section';
import { WorkoutTracker } from './sections/workout-tracker';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WorkoutPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-24 bg-muted/30 rounded-lg animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted/30 rounded-lg animate-pulse"></div>
              <div className="h-64 bg-muted/30 rounded-lg animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted/30 rounded-lg animate-pulse"></div>
              <div className="h-64 bg-muted/30 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WorkoutProvider>
      <div className="min-h-screen pb-20">
        {/* Use the shared login style background */}
        <HomeLoginStyleBackground />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <PageHeader />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tracker">Workout Tracker</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <WorkoutRecommendations />
                  <CalorieTracker />
                  <RecipeSuggestions />
                </div>

                <div className="space-y-6">
                  <MacroTracker />
                  <FastingTracker />
                  <WaterIntakeTracker />
                  <GoogleFitIntegration />
                  <HeartHealthAssessment />
                  <WorkoutEquipmentSection />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracker">
              <WorkoutTracker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WorkoutProvider>
  );
}

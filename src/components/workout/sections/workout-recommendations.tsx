'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, Calendar, ChevronRight, Star, BarChart4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkout } from '../context/workout-context';

// Mock workout data
const WORKOUT_DATA = {
  beginner: [
    {
      id: 'beg-1',
      title: 'Full Body Introduction',
      description: 'A gentle full-body workout perfect for beginners to build foundational strength.',
      duration: 30,
      caloriesBurn: 150,
      difficulty: 'Beginner',
      category: 'Full Body',
      rating: 4.8,
      equipment: ['bodyweight', 'dumbbells'],
      imageUrl:
        'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'beg-2',
      title: 'Cardio Kickstart',
      description: 'Gentle cardio exercises to improve your stamina and heart health.',
      duration: 20,
      caloriesBurn: 180,
      difficulty: 'Beginner',
      category: 'Cardio',
      rating: 4.6,
      equipment: ['bodyweight'],
      imageUrl:
        'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'beg-3',
      title: 'Strength Foundations',
      description: 'Build foundational strength with simple, effective movements.',
      duration: 25,
      caloriesBurn: 140,
      difficulty: 'Beginner',
      category: 'Strength',
      rating: 4.9,
      equipment: ['bodyweight', 'dumbbells'],
      imageUrl:
        'https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ],
  intermediate: [
    {
      id: 'int-1',
      title: 'HIIT Power Circuit',
      description: 'High-intensity interval training to maximize calorie burn and muscular endurance.',
      duration: 45,
      caloriesBurn: 400,
      difficulty: 'Intermediate',
      category: 'HIIT',
      rating: 4.7,
      equipment: ['dumbbells', 'resistance_bands'],
      imageUrl:
        'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'int-2',
      title: 'Upper Body Focus',
      description: 'Target your chest, back, shoulders and arms with this comprehensive workout.',
      duration: 40,
      caloriesBurn: 320,
      difficulty: 'Intermediate',
      category: 'Upper Body',
      rating: 4.8,
      equipment: ['dumbbells', 'resistance_bands', 'bench'],
      imageUrl:
        'https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'int-3',
      title: 'Lower Body Strength',
      description: 'Build strong legs and glutes with this targeted lower body routine.',
      duration: 35,
      caloriesBurn: 350,
      difficulty: 'Intermediate',
      category: 'Lower Body',
      rating: 4.6,
      equipment: ['dumbbells', 'kettlebells'],
      imageUrl:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ],
  advanced: [
    {
      id: 'adv-1',
      title: 'Extreme HIIT Challenge',
      description: 'Push your limits with this intense, high-energy workout designed for maximum results.',
      duration: 60,
      caloriesBurn: 600,
      difficulty: 'Advanced',
      category: 'HIIT',
      rating: 4.9,
      equipment: ['dumbbells', 'kettlebells', 'pullup_bar'],
      imageUrl:
        'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'adv-2',
      title: 'Strength & Power Circuit',
      description: 'Build serious strength and explosive power with complex, compound movements.',
      duration: 55,
      caloriesBurn: 520,
      difficulty: 'Advanced',
      category: 'Strength',
      rating: 4.8,
      equipment: ['dumbbells', 'kettlebells', 'bench', 'pullup_bar'],
      imageUrl:
        'https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'adv-3',
      title: 'Athletic Performance',
      description: 'Enhance athletic performance with plyometrics, agility drills, and strength training.',
      duration: 65,
      caloriesBurn: 580,
      difficulty: 'Advanced',
      category: 'Performance',
      rating: 4.7,
      equipment: ['dumbbells', 'resistance_bands', 'pullup_bar'],
      imageUrl:
        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ],
};

export function WorkoutRecommendations() {
  const { userPreferences, workoutSuggestions, isLoadingWorkouts } = useWorkout();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, we would fetch personalized recommendations from an API
    // based on the user's preferences. Here we're simulating that with mock data.
    const fetchRecommendations = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get workouts based on fitness level
      const levelWorkouts =
        WORKOUT_DATA[userPreferences.fitnessLevel as keyof typeof WORKOUT_DATA] || WORKOUT_DATA.beginner;

      // Filter by available equipment
      const filteredWorkouts = levelWorkouts.filter((workout) =>
        workout.equipment.some((equip) => userPreferences.availableEquipment.includes(equip)),
      );

      setRecommendations(filteredWorkouts);
      setLoading(false);
    };

    fetchRecommendations();
  }, [userPreferences]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recommended Workouts</h2>
        <Button variant="ghost" size="sm" className="gap-1">
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={workout.imageUrl}
                    alt={workout.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-white">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{workout.rating}</span>
                  </div>
                  <Badge className="absolute top-3 right-3">{workout.category}</Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle>{workout.title}</CardTitle>
                  <CardDescription>{workout.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-4 pt-0 flex-grow">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{workout.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{workout.caloriesBurn} cal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{workout.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart4 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Moderate</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full gap-1">
                    Start Workout
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Don't see what you're looking for?</p>
        <Button variant="outline">Browse Workout Library</Button>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { Clock, Flame, ChefHat, Tag, MapPin, Heart, ChevronRight, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IndianRecipe, SpiceLevel } from '@/lib/services/indian-cuisine';
import { FeedbackCollector } from '@/components/common/feedback-collector';

// Helper function to get spice level icon with colors
const getSpiceIcon = (level: SpiceLevel) => {
  const baseIcon = '🌶️';

  switch (level) {
    case 'mild':
      return (
        <span title="Mild" className="text-yellow-500">
          {baseIcon}
        </span>
      );
    case 'medium':
      return (
        <span title="Medium" className="text-orange-500">
          {baseIcon.repeat(2)}
        </span>
      );
    case 'hot':
      return (
        <span title="Hot" className="text-red-500">
          {baseIcon.repeat(3)}
        </span>
      );
    case 'very hot':
      return (
        <span title="Very Hot" className="text-red-600 font-bold">
          {baseIcon.repeat(4)}
        </span>
      );
    default:
      return null;
  }
};

// Helper function to get region icon
const getRegionIcon = (region: string) => {
  switch (region) {
    case 'North':
      return '🔝';
    case 'South':
      return '🔽';
    case 'East':
      return '⏩';
    case 'West':
      return '⏪';
    case 'Central':
      return '⭐';
    default:
      return '🇮🇳';
  }
};

interface RecipeCardProps {
  recipe: IndianRecipe;
  index: number;
  onSpiceLevelChange?: (recipe: IndianRecipe, newLevel: SpiceLevel) => void;
  onAddToFavorites?: (recipe: IndianRecipe) => void;
}

export function RecipeCard({ recipe, index, onSpiceLevelChange, onAddToFavorites }: RecipeCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<SpiceLevel>(recipe.spiceLevel);

  const handleSpiceLevelChange = (level: SpiceLevel) => {
    setSelectedSpiceLevel(level);
    onSpiceLevelChange?.(recipe, level);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite && onAddToFavorites) {
      onAddToFavorites(recipe);
    }
  };

  // Use recipe.responseId if it exists, otherwise use recipe.id as the feedback ID
  const feedbackId = (recipe as any).responseId || recipe.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="bg-white overflow-hidden rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className={cn('absolute inset-0 bg-gray-200 animate-pulse', !isImageLoading && 'hidden')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className={cn(
                  'object-cover transform group-hover:scale-105 transition-transform duration-500',
                  isImageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />

              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{recipe.totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium">{recipe.calories} cal</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-3 right-3 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                  {getSpiceIcon(selectedSpiceLevel)}
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm text-sm flex items-center gap-1.5">
                  <span>{getRegionIcon(recipe.region)}</span>
                  <span className="font-medium">{recipe.region}</span>
                </div>
              </div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
              <h3 className="font-semibold text-lg">{recipe.title}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2 flex-grow">{recipe.description}</p>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-orange-50 p-1.5 rounded-md">
                  <p className="text-xs text-gray-500">Protein</p>
                  <p className="font-medium text-sm">{recipe.protein}g</p>
                </div>
                <div className="bg-green-50 p-1.5 rounded-md">
                  <p className="text-xs text-gray-500">Carbs</p>
                  <p className="font-medium text-sm">{recipe.carbs}g</p>
                </div>
                <div className="bg-blue-50 p-1.5 rounded-md">
                  <p className="text-xs text-gray-500">Fat</p>
                  <p className="font-medium text-sm">{recipe.fat}g</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
                {recipe.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{recipe.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500 flex items-center">
                <ChefHat className="w-3 h-3 mr-1" />
                <span className="line-clamp-1">
                  {recipe.ingredients.length} ingredients • {recipe.servings} servings
                </span>
              </div>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="relative h-64 sm:h-80 -mx-6 -mt-6 overflow-hidden">
              <div className={cn('absolute inset-0 bg-gray-200 animate-pulse', !isImageLoading && 'hidden')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">{recipe.title}</DialogTitle>
                <DialogDescription className="text-gray-200 max-w-2xl">{recipe.description}</DialogDescription>

                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs font-medium">{recipe.region} Indian</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white flex items-center gap-1.5">
                    <Flame className="w-3 h-3" />
                    <span className="text-xs font-medium">{recipe.calories} calories</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">{recipe.totalTime} min total</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 z-20">
                <Button
                  size="icon"
                  variant={isFavorite ? 'default' : 'outline'}
                  className={cn(
                    'rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30',
                    isFavorite && 'bg-red-500 hover:bg-red-600 border-none',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle();
                  }}
                >
                  <Heart className={cn('h-4 w-4', isFavorite ? 'fill-white text-white' : 'text-gray-100')} />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">Spice Level:</h3>
                  <div className="flex gap-2">
                    {(['mild', 'medium', 'hot', 'very hot'] as SpiceLevel[]).map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={selectedSpiceLevel === level ? 'default' : 'outline'}
                        className="text-xs px-2 h-8"
                        onClick={() => handleSpiceLevelChange(level)}
                      >
                        {getSpiceIcon(level as SpiceLevel)}
                        <span className="ml-1 capitalize">{level}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <ChefHat className="w-4 h-4 mr-1.5" />
                  <span>Serves {recipe.servings}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Ingredients
                  </h3>

                  <div className="mt-3 space-y-1.5">
                    {recipe.ingredients.map((ingredient, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <div className="h-5 w-5 rounded-full border-2 border-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-orange-100 transition-colors">
                          <span className="text-orange-600 text-xs">{i + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{ingredient}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-base">Nutrition</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-gray-500">Calories</p>
                        <p className="font-medium">{recipe.calories} kcal</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-gray-500">Protein</p>
                        <p className="font-medium">{recipe.protein}g</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-gray-500">Carbs</p>
                        <p className="font-medium">{recipe.carbs}g</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-gray-500">Fat</p>
                        <p className="font-medium">{recipe.fat}g</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-base">Dietary Notes</h3>
                    <p className="mt-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                      {recipe.dietaryNotes || 'No specific dietary notes for this recipe.'}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <h3 className="font-semibold text-lg flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    Instructions
                  </h3>

                  <div className="mt-3 space-y-4">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-700 font-medium flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-amber-50 rounded-xl p-4">
                    <h3 className="font-semibold text-base text-amber-800">Pro Tips</h3>
                    <ul className="mt-2 space-y-2">
                      {recipe.tips && recipe.tips.length > 0 ? (
                        recipe.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-amber-500" />
                            <span>{tip}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-amber-700">No specific tips provided for this recipe.</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-base">Tags</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="capitalize">
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <FeedbackCollector
                      responseId={feedbackId}
                      responseType="indian-cuisine"
                      context={{
                        recipeId: recipe.id,
                        recipeName: recipe.title,
                        region: recipe.region,
                        spiceLevel: recipe.spiceLevel,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

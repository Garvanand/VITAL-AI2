'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackCollector } from '@/components/common/feedback-collector';
import { ChevronLeft, Clock, Users, ChevronRight, Heart, Leaf, Apple, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface RecipeProps {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutritionalInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
    vitamins?: string[];
    minerals?: string[];
  };
  healthBenefits: string[];
  substitutions?: string[];
  tips?: string;
  imageUrl: string;
}

interface IngredientRecipeResultsProps {
  recipes: RecipeProps[];
  responseId: string;
  onBack: () => void;
}

export function IngredientRecipeResults({ recipes, responseId, onBack }: IngredientRecipeResultsProps) {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);

  const handlePrevRecipe = () => {
    setSelectedRecipeIndex((prev) => (prev > 0 ? prev - 1 : recipes.length - 1));
  };

  const handleNextRecipe = () => {
    setSelectedRecipeIndex((prev) => (prev < recipes.length - 1 ? prev + 1 : 0));
  };

  const selectedRecipe = recipes[selectedRecipeIndex];

  if (!selectedRecipe) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">No Recipes Found</CardTitle>
          <CardDescription>
            We couldn't find any recipes matching your criteria. Please try different ingredients.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrevRecipe} disabled={recipes.length <= 1} size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Recipe {selectedRecipeIndex + 1} of {recipes.length}
          </span>

          <Button onClick={handleNextRecipe} disabled={recipes.length <= 1} size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="w-full overflow-hidden">
        <div className="relative h-64 md:h-80">
          <Image src={selectedRecipe.imageUrl} alt={selectedRecipe.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedRecipe.name}</h1>
            <p className="text-white/90 text-sm md:text-base">{selectedRecipe.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Prep: {selectedRecipe.prepTime} | Cook: {selectedRecipe.cookTime}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Serves {selectedRecipe.servings}</span>
            </div>

            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-green-500" />
              <span className="text-sm">{selectedRecipe.nutritionalInfo.calories} calories per serving</span>
            </div>
          </div>

          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="health">Health Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Apple className="h-5 w-5 text-orange-500" />
                Ingredients
              </h3>

              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>

              {selectedRecipe.substitutions && selectedRecipe.substitutions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Possible Substitutions</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedRecipe.substitutions.map((sub, index) => (
                      <li key={index}>{sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Utensils className="h-5 w-5 text-blue-500" />
                Cooking Instructions
              </h3>

              <ol className="space-y-4">
                {selectedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>

              {selectedRecipe.tips && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Chef's Tips</h4>
                  <p className="text-sm text-muted-foreground">{selectedRecipe.tips}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <h3 className="text-lg font-medium">Nutritional Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Per serving</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-primary/5 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="font-semibold">{selectedRecipe.nutritionalInfo.calories}</p>
                </div>

                <div className="bg-blue-500/5 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="font-semibold">{selectedRecipe.nutritionalInfo.protein}</p>
                </div>

                <div className="bg-amber-500/5 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="font-semibold">{selectedRecipe.nutritionalInfo.carbs}</p>
                </div>

                <div className="bg-red-500/5 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="font-semibold">{selectedRecipe.nutritionalInfo.fat}</p>
                </div>

                {selectedRecipe.nutritionalInfo.fiber && (
                  <div className="bg-green-500/5 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fiber</p>
                    <p className="font-semibold">{selectedRecipe.nutritionalInfo.fiber}</p>
                  </div>
                )}

                {selectedRecipe.nutritionalInfo.sugar && (
                  <div className="bg-purple-500/5 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sugar</p>
                    <p className="font-semibold">{selectedRecipe.nutritionalInfo.sugar}</p>
                  </div>
                )}

                {selectedRecipe.nutritionalInfo.sodium && (
                  <div className="bg-orange-500/5 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sodium</p>
                    <p className="font-semibold">{selectedRecipe.nutritionalInfo.sodium}</p>
                  </div>
                )}
              </div>

              {selectedRecipe.nutritionalInfo.vitamins && selectedRecipe.nutritionalInfo.vitamins.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Vitamins</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.nutritionalInfo.vitamins.map((vitamin, index) => (
                      <Badge key={index} variant="outline" className="px-2 py-1 text-xs font-normal">
                        {vitamin}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecipe.nutritionalInfo.minerals && selectedRecipe.nutritionalInfo.minerals.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Minerals</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.nutritionalInfo.minerals.map((mineral, index) => (
                      <Badge key={index} variant="outline" className="px-2 py-1 text-xs font-normal">
                        {mineral}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Health Benefits
              </h3>

              <ul className="space-y-3">
                {selectedRecipe.healthBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>

          <div className="mt-8 border-t border-border pt-6">
            <FeedbackCollector
              responseId={responseId}
              responseType="recipe"
              context={{ recipeId: selectedRecipe.id }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

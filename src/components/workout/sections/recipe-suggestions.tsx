'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Clock,
  Flame,
  ChevronRight,
  Search,
  Filter,
  Tag,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useWorkout } from '../context/workout-context';
import { getIndianRecipeSuggestions } from '@/lib/services/gemini';
import { RecipeSuggestion } from '@/lib/services/gemini';

// Mock recipe data for fallback
const RECIPE_DATA = [
  {
    id: 'recipe-1',
    title: 'Protein-Packed Quinoa Bowl',
    description: 'A nutrient-dense bowl with quinoa, grilled chicken, avocado, and vegetables.',
    prepTime: 20,
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    tags: ['high-protein', 'low-fat', 'meal-prep'],
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '1 cup cooked quinoa',
      '4 oz grilled chicken breast',
      '1/2 avocado, sliced',
      '1 cup mixed roasted vegetables',
      '2 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Cook quinoa according to package instructions.',
      'Season chicken with salt and pepper, then grill until fully cooked.',
      'Roast vegetables with olive oil at 400°F for 20 minutes.',
      'Assemble bowl with quinoa as base, topped with chicken, vegetables, and avocado.',
      'Drizzle with olive oil and season to taste.',
    ],
  },
  {
    id: 'recipe-2',
    title: 'Overnight Protein Oats',
    description: 'Simple make-ahead breakfast with oats, protein powder, and berries.',
    prepTime: 10,
    calories: 320,
    protein: 25,
    carbs: 45,
    fat: 8,
    tags: ['breakfast', 'meal-prep', 'vegetarian'],
    imageUrl:
      'https://images.unsplash.com/photo-1517093602195-b40af9261882?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '1/2 cup rolled oats',
      '1 scoop protein powder',
      '1 cup almond milk',
      '1 tbsp chia seeds',
      '1/2 cup mixed berries',
      '1 tbsp honey or maple syrup (optional)',
    ],
    instructions: [
      'Mix oats, protein powder, almond milk, and chia seeds in a jar.',
      'Stir well to combine.',
      'Refrigerate overnight or at least 4 hours.',
      'Top with fresh berries and optional sweetener before serving.',
    ],
  },
  {
    id: 'recipe-3',
    title: 'Mediterranean Salmon',
    description: 'Oven-baked salmon with Mediterranean herbs and lemon.',
    prepTime: 25,
    calories: 380,
    protein: 32,
    carbs: 5,
    fat: 25,
    tags: ['high-protein', 'keto', 'low-carb'],
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '6 oz salmon fillet',
      '1 tbsp olive oil',
      '1 lemon, sliced',
      '2 cloves garlic, minced',
      '1 tsp dried oregano',
      '1 tsp dried basil',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Preheat oven to 375°F.',
      'Place salmon on a baking sheet lined with parchment paper.',
      'Drizzle with olive oil and season with garlic, herbs, salt, and pepper.',
      'Top with lemon slices.',
      'Bake for 15-18 minutes until salmon is cooked through.',
    ],
  },
];

// Helper function to get spice level icon
const getSpiceLevelIcon = (level: string) => {
  switch (level) {
    case 'mild':
      return '🌶️';
    case 'medium':
      return '🌶️🌶️';
    case 'hot':
      return '🌶️🌶️🌶️';
    case 'very hot':
      return '🌶️🌶️🌶️🌶️';
    default:
      return '';
  }
};

export function RecipeSuggestions() {
  const { userPreferences, macros } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuisineType, setCuisineType] = useState<'all' | 'indian'>('indian'); // Default to Indian cuisine

  const [filters, setFilters] = useState({
    'high-protein': false,
    'low-carb': false,
    'low-fat': false,
    keto: false,
    vegetarian: false,
    vegan: false,
    'meal-prep': false,
    breakfast: false,
    lunch: false,
    dinner: false,
    mild: false,
    medium: false,
    hot: false,
  });

  // Load Indian recipes on initial load or when cuisine type changes
  useEffect(() => {
    if (cuisineType === 'indian') {
      fetchIndianRecipes();
    } else {
      // Use mock data for non-Indian recipes
      setRecipes(RECIPE_DATA);
    }
  }, [cuisineType]);

  const fetchIndianRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get dietary restrictions from filters
      const dietType = Object.entries(filters)
        .filter(
          ([key, value]) =>
            value && ['vegetarian', 'vegan', 'keto', 'low-carb', 'low-fat', 'high-protein'].includes(key),
        )
        .map(([key]) => key);

      // Get meal type from filters
      const mealTypes = Object.entries(filters)
        .filter(([key, value]) => value && ['breakfast', 'lunch', 'dinner'].includes(key))
        .map(([key]) => key);

      // Get spice level from filters
      const spiceLevels = Object.entries(filters)
        .filter(([key, value]) => value && ['mild', 'medium', 'hot'].includes(key))
        .map(([key]) => key);

      console.log('Requesting Indian recipes with filters:', {
        dietType,
        mealType: mealTypes.length > 0 ? mealTypes[0] : undefined,
        spiceLevels,
      });

      // Add a timestamp to ensure we get fresh results each time
      const timestamp = new Date().getTime();

      const indianRecipes = await getIndianRecipeSuggestions({
        dietType,
        mealType: mealTypes.length > 0 ? mealTypes[0] : undefined,
        timestamp: timestamp.toString(), // Add timestamp to force a new request
        spiceLevel: spiceLevels.length > 0 ? spiceLevels[0] : undefined,
        // We could pass more parameters here in the future
      });

      if (indianRecipes.length === 0) {
        setError('No Indian recipes found. Try different filters or try again later.');
      } else {
        console.log(`Received ${indianRecipes.length} Indian recipes`);
        setRecipes(indianRecipes);
      }
    } catch (err) {
      console.error('Failed to fetch Indian recipes:', err);
      setError('Failed to load Indian recipes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recipes based on search term and filters
  const filteredRecipes = recipes.filter((recipe) => {
    // Search term filter
    if (
      searchTerm &&
      !recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Tag filters
    const activeTagFilters = Object.entries(filters)
      .filter(([key, isActive]) => isActive && !['mild', 'medium', 'hot', 'breakfast', 'lunch', 'dinner'].includes(key))
      .map(([tag]) => tag);

    if (activeTagFilters.length > 0 && !activeTagFilters.some((tag) => recipe.tags.includes(tag))) {
      return false;
    }

    // Spice level filters
    const activeSpiceFilters = Object.entries(filters)
      .filter(([key, isActive]) => isActive && ['mild', 'medium', 'hot'].includes(key))
      .map(([level]) => level);

    if (
      activeSpiceFilters.length > 0 &&
      recipe.spiceLevel &&
      !activeSpiceFilters.some((level) => recipe.spiceLevel?.toLowerCase().includes(level))
    ) {
      return false;
    }

    // Meal type filters
    const activeMealFilters = Object.entries(filters)
      .filter(([key, isActive]) => isActive && ['breakfast', 'lunch', 'dinner'].includes(key))
      .map(([mealType]) => mealType);

    if (activeMealFilters.length > 0 && !activeMealFilters.some((mealType) => recipe.tags.includes(mealType))) {
      return false;
    }

    return true;
  });

  const handleToggleFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      [tag]: !prev[tag as keyof typeof filters],
    }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Recipe Suggestions</h2>

        <div className="flex items-center gap-2">
          {/* Cuisine Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 border-border hover:bg-card/50">
                {cuisineType === 'indian' ? '🇮🇳 Indian' : '🌍 All Cuisines'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup
                value={cuisineType}
                onValueChange={(value: string) => setCuisineType(value as 'all' | 'indian')}
              >
                <DropdownMenuRadioItem value="all">🌍 All Cuisines</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="indian">🇮🇳 Indian</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-9 w-[180px] md:w-[240px] bg-card/30 border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 border-border hover:bg-card/50">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Diet Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters['high-protein']}
                onCheckedChange={() => handleToggleFilter('high-protein')}
              >
                High Protein
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters['low-carb']}
                onCheckedChange={() => handleToggleFilter('low-carb')}
              >
                Low Carb
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters['low-fat']}
                onCheckedChange={() => handleToggleFilter('low-fat')}
              >
                Low Fat
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters['keto']} onCheckedChange={() => handleToggleFilter('keto')}>
                Keto
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters['vegetarian']}
                onCheckedChange={() => handleToggleFilter('vegetarian')}
              >
                Vegetarian
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters['vegan']} onCheckedChange={() => handleToggleFilter('vegan')}>
                Vegan
              </DropdownMenuCheckboxItem>

              <DropdownMenuLabel className="mt-2">Meal Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters['breakfast']}
                onCheckedChange={() => handleToggleFilter('breakfast')}
              >
                Breakfast
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters['lunch']} onCheckedChange={() => handleToggleFilter('lunch')}>
                Lunch
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters['dinner']}
                onCheckedChange={() => handleToggleFilter('dinner')}
              >
                Dinner
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters['meal-prep']}
                onCheckedChange={() => handleToggleFilter('meal-prep')}
              >
                Meal Prep
              </DropdownMenuCheckboxItem>

              {cuisineType === 'indian' && (
                <>
                  <DropdownMenuLabel className="mt-2">Spice Level</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filters['mild']}
                    onCheckedChange={() => handleToggleFilter('mild')}
                  >
                    Mild 🌶️
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters['medium']}
                    onCheckedChange={() => handleToggleFilter('medium')}
                  >
                    Medium 🌶️🌶️
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={filters['hot']} onCheckedChange={() => handleToggleFilter('hot')}>
                    Hot 🌶️🌶️🌶️
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh button for Indian cuisine */}
          {cuisineType === 'indian' && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIndianRecipes}
              disabled={isLoading}
              className="border-primary/30 hover:bg-primary/5 hover:border-primary/50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <RefreshCcw className="h-4 w-4 text-primary" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="border border-border rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm"
            >
              <Skeleton className="h-48 w-full bg-card/50" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 bg-card/50" />
                <Skeleton className="h-4 w-full mb-3 bg-card/50" />
                <Skeleton className="h-4 w-5/6 mb-3 bg-card/50" />
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-8 w-16 bg-card/50" />
                  <Skeleton className="h-8 w-16 bg-card/50" />
                  <Skeleton className="h-8 w-16 bg-card/50" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-16 bg-card/50" />
                  <Skeleton className="h-6 w-16 bg-card/50" />
                  <Skeleton className="h-6 w-16 bg-card/50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card/20 backdrop-blur-sm">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">Couldn't Load Recipes</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIndianRecipes}
            className="mx-auto border-primary/30 hover:bg-primary/5 hover:border-primary/50"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* No results state */}
      {!isLoading && !error && filteredRecipes.length === 0 && (
        <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card/20 backdrop-blur-sm">
          <Utensils className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">No Recipes Found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filters to find more recipes that match your criteria.
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id || `recipe-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className="rounded-lg overflow-hidden border border-border bg-card/30 backdrop-blur-sm cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full flex flex-col"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="relative h-48">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{recipe.prepTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            <span className="text-xs">{recipe.calories} cal</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex-grow">
                      <h3 className="font-medium text-lg mb-1 text-foreground">
                        {recipe.title}
                        {recipe.spiceLevel && cuisineType === 'indian' && (
                          <span className="ml-2">{getSpiceLevelIcon(recipe.spiceLevel)}</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                      <div className="flex justify-between mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Protein</div>
                          <div className="font-medium text-foreground">{recipe.protein}g</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Carbs</div>
                          <div className="font-medium text-foreground">{recipe.carbs}g</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Fat</div>
                          <div className="font-medium text-foreground">{recipe.fat}g</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-auto">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs text-black">
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs text-black">
                            +{recipe.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
                  {selectedRecipe && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                          {selectedRecipe.title}
                          {selectedRecipe.spiceLevel && cuisineType === 'indian' && (
                            <span>{getSpiceLevelIcon(selectedRecipe.spiceLevel)}</span>
                          )}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          {selectedRecipe.description}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4">
                        <div className="mb-6 rounded-lg overflow-hidden">
                          <img
                            src={selectedRecipe.imageUrl}
                            alt={selectedRecipe.title}
                            className="w-full h-64 object-cover"
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-6">
                          <div className="p-3 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Time</div>
                            <div className="font-medium flex items-center justify-center gap-1 text-foreground">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedRecipe.prepTime} min</span>
                            </div>
                          </div>
                          <div className="p-3 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Calories</div>
                            <div className="font-medium flex items-center justify-center gap-1 text-foreground">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span>{selectedRecipe.calories}</span>
                            </div>
                          </div>
                          <div className="p-3 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Protein</div>
                            <div className="font-medium text-foreground">{selectedRecipe.protein}g</div>
                          </div>
                          <div className="p-3 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Carbs</div>
                            <div className="font-medium text-foreground">{selectedRecipe.carbs}g</div>
                          </div>
                        </div>

                        {selectedRecipe.spiceLevel && cuisineType === 'indian' && (
                          <div className="mb-4 p-3 bg-orange-950/20 rounded-lg border border-orange-900/20">
                            <div className="text-sm font-medium flex items-center gap-2 text-foreground">
                              <span>Spice Level:</span>
                              <span className="text-orange-400">
                                {selectedRecipe.spiceLevel} {getSpiceLevelIcon(selectedRecipe.spiceLevel)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-6">
                          {selectedRecipe.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs text-black">
                              {tag.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-foreground">
                              <Tag className="w-4 h-4 text-primary" />
                              Ingredients
                            </h4>
                            <ul className="space-y-2">
                              {selectedRecipe.ingredients.map((ingredient: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check className="w-4 h-4 text-primary mt-0.5" />
                                  <span>{ingredient}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-foreground">
                              <Utensils className="w-4 h-4 text-primary" />
                              Instructions
                            </h4>
                            <ol className="space-y-3">
                              {selectedRecipe.instructions.map((step: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center text-xs">
                                    {i + 1}
                                  </div>
                                  <span className="flex-1">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

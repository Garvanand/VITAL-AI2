'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Filter, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { RecipeCard } from './recipe-card';
import {
  getIndianRecipes,
  adjustSpiceLevel,
  IndianRecipe,
  IndianRegion,
  SpiceLevel,
  DietType,
} from '@/lib/services/indian-cuisine';

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full py-12 flex flex-col items-center justify-center text-center"
  >
    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="text-lg font-medium mb-2">No recipes found</h3>
    <p className="text-gray-500 max-w-md mb-6">{message}</p>
    <Button variant="outline" className="gap-2">
      <RefreshCw className="w-4 h-4" />
      Try different filters
    </Button>
  </motion.div>
);

// Loading state cards
const LoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="border rounded-xl overflow-hidden h-full">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export function RecipeGrid() {
  // State for recipe data
  const [recipes, setRecipes] = useState<IndianRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<IndianRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for filters
  const [selectedRegion, setSelectedRegion] = useState<IndianRegion>('All');
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<SpiceLevel | null>(null);
  const [selectedDietTypes, setSelectedDietTypes] = useState<Record<DietType, boolean>>({
    vegetarian: false,
    vegan: false,
    'gluten-free': false,
    'low-carb': false,
    'high-protein': false,
    'low-fat': false,
    'low-sugar': false,
    'dairy-free': false,
    'nut-free': false,
  });
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);

  // Fetch recipes on initial load
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Apply filters when recipes or filter states change
  useEffect(() => {
    if (recipes.length) {
      applyFilters();
    }
  }, [recipes, searchTerm, selectedRegion, selectedSpiceLevel, selectedDietTypes, selectedMealType, maxPrepTime]);

  // Function to fetch recipes from API
  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare filter parameters
      const dietaryFilters = Object.entries(selectedDietTypes)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type as DietType);

      // Call API with filters
      const data = await getIndianRecipes({
        region: selectedRegion,
        dietType: dietaryFilters.length ? dietaryFilters : undefined,
        spiceLevel: selectedSpiceLevel || undefined,
        mealType: (selectedMealType as any) || undefined,
        maxPrepTime: maxPrepTime || undefined,
      });

      setRecipes(data);
      setFilteredRecipes(data);
    } catch (err) {
      console.error('Failed to fetch Indian recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to apply filters to the loaded recipes
  const applyFilters = () => {
    let filtered = [...recipes];

    // Apply text search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(lowerCaseSearch) ||
          recipe.description.toLowerCase().includes(lowerCaseSearch) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(lowerCaseSearch)),
      );
    }

    // Apply region filter
    if (selectedRegion !== 'All') {
      filtered = filtered.filter((recipe) => recipe.region === selectedRegion);
    }

    // Apply spice level filter
    if (selectedSpiceLevel) {
      filtered = filtered.filter((recipe) => recipe.spiceLevel === selectedSpiceLevel);
    }

    // Apply dietary filters
    const activeDietTypes = Object.entries(selectedDietTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);

    if (activeDietTypes.length) {
      filtered = filtered.filter((recipe) => activeDietTypes.some((dietType) => recipe.tags.includes(dietType)));
    }

    // Apply meal type filter
    if (selectedMealType) {
      filtered = filtered.filter((recipe) => recipe.tags.includes(selectedMealType));
    }

    // Apply prep time filter
    if (maxPrepTime) {
      filtered = filtered.filter((recipe) => recipe.prepTime <= maxPrepTime);
    }

    setFilteredRecipes(filtered);
  };

  // Handle changing spice level for a recipe
  const handleSpiceLevelChange = (recipe: IndianRecipe, newLevel: SpiceLevel) => {
    const adjustedRecipe = adjustSpiceLevel(recipe, newLevel);

    // Update the recipe in both arrays
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? adjustedRecipe : r)));
    setFilteredRecipes((prev) => prev.map((r) => (r.id === recipe.id ? adjustedRecipe : r)));
  };

  // Handle adding a recipe to favorites
  const handleAddToFavorites = (recipe: IndianRecipe) => {
    // In a real app, this would save to database or localStorage
    console.log('Added to favorites:', recipe.title);
  };

  // Handle clearing all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('All');
    setSelectedSpiceLevel(null);
    setSelectedMealType(null);
    setMaxPrepTime(null);

    // Reset dietary filters
    const resetDietTypes = Object.keys(selectedDietTypes).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as Record<DietType, boolean>,
    );
    setSelectedDietTypes(resetDietTypes as Record<DietType, boolean>);

    // Reset to original recipes
    setFilteredRecipes(recipes);
  };

  // Count active filters
  const activeFilterCount = [
    selectedRegion !== 'All',
    selectedSpiceLevel !== null,
    selectedMealType !== null,
    maxPrepTime !== null,
    Object.values(selectedDietTypes).some(Boolean),
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Filter Recipes</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">Region</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedRegion}
                  onValueChange={(value) => setSelectedRegion(value as IndianRegion)}
                >
                  <DropdownMenuRadioItem value="All">All Regions</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="North">North Indian</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="South">South Indian</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="East">East Indian</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="West">West Indian</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Central">Central Indian</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Spice Level</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedSpiceLevel || ''}
                  onValueChange={(value) => setSelectedSpiceLevel((value as SpiceLevel) || null)}
                >
                  <DropdownMenuRadioItem value="">Any Spice Level</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mild">Mild</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="hot">Hot</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="very hot">Very Hot</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Dietary Preferences</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={selectedDietTypes.vegetarian}
                  onCheckedChange={(checked) => setSelectedDietTypes((prev) => ({ ...prev, vegetarian: !!checked }))}
                >
                  Vegetarian
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedDietTypes.vegan}
                  onCheckedChange={(checked) => setSelectedDietTypes((prev) => ({ ...prev, vegan: !!checked }))}
                >
                  Vegan
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedDietTypes['gluten-free']}
                  onCheckedChange={(checked) => setSelectedDietTypes((prev) => ({ ...prev, 'gluten-free': !!checked }))}
                >
                  Gluten Free
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedDietTypes['high-protein']}
                  onCheckedChange={(checked) =>
                    setSelectedDietTypes((prev) => ({ ...prev, 'high-protein': !!checked }))
                  }
                >
                  High Protein
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedDietTypes['low-carb']}
                  onCheckedChange={(checked) => setSelectedDietTypes((prev) => ({ ...prev, 'low-carb': !!checked }))}
                >
                  Low Carb
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Meal Type</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedMealType || ''}
                  onValueChange={(value) => setSelectedMealType(value || null)}
                >
                  <DropdownMenuRadioItem value="">Any Meal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="breakfast">Breakfast</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lunch">Lunch</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dinner">Dinner</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="snack">Snack</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dessert">Dessert</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <div className="p-2">
                <Button size="sm" variant="outline" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={fetchRecipes} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState message={error} />
      ) : filteredRecipes.length === 0 ? (
        <EmptyState message="Try changing your filters or search criteria to find more delicious Indian recipes." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={index}
              onSpiceLevelChange={handleSpiceLevelChange}
              onAddToFavorites={handleAddToFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}

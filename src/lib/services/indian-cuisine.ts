// Gemini API service for Indian cuisine recipes with enhanced features

/**
 * Represents a region of Indian cuisine
 */
export type IndianRegion = 'North' | 'South' | 'East' | 'West' | 'Central' | 'All';

/**
 * Represents a spice level for Indian cuisine
 */
export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'very hot';

/**
 * Dietary preferences
 */
export type DietType =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'low-carb'
  | 'high-protein'
  | 'low-fat'
  | 'low-sugar'
  | 'dairy-free'
  | 'nut-free';

/**
 * Request parameters for Indian cuisine recipe suggestions
 */
export interface IndianRecipeRequest {
  region?: IndianRegion;
  dietType?: DietType[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  ingredients?: string[];
  excludeIngredients?: string[];
  maxPrepTime?: number;
  spiceLevel?: SpiceLevel;
  servings?: number;
}

/**
 * Structured response for an Indian cuisine recipe
 */
export interface IndianRecipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  region: IndianRegion;
  tags: string[];
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  spiceLevel: SpiceLevel;
  dietaryNotes?: string;
  tips?: string[];
}

/**
 * Fetches Indian cuisine recipe suggestions using Gemini 2.0 Flash
 */
export async function getIndianRecipes(params: IndianRecipeRequest): Promise<IndianRecipe[]> {
  try {
    console.log('Fetching Indian recipe suggestions with params:', JSON.stringify(params));

    const response = await fetch('/api/gemini/indian-cuisine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response contains mock data (for debugging)
    if (data._source === 'mock') {
      console.log('Received mock Indian recipe data as API fallback');
    }

    return data.recipes || [];
  } catch (error) {
    console.error('Error fetching Indian recipe suggestions:', error);
    throw error; // Re-throw to allow component to handle
  }
}

/**
 * Adjusts the spice level of an existing recipe
 */
export function adjustSpiceLevel(recipe: IndianRecipe, newLevel: SpiceLevel): IndianRecipe {
  // Deep clone the recipe to avoid mutations
  const adjustedRecipe = JSON.parse(JSON.stringify(recipe));

  // Update the spice level
  adjustedRecipe.spiceLevel = newLevel;

  // Add a tag indicating spice adjustment
  if (!adjustedRecipe.tags.includes('spice-adjusted')) {
    adjustedRecipe.tags.push('spice-adjusted');
  }

  return adjustedRecipe;
}

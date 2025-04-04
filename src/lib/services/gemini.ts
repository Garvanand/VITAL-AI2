// Gemini API service for recipe suggestions

export interface RecipeSuggestionRequest {
  cuisine?: string;
  dietType?: string[];
  mealType?: string;
  ingredients?: string[];
  excludeIngredients?: string[];
  maxPrepTime?: number;
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  spiceLevel?: string;
}

export async function getRecipeSuggestions(params: RecipeSuggestionRequest): Promise<RecipeSuggestion[]> {
  try {
    console.log('Fetching recipe suggestions with params:', JSON.stringify(params));

    const response = await fetch('/api/gemini/recipes', {
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
      console.log('Received mock recipe data as API fallback');
    }

    return data.recipes || [];
  } catch (error) {
    console.error('Error fetching recipe suggestions:', error);
    throw error; // Re-throw to allow component to handle
  }
}

export async function getIndianRecipeSuggestions(
  params: Omit<RecipeSuggestionRequest, 'cuisine'> = {},
): Promise<RecipeSuggestion[]> {
  try {
    return await getRecipeSuggestions({
      ...params,
      cuisine: 'Indian',
    });
  } catch (error) {
    console.error('Error fetching Indian recipe suggestions:', error);
    return []; // Return empty array to avoid breaking the UI
  }
}

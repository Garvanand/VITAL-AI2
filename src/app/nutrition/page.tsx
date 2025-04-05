'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IngredientRecipeForm } from '@/components/nutrition/ingredient-recipe-form';
import { IngredientRecipeResults } from '@/components/nutrition/ingredient-recipe-results';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Fallback recipe data to use if API is unavailable
const FALLBACK_RECIPES = [
  {
    id: 'fallback-recipe-1',
    name: 'Mediterranean Quinoa Bowl',
    description: 'A nutritious and flavorful bowl packed with protein, fresh vegetables, and Mediterranean flavors.',
    prepTime: '15 minutes',
    cookTime: '20 minutes',
    servings: 2,
    ingredients: [
      '1 cup cooked quinoa',
      '1 cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 red onion, thinly sliced',
      '1/4 cup kalamata olives, pitted',
      '1/2 cup feta cheese, crumbled',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Cook quinoa according to package instructions and let cool.',
      'In a large bowl, combine cooled quinoa, cucumber, tomatoes, red onion, and olives.',
      'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.',
      'Pour dressing over the quinoa mixture and toss to combine.',
      'Top with crumbled feta cheese and serve chilled.',
    ],
    nutritionalInfo: {
      calories: 380,
      protein: '12g',
      carbs: '45g',
      fat: '18g',
      fiber: '6g',
      vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'],
      minerals: ['Iron', 'Calcium', 'Magnesium'],
    },
    healthBenefits: [
      'Rich in plant-based protein from quinoa',
      'High in antioxidants from fresh vegetables',
      'Good source of heart-healthy monounsaturated fats from olive oil',
      'Contains anti-inflammatory properties from olive oil and vegetables',
    ],
    substitutions: ['Replace feta with avocado for a dairy-free option', 'Swap quinoa with couscous or brown rice'],
    tips: 'For extra protein, add grilled chicken or chickpeas. This bowl can be made ahead and refrigerated for up to 3 days.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
  },
];

interface PageHeaderProps {
  title: string;
  description?: string;
}

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-lg text-muted-foreground max-w-3xl">{description}</p>}
    </div>
  );
}

interface Recipe {
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

export default function NutritionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string>('');
  const [activeView, setActiveView] = useState<'form' | 'results'>('form');
  const [missingApiKey, setMissingApiKey] = useState<boolean>(false);

  // Check for API key issues on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health/gemini');
        const data = await response.json();

        if (!response.ok) {
          setMissingApiKey(true);
          console.error('Gemini API key issue:', data.error);
        }
      } catch (err) {
        console.error('Error checking API status:', err);
      }
    };

    checkApiStatus();
  }, []);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const newResponseId = uuidv4();
      setResponseId(newResponseId);

      const response = await fetch('/api/recipes/from-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: formData.ingredients,
          dietaryPreferences: formData.dietaryPreferences || [],
          mealType: formData.mealType,
          healthFocus: formData.healthFocus || [],
          excludeIngredients: formData.excludeIngredients || [],
          responseId: newResponseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from API response
        const errorMessage = data.message || data.error || 'Failed to fetch recipes';

        // Handle API key errors specially
        if (errorMessage.includes('API key') || errorMessage.includes('Configuration error')) {
          setMissingApiKey(true);
        }

        throw new Error(errorMessage);
      }

      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
        setActiveView('results');
      } else {
        setError('No recipes found. Please try with different ingredients or dietary preferences.');
      }
    } catch (err) {
      console.error('Recipe error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // If there was a serious API error, provide fallback recipes
      // so users can still experience the feature
      if (errorMessage.includes('API') || errorMessage.includes('parse')) {
        console.log('Using fallback recipes due to API error');
        setRecipes(FALLBACK_RECIPES);
        setActiveView('results');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setActiveView('form');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Nutrition & Healthy Recipes"
        description="Find healthy recipes based on ingredients you have, with detailed nutritional information and health benefits."
      />

      {missingApiKey && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Missing or Invalid</AlertTitle>
          <AlertDescription>
            The Gemini API key appears to be missing or invalid. Recipe generation may not work properly. Please add a
            valid Gemini API key to your .env.local file and restart the server.
          </AlertDescription>
        </Alert>
      )}

      {activeView === 'form' && (
        <div className="mt-8">
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="ingredients">Search by Ingredients</TabsTrigger>
              <TabsTrigger value="health" disabled>
                Health Goals (Coming Soon)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients">
              <IngredientRecipeForm onSubmit={handleFormSubmit} isLoading={isLoading} error={error} />
            </TabsContent>

            <TabsContent value="health">
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Soon you'll be able to select specific health goals and get personalized recipe recommendations.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeView === 'results' && recipes.length > 0 && (
        <IngredientRecipeResults recipes={recipes} responseId={responseId} onBack={handleBackToSearch} />
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveFeedback } from '@/lib/services/llm-tuning';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RequestBody {
  ingredients: string[];
  dietaryPreferences: string[];
  mealType: string;
  healthFocus: string[];
  excludeIngredients?: string[];
  responseId: string;
}

interface Recipe {
  id?: string;
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

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing Gemini API key');
      return NextResponse.json({ error: 'Configuration error - missing API key' }, { status: 500 });
    }

    // Parse request body
    const body: RequestBody = await request.json();
    const { ingredients, dietaryPreferences, mealType, healthFocus, excludeIngredients = [], responseId } = body;

    // Validate required fields
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: 'Ingredients are required' }, { status: 400 });
    }

    // Construct prompt for Gemini
    const prompt = `
      As a professional nutritionist and chef, create 3 healthy recipes based on these ingredients: ${ingredients.join(', ')}.
      
      Dietary preferences: ${dietaryPreferences.join(', ') || 'None specified'}
      Meal type: ${mealType}
      Health focus areas: ${healthFocus.join(', ') || 'None specified'}
      ${excludeIngredients.length > 0 ? `Exclude these ingredients: ${excludeIngredients.join(', ')}` : ''}
      
      For each recipe, provide:
      1. A creative recipe name
      2. A brief, appetizing description
      3. List of all ingredients with measurements
      4. Step-by-step cooking instructions
      5. Preparation time and cooking time
      6. Number of servings
      7. Detailed nutritional information (calories, protein, carbs, fat, fiber, vitamins, minerals)
      8. Health benefits related to the ingredients
      9. Possible ingredient substitutions for dietary restrictions
      10. Cooking tips for best results
      
      Format your response as JSON with this structure:
      {
        "recipes": [
          {
            "id": "unique-id-1",
            "name": "Recipe Name",
            "description": "Brief description",
            "prepTime": "15 minutes",
            "cookTime": "30 minutes",
            "servings": 4,
            "ingredients": ["1 cup ingredient 1", "2 tbsp ingredient 2"],
            "instructions": ["Step 1", "Step 2"],
            "nutritionalInfo": {
              "calories": 350,
              "protein": "20g",
              "carbs": "30g",
              "fat": "15g",
              "fiber": "5g",
              "sugar": "10g", 
              "sodium": "300mg",
              "vitamins": ["Vitamin A", "Vitamin C"],
              "minerals": ["Iron", "Calcium"]
            },
            "healthBenefits": ["Benefit 1", "Benefit 2"],
            "substitutions": ["Sub 1", "Sub 2"],
            "tips": "Tips for the recipe",
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
        ]
      }
      
      For imageUrl, provide relevant high-quality food images from Unsplash that showcase healthy dishes similar to what you're describing.
      Make sure your response is valid JSON that can be parsed with JSON.parse().
    `;

    // Set up model
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4000,
      },
    });

    console.log('Sending request to Gemini API with ingredients:', ingredients);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini API');

    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Parse the JSON response
      const jsonResponse = JSON.parse(cleanedText);

      // Add unique IDs to recipes if they don't have them
      if (jsonResponse.recipes && Array.isArray(jsonResponse.recipes)) {
        jsonResponse.recipes = jsonResponse.recipes.map((recipe: Recipe, index: number) => {
          if (!recipe.id) {
            recipe.id = `recipe-${responseId}-${index}`;
          }
          return recipe;
        });
      }

      // Create response with cookie
      const nextResponse = NextResponse.json(jsonResponse);

      // Set a cookie to track the response
      nextResponse.cookies.set('lastRecipeResponse', responseId, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return nextResponse;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response text:', text.substring(0, 500)); // Log partial response for debugging

      // Return an error instead of mock data
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          message: 'The AI generated an invalid response. Please try again with different ingredients.',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

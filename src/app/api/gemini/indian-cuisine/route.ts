import { NextRequest, NextResponse } from 'next/server';
import { IndianRecipeRequest, IndianRegion, SpiceLevel } from '@/lib/services/indian-cuisine';
import { MOCK_INDIAN_RECIPES, getRegionalImages } from '@/data/mock-indian-cuisine';
import { getOptimizedParameters } from '@/lib/services/llm-tuning';

// High-quality images for Indian dishes
const INDIAN_FOOD_IMAGES = {
  North: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Butter Chicken
    'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Tandoori Chicken
    'https://images.unsplash.com/photo-1589647363613-f6ea0103581c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Naan
  ],
  South: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Dosa
    'https://images.unsplash.com/photo-1610192244261-3f33de3f72e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Idli Sambar
    'https://images.unsplash.com/photo-1626515405415-d7b6371941b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Kerala Fish Curry
  ],
  East: [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Bengali Fish Curry
    'https://images.unsplash.com/photo-1631292784640-2b24be416617?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Rasgulla
    'https://images.unsplash.com/photo-1566043010709-8b65e0621d6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Momos
  ],
  West: [
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Pav Bhaji
    'https://images.unsplash.com/photo-1617692855027-33b14f061079?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Biryani
    'https://images.unsplash.com/photo-1579364275693-9f6e3b1cb1fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Dhokla
  ],
  Central: [
    'https://images.unsplash.com/photo-1631916969933-bcd1ab93edda?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Paneer Tikka
    'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Samosa
    'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Poha
  ],
  All: [
    'https://images.unsplash.com/photo-1596797038530-2c107aa7ad9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Indian Thali
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Naan with Curry
    'https://images.unsplash.com/photo-1601576060906-b4b3418afed9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Indian Street Food
  ],
};

// Helper function to get appropriate images based on region
const getRegionalImages = (region: IndianRegion): string[] => {
  return INDIAN_FOOD_IMAGES[region] || INDIAN_FOOD_IMAGES['All'];
};

export async function POST(request: NextRequest) {
  try {
    const body: IndianRecipeRequest = await request.json();
    const {
      region = 'All',
      dietType = [],
      mealType,
      ingredients = [],
      excludeIngredients = [],
      maxPrepTime,
      spiceLevel,
      servings,
    } = body;

    // Create an enhanced prompt for Gemini 2.0 Flash
    let prompt = `Generate 3 authentic ${region} Indian cuisine recipes`;

    if (dietType && dietType.length > 0) {
      prompt += ` suitable for ${dietType.join(', ')} diet`;
    }

    if (mealType) {
      prompt += ` for ${mealType}`;
    }

    if (ingredients && ingredients.length > 0) {
      prompt += ` using ${ingredients.join(', ')}`;
    }

    if (excludeIngredients && excludeIngredients.length > 0) {
      prompt += ` without ${excludeIngredients.join(', ')}`;
    }

    if (maxPrepTime) {
      prompt += ` that can be prepared in under ${maxPrepTime} minutes`;
    }

    if (spiceLevel) {
      prompt += ` with ${spiceLevel} spice level`;
    }

    if (servings) {
      prompt += ` for ${servings} servings`;
    }

    prompt += `. Format the response as a JSON object with this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "region": "Region of India",
      "description": "Brief description of the dish",
      "prepTime": "30 minutes",
      "cookTime": "45 minutes",
      "servings": 4,
      "spiceLevel": "Medium",
      "ingredients": [
        "1 cup ingredient one",
        "2 tablespoons ingredient two"
      ],
      "instructions": [
        "Step 1: Do this",
        "Step 2: Do that"
      ],
      "nutritionalInfo": {
        "calories": 350,
        "protein": "15g",
        "carbs": "30g",
        "fat": "12g"
      },
      "tips": "Optional cooking tips"
    }
  ]
}

Focus on authentic ${region} Indian recipes only. Make sure all values are provided in the required format. Be detailed and precise with ingredient quantities and cooking instructions.`;

    try {
      // Verify API key exists
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Gemini API key is missing');
        throw new Error('API key is missing');
      }

      // Check if the API key looks valid (basic validation)
      if (!apiKey.startsWith('AIza')) {
        console.error('Gemini API key appears to be invalid');
        throw new Error('API key appears to be invalid');
      }

      // Get optimized parameters for indian-cuisine
      const optimizedParams = getOptimizedParameters('indian-cuisine');

      // Log request information for debugging
      console.log(`Making Gemini 2.0 Flash API request with prompt length: ${prompt.length}`);
      console.log('Using optimized parameters:', optimizedParams);

      // Make the request to Gemini 2.0 Flash API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: optimizedParams.temperature,
              topP: optimizedParams.topP,
              topK: optimizedParams.topK,
              maxOutputTokens: optimizedParams.maxOutputTokens,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
            ],
          }),
        },
      );

      // Create a unique response ID for feedback tracking
      const responseId = `indian-cuisine-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      // Log response status for debugging
      console.log(`Gemini API response status: ${geminiResponse.status}`);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        const status = geminiResponse.status;

        // Handle specific error cases
        if (status === 400) {
          console.error('Gemini API error: Bad request. Check your prompt formatting.');
        } else if (status === 401) {
          console.error('Gemini API error: Unauthorized. Check your API key.');
        } else if (status === 403) {
          console.error('Gemini API error: Forbidden. Your API key might not have access to this model.');
        } else if (status === 429) {
          console.error('Gemini API error: Rate limit exceeded. Reduce request frequency or upgrade your plan.');
        } else if (status === 500 || status === 503) {
          console.error('Gemini API error: Server error. The service might be experiencing issues.');
        } else {
          console.error(`Gemini API error: ${status}, ${errorText}`);
        }

        throw new Error(`Gemini API error: ${status}`);
      }

      const geminiData = await geminiResponse.json();

      // Check if the response has the expected structure
      if (
        !geminiData.candidates ||
        !geminiData.candidates[0] ||
        !geminiData.candidates[0].content ||
        !geminiData.candidates[0].content.parts ||
        !geminiData.candidates[0].content.parts[0]
      ) {
        console.error('Unexpected Gemini API response format:', JSON.stringify(geminiData));
        throw new Error('Invalid response format from Gemini API');
      }

      // Process the response to extract the JSON part
      let responseText = geminiData.candidates[0].content.parts[0].text;

      // Extract the JSON object from the response if needed
      let jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/) ||
        responseText.match(/\{[\s\S]*\}/);

      let recipesData;

      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          recipesData = JSON.parse(jsonStr);
        } catch (error) {
          console.error('Failed to parse JSON from Gemini response:', error);
          console.log('Raw response:', responseText);
          throw new Error('Failed to parse JSON from API response');
        }
      } else {
        console.error('No JSON found in the response:', responseText);
        throw new Error('No valid JSON found in API response');
      }

      // Ensure recipes array exists
      if (!recipesData.recipes || !Array.isArray(recipesData.recipes)) {
        console.error('No recipes array in parsed data:', recipesData);
        throw new Error('No recipes found in API response');
      }

      // Add IDs and high-quality image URLs to each recipe based on region
      const regionalImages = getRegionalImages(region as IndianRegion);

      const enhancedRecipes = recipesData.recipes.map((recipe: any, index: number) => {
        // Determine the region from the recipe or use the requested region
        const recipeRegion = recipe.region || region;

        // Get images for that specific region
        const imagesForRegion = getRegionalImages(recipeRegion as IndianRegion);

        return {
          ...recipe,
          id: `indian-recipe-${Date.now()}-${index}`,
          imageUrl: imagesForRegion[index % imagesForRegion.length],
        };
      });

      return NextResponse.json({
        recipes: enhancedRecipes,
        responseId: responseId,
        responseType: 'indian-cuisine',
      });
    } catch (apiError) {
      console.error('Error with Gemini API call:', apiError);

      // Return mock data as fallback when API fails
      console.log('Using mock Indian recipes as fallback');

      // Filter mock recipes by region if specified
      let mockRecipes = MOCK_INDIAN_RECIPES;
      if (region !== 'All') {
        mockRecipes = MOCK_INDIAN_RECIPES.filter((recipe) => recipe.region === region);
      }

      // Filter by spice level if specified
      if (spiceLevel) {
        mockRecipes = mockRecipes.filter((recipe) => recipe.spiceLevel === spiceLevel);
      }

      // Create a fallback response ID
      const fallbackResponseId = `indian-cuisine-fallback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      return NextResponse.json({
        recipes: mockRecipes.length > 0 ? mockRecipes : MOCK_INDIAN_RECIPES,
        responseId: fallbackResponseId,
        responseType: 'indian-cuisine',
        _source: 'mock', // indicator that these are mock recipes
      });
    }
  } catch (error) {
    console.error('Error processing Indian recipe request:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Indian recipe suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

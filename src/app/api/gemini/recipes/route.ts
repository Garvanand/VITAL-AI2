import { NextRequest, NextResponse } from 'next/server';
import { RecipeSuggestionRequest } from '@/lib/services/gemini';

// Sample images for Indian dishes (to ensure we have good image URLs)
const INDIAN_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Butter Chicken
  'https://images.unsplash.com/photo-1617692855027-33b14f061079?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Biryani
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Dosa
  'https://images.unsplash.com/photo-1631916969933-bcd1ab93edda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Paneer Tikka
  'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Samosa
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Curry
  'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Naan
];

// Mock data to use as fallback when API fails or for testing
const MOCK_INDIAN_RECIPES = [
  {
    id: 'indian-recipe-1',
    title: 'Butter Chicken',
    description: 'Creamy tomato curry with tender chicken pieces, a classic North Indian dish.',
    prepTime: 40,
    calories: 550,
    protein: 35,
    carbs: 30,
    fat: 30,
    spiceLevel: 'medium',
    tags: ['high-protein', 'north-indian', 'chicken', 'creamy'],
    imageUrl:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '500g boneless chicken, cut into pieces',
      '2 tbsp butter',
      '1 large onion, finely chopped',
      '2 tbsp ginger-garlic paste',
      '2 green chilies, slit',
      '1 cup tomato puree',
      '1 tsp red chili powder',
      '1 tsp garam masala',
      '1/2 tsp turmeric powder',
      '1/2 cup heavy cream',
      'Salt to taste',
      'Fresh coriander for garnish',
    ],
    instructions: [
      'Marinate chicken with yogurt, salt, and spices for 30 minutes.',
      'Heat butter in a pan and sauté onions until golden brown.',
      'Add ginger-garlic paste and green chilies, cook for 2 minutes.',
      'Add tomato puree and cook until oil separates.',
      'Add chicken and cook for 15 minutes until tender.',
      'Stir in cream and simmer for 5 minutes.',
      'Garnish with fresh coriander and serve hot with naan or rice.',
    ],
  },
  {
    id: 'indian-recipe-2',
    title: 'Masala Dosa',
    description: 'Crispy fermented crepe filled with spiced potato filling, a South Indian breakfast staple.',
    prepTime: 30,
    calories: 350,
    protein: 8,
    carbs: 60,
    fat: 10,
    spiceLevel: 'mild',
    tags: ['vegetarian', 'south-indian', 'breakfast', 'gluten-free'],
    imageUrl:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '2 cups rice',
      '1 cup urad dal (black gram)',
      '1/4 tsp fenugreek seeds',
      'Salt to taste',
      '4 potatoes, boiled and mashed',
      '1 onion, finely chopped',
      '1 tsp mustard seeds',
      '1 tsp cumin seeds',
      '2 green chilies, chopped',
      '1/2 tsp turmeric powder',
      'Few curry leaves',
      'Oil for cooking',
    ],
    instructions: [
      'Wash and soak rice and dal separately for 6 hours.',
      'Grind them into a smooth batter and ferment overnight.',
      'For the filling, heat oil and add mustard seeds, cumin, curry leaves.',
      'Add onions, green chilies, and sauté until golden.',
      'Add turmeric, potatoes, and salt. Mix well.',
      'Heat a flat pan, pour a ladleful of batter and spread in a circular motion.',
      'Drizzle oil around the edges and cook until golden brown.',
      'Place potato filling in the center, fold, and serve hot with coconut chutney and sambar.',
    ],
  },
  {
    id: 'indian-recipe-3',
    title: 'Paneer Tikka',
    description: 'Grilled cottage cheese cubes marinated in spicy yogurt, a popular vegetarian appetizer.',
    prepTime: 25,
    calories: 320,
    protein: 18,
    carbs: 12,
    fat: 22,
    spiceLevel: 'hot',
    tags: ['vegetarian', 'appetizer', 'high-protein', 'north-indian'],
    imageUrl:
      'https://images.unsplash.com/photo-1631916969933-bcd1ab93edda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '250g paneer (cottage cheese), cut into cubes',
      '1 bell pepper, cut into squares',
      '1 onion, cut into squares',
      '1/2 cup yogurt',
      '1 tbsp ginger-garlic paste',
      '1 tsp red chili powder',
      '1/2 tsp garam masala',
      '1/2 tsp chaat masala',
      '1/4 tsp turmeric powder',
      '1 tbsp lemon juice',
      '2 tbsp oil',
      'Salt to taste',
    ],
    instructions: [
      'Mix yogurt with all the spices, ginger-garlic paste, lemon juice, and salt.',
      'Add paneer, bell pepper, and onion to the marinade and coat well.',
      'Refrigerate for at least 30 minutes or overnight for best results.',
      'Preheat oven to 200°C (400°F).',
      'Thread the marinated paneer and vegetables onto skewers.',
      'Brush with oil and bake for 15 minutes, turning once halfway.',
      'Alternatively, grill on a pan until charred on all sides.',
      'Sprinkle with chaat masala and serve hot with mint chutney.',
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: RecipeSuggestionRequest = await request.json();
    const {
      cuisine = 'Indian',
      dietType = [],
      mealType,
      ingredients = [],
      excludeIngredients = [],
      maxPrepTime,
    } = body;

    // Create a prompt for Gemini API
    let prompt = `Generate 3 ${cuisine} cuisine recipes`;

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

    prompt += `. For each recipe, provide the following details:
    1. A creative recipe name
    2. Short description (1-2 sentences)
    3. Preparation time in minutes (just the number)
    4. Nutritional information: approximate calories, protein (g), carbs (g), fat (g)
    5. List of ingredients with quantities
    6. Step-by-step cooking instructions
    7. Tags (like "high-protein", "low-carb", "vegetarian", "spicy", etc.)
    8. Spice level (mild, medium, hot, or very hot)
    
    Format the response as valid JSON with this exact structure for each recipe:
    {
      "recipes": [
        {
          "title": "Recipe Name",
          "description": "Short description",
          "prepTime": prep_time_in_minutes,
          "calories": calories_number,
          "protein": protein_in_grams,
          "carbs": carbs_in_grams,
          "fat": fat_in_grams,
          "ingredients": ["ingredient 1", "ingredient 2", ...],
          "instructions": ["step 1", "step 2", ...],
          "tags": ["tag1", "tag2", ...],
          "spiceLevel": "mild/medium/hot/very hot"
        },
        ...
      ]
    }
    
    Focus on authentic ${cuisine} recipes only. Make sure all values are provided in the required format.`;

    try {
      // Verify API key exists
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Gemini API key is missing');
        throw new Error('API key is missing');
      }

      // Log request information for debugging (remove in production)
      console.log(`Making Gemini API request with prompt length: ${prompt.length}`);

      // Make the request to Gemini API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
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
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      // Log response status for debugging
      console.log(`Gemini API response status: ${geminiResponse.status}`);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error(`Gemini API error: ${geminiResponse.status}, ${errorText}`);
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
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

      // Add IDs and random image URLs to each recipe
      const enhancedRecipes = recipesData.recipes.map((recipe: any, index: number) => {
        return {
          ...recipe,
          id: `recipe-${Date.now()}-${index}`,
          imageUrl: INDIAN_FOOD_IMAGES[Math.floor(Math.random() * INDIAN_FOOD_IMAGES.length)],
        };
      });

      return NextResponse.json({ recipes: enhancedRecipes });
    } catch (apiError) {
      console.error('Error with Gemini API call:', apiError);

      // Return mock data as fallback when API fails
      console.log('Using mock Indian recipes as fallback');
      return NextResponse.json({
        recipes: MOCK_INDIAN_RECIPES,
        _source: 'mock', // indicator that these are mock recipes
      });
    }
  } catch (error) {
    console.error('Error processing recipe request:', error);
    return NextResponse.json(
      {
        error: 'Failed to get recipe suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { RecipeSuggestionRequest } from '@/lib/services/gemini';

// Sample images for dishes (to ensure we have good image URLs)
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Butter Chicken
  'https://images.unsplash.com/photo-1617692855027-33b14f061079?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Biryani
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Dosa
  'https://images.unsplash.com/photo-1631916969933-bcd1ab93edda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Paneer Tikka
  'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Samosa
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Curry
  'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Naan
  'https://images.unsplash.com/photo-1607532941433-304659e8198a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Pasta
  'https://images.unsplash.com/photo-1576402187878-974f70c890a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Pizza
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Salad
];

// Mock data to use as fallback when API fails
const MOCK_RECIPES = [
  {
    id: 'recipe-1',
    title: 'Quick Tomato Pasta',
    description: 'A simple and flavorful pasta dish with fresh tomatoes and herbs.',
    prepTime: 20,
    calories: 450,
    protein: 12,
    carbs: 70,
    fat: 15,
    spiceLevel: 'mild',
    tags: ['italian', 'quick', 'vegetarian', 'pasta'],
    imageUrl:
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '250g pasta (spaghetti or penne)',
      '3 large tomatoes, diced',
      '2 cloves garlic, minced',
      '1/4 cup olive oil',
      '1/4 cup fresh basil, chopped',
      '1 tsp red pepper flakes (optional)',
      'Salt and pepper to taste',
      'Grated parmesan cheese for serving',
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook pasta according to package instructions.',
      'While pasta cooks, heat olive oil in a large pan over medium heat.',
      'Add garlic and sauté for 30 seconds until fragrant.',
      'Add diced tomatoes and cook for 5-7 minutes until they break down slightly.',
      'Season with salt, pepper, and red pepper flakes if using.',
      'Drain pasta, reserving 1/4 cup of pasta water.',
      'Add pasta to the tomato sauce along with the reserved water and toss to combine.',
      'Remove from heat, stir in fresh basil, and serve with grated parmesan.',
    ],
  },
  {
    id: 'recipe-2',
    title: 'Creamy Tomato Soup',
    description: 'A comforting tomato soup perfect for quick lunches or light dinners.',
    prepTime: 25,
    calories: 320,
    protein: 8,
    carbs: 30,
    fat: 18,
    spiceLevel: 'mild',
    tags: ['soup', 'vegetarian', 'comfort-food', 'lunch'],
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '800g ripe tomatoes, quartered',
      '1 onion, chopped',
      '2 cloves garlic, minced',
      '2 tbsp olive oil',
      '2 cups vegetable broth',
      '1/4 cup heavy cream',
      '1 tsp dried basil',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
      'Fresh basil leaves for garnish',
    ],
    instructions: [
      'Heat olive oil in a large pot over medium heat.',
      'Add onions and cook until translucent, about 5 minutes.',
      'Add garlic and cook for another minute.',
      'Add tomatoes, dried herbs, salt, and pepper. Cook for 5 minutes.',
      'Pour in vegetable broth and bring to a simmer. Cook for 15 minutes.',
      'Use an immersion blender to puree the soup until smooth.',
      'Stir in the heavy cream and adjust seasoning if needed.',
      'Serve hot, garnished with fresh basil leaves.',
    ],
  },
  {
    id: 'recipe-3',
    title: 'Tomato & Pasta Salad',
    description: 'A refreshing pasta salad perfect for warm days, ready in minutes.',
    prepTime: 15,
    calories: 380,
    protein: 10,
    carbs: 55,
    fat: 14,
    spiceLevel: 'mild',
    tags: ['salad', 'vegetarian', 'cold', 'lunch', 'picnic'],
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ingredients: [
      '250g pasta (fusilli or farfalle), cooked and cooled',
      '2 cups cherry tomatoes, halved',
      '1 cucumber, diced',
      '1/4 red onion, thinly sliced',
      '100g feta cheese, crumbled',
      '3 tbsp olive oil',
      '1 tbsp balsamic vinegar',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
      'Fresh basil leaves, torn',
    ],
    instructions: [
      'Cook pasta according to package instructions, drain, and cool under running water.',
      'In a large bowl, combine cooled pasta, cherry tomatoes, cucumber, and red onion.',
      'In a small bowl, whisk together olive oil, balsamic vinegar, oregano, salt, and pepper.',
      'Pour the dressing over the pasta mixture and toss to combine.',
      'Gently fold in the crumbled feta cheese and fresh basil.',
      'Refrigerate for at least 30 minutes before serving to allow flavors to meld.',
      'Adjust seasoning if needed before serving.',
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: RecipeSuggestionRequest = await request.json();
    const {
      cuisine = 'Italian',
      dietType = [],
      mealType,
      ingredients = [],
      excludeIngredients = [],
      maxPrepTime,
    } = body;

    console.log('Recipe request:', { cuisine, dietType, mealType, ingredients, excludeIngredients, maxPrepTime });

    // Create a prompt for Gemini API
    let prompt = `Generate exactly 3 ${cuisine} cuisine recipes`;

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

    prompt += `.

Follow this EXACT format for your JSON response with no additional text or explanations:

    {
      "recipes": [
        {
          "title": "Recipe Name",
      "description": "Short description (1-2 sentences)",
      "prepTime": 30,
      "calories": 450,
      "protein": 20,
      "carbs": 50,
      "fat": 15,
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "instructions": ["step 1", "step 2", "step 3"],
      "tags": ["tag1", "tag2", "tag3"],
          "spiceLevel": "mild/medium/hot/very hot"
    }
      ]
    }
    
Focus on authentic ${cuisine} recipes only. DO NOT include code blocks, markdown formatting, or any explanatory text - JUST the JSON object exactly as specified.`;

    try {
      // Verify API key exists
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Gemini API key is missing');
        throw new Error('API key is missing');
      }

      // Check if the API key looks valid
      if (!apiKey.startsWith('AIza')) {
        console.error('Gemini API key appears to be invalid');
        throw new Error('API key appears to be invalid');
      }

      console.log(`Making Gemini API request with prompt length: ${prompt.length}`);

      // Make the request to Gemini API
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
              temperature: 0.2,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 40,
            },
          }),
        },
      );

      console.log(`Gemini API response status: ${geminiResponse.status}`);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        const status = geminiResponse.status;

        if (status === 400) {
          console.error('Gemini API error: Bad request', errorText);
        } else if (status === 401) {
          console.error('Gemini API error: Unauthorized. Check your API key.');
        } else if (status === 403) {
          console.error('Gemini API error: Forbidden. Key might not have access to this model.');
        } else if (status === 429) {
          console.error('Gemini API error: Rate limit exceeded.');
        } else if (status === 500 || status === 503) {
          console.error('Gemini API error: Server error', errorText);
        } else {
          console.error(`Gemini API error: ${status}`, errorText);
        }

        throw new Error(`Gemini API error: ${status}`);
      }

      const geminiData = await geminiResponse.json();

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

      // Get the response text
      let responseText = geminiData.candidates[0].content.parts[0].text;
      console.log('Raw response from Gemini:', responseText);

      // Parse the JSON response
      let recipesData;
      try {
        // Try to parse the response directly
        recipesData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON directly. Attempting extraction:', parseError);

        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            recipesData = JSON.parse(jsonMatch[1]);
          } catch (extractError) {
            console.error('Failed to extract and parse JSON:', extractError);
            throw new Error('Could not parse API response');
          }
        } else {
          console.error('No JSON found in response');
          throw new Error('No valid JSON in API response');
        }
      }

      // Validate recipes data
      if (
        !recipesData ||
        !recipesData.recipes ||
        !Array.isArray(recipesData.recipes) ||
        recipesData.recipes.length === 0
      ) {
        console.error('Invalid or empty recipes data:', recipesData);
        throw new Error('API returned invalid recipe data');
      }

      // Enhance recipes with IDs and images
      const enhancedRecipes = recipesData.recipes.map((recipe, index) => ({
        ...recipe,
        id: `recipe-${Date.now()}-${index}`,
        imageUrl: FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)],
      }));

      return NextResponse.json({
        recipes: enhancedRecipes,
        _source: 'gemini',
      });
    } catch (apiError) {
      console.error('Error with Gemini API call:', apiError);

      // Customize mock data based on the request
      let customizedMockRecipes = [...MOCK_RECIPES];

      // If specific cuisine requested that's not Italian, update the mock data
      if (cuisine && cuisine.toLowerCase() !== 'italian') {
        customizedMockRecipes = MOCK_RECIPES.map((recipe) => ({
          ...recipe,
          title: `${cuisine} Style ${recipe.title.split(' ').slice(1).join(' ')}`,
          description: `${cuisine} inspired version of this dish, using traditional flavors.`,
          tags: [...recipe.tags.filter((tag) => tag !== 'italian'), cuisine.toLowerCase()],
        }));
      }

      // If specific ingredients requested, mention them in the description
      if (ingredients && ingredients.length > 0) {
        customizedMockRecipes = customizedMockRecipes.map((recipe) => ({
          ...recipe,
          description: `${recipe.description} Features ${ingredients.join(' and ')}.`,
        }));
      }

      return NextResponse.json({
        recipes: customizedMockRecipes,
        _source: 'mock',
        _error: apiError instanceof Error ? apiError.message : 'Unknown API error',
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

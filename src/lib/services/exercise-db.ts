// Exercise DB API service for workout equipment

export interface WorkoutEquipment {
  equipment: string;
}

// Mock data to use as fallback when API fails
const MOCK_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'resistance band',
  'bosu ball',
  'stability ball',
  'medicine ball',
  'ez barbell',
  'body weight',
  'smith machine',
  'jump rope',
  'suspension trainer',
  'pull-up bar',
  'bench',
  'squat rack',
  'battle ropes',
  'weight plate',
  'foam roller',
  'yoga mat',
];

/**
 * Fetches a list of available workout equipment from the Exercise DB API
 * @returns Array of equipment names
 */
export async function getWorkoutEquipment(): Promise<string[]> {
  try {
    console.log('Fetching workout equipment list');

    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';

    // Check if API key is missing or empty
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('RapidAPI key is missing or invalid. Using mock data instead.');
      return MOCK_EQUIPMENT;
    }

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'exercise-db-fitness-workout-gym.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    };

    const response = await fetch('https://exercise-db-fitness-workout-gym.p.rapidapi.com/list/equipment', options);

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;

      // Handle specific error cases
      if (status === 401) {
        console.error('Invalid RapidAPI key. Please check your credentials in .env.local');
      } else if (status === 429) {
        console.error('RapidAPI rate limit exceeded. Consider upgrading your plan or reducing request frequency.');
      } else {
        console.error(`API error (${status}):`, errorText);
      }

      // Return mock data when the API fails
      console.log('Using mock equipment data as fallback');
      return MOCK_EQUIPMENT;
    }

    const data = await response.json();

    // Check if data is an array
    if (Array.isArray(data)) {
      // Check if it's an array of objects with equipment property
      if (data.length > 0 && typeof data[0] === 'object' && 'equipment' in data[0]) {
        return data.map((item) => item.equipment);
      }
      // Check if it's an array of strings
      else if (data.length > 0 && typeof data[0] === 'string') {
        return data;
      }
    }

    // If data format is not recognized, use mock data
    console.log('Unexpected API response format, using mock equipment data as fallback');
    return MOCK_EQUIPMENT;
  } catch (error) {
    console.error('Error fetching workout equipment:', error);

    // Return mock data when there's an error
    console.log('Using mock equipment data as fallback due to error');
    return MOCK_EQUIPMENT;
  }
}

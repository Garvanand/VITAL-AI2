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

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'exercise-db-fitness-workout-gym.p.rapidapi.com',
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
      },
    };

    const response = await fetch('https://exercise-db-fitness-workout-gym.p.rapidapi.com/list/equipment', options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);

      // Return mock data when the API fails
      console.log('Using mock equipment data as fallback');
      return MOCK_EQUIPMENT;
    }

    const data = (await response.json()) as WorkoutEquipment[];

    // Extract just the equipment names from the response
    const equipmentList = data.map((item) => item.equipment);

    return equipmentList;
  } catch (error) {
    console.error('Error fetching workout equipment:', error);

    // Return mock data when there's an error
    console.log('Using mock equipment data as fallback due to error');
    return MOCK_EQUIPMENT;
  }
}

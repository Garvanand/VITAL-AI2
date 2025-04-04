'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import '@/styles/ModelStyles.css';
import { Button } from '@/components/ui/button';

interface FitnessFormData {
  age: string;
  gender: 'male' | 'female' | 'other';
  weight: string;
  height: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'endurance';
}

interface MacroSplit {
  protein: number;
  carbs: number;
  fats: number;
}

interface FitnessPlan {
  dailyCalories: string;
  macroSplit: MacroSplit;
  workoutPlan: string;
  mealPlan: string;
  tips: string[];
}

interface NutritionData {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  analysis: string;
}

export function CalorieTracker() {
  // Fitness Plan State
  const [fitnessFormData, setFitnessFormData] = useState<FitnessFormData>({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
    goal: 'weight-loss',
  });
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);

  // Calorie Scanner State
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFitnessChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFitnessFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFitnessSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFitnessPlan(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a professional fitness coach and nutritionist. You must respond ONLY with a valid JSON object, no additional text or explanation. The JSON must exactly match this structure:
{
  "dailyCalories": "2000",
  "macroSplit": {
    "protein": 30,
    "carbs": 40,
    "fats": 30
  },
  "workoutPlan": "<h4>Weekly Workout Schedule</h4><ul><li>Day 1: Workout details</li></ul>",
  "mealPlan": "<h4>Daily Meal Plan</h4><ul><li>Breakfast: Meal details</li></ul>",
  "tips": ["tip1", "tip2", "tip3"]
}`,
            },
            {
              role: 'user',
              content: `Based on these details, create a fitness plan (respond ONLY with the JSON object, no other text):
Age: ${fitnessFormData.age}
Gender: ${fitnessFormData.gender}
Weight: ${fitnessFormData.weight}kg
Height: ${fitnessFormData.height}cm
Activity Level: ${fitnessFormData.activityLevel}
Goal: ${fitnessFormData.goal}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to generate plan');
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      console.log('Raw API response:', content); // For debugging

      try {
        // Clean the response
        const cleanContent = content
          .replace(/^json\s*/, '') // Remove opening json
          .replace(/\s*$/, '') // Remove closing
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .trim();

        console.log('Cleaned content:', cleanContent); // For debugging

        const planData = JSON.parse(cleanContent) as FitnessPlan;

        // Validate the required structure
        if (!planData || typeof planData !== 'object') {
          throw new Error('Invalid response format');
        }

        if (
          !planData.macroSplit ||
          !planData.dailyCalories ||
          !planData.workoutPlan ||
          !planData.mealPlan ||
          !Array.isArray(planData.tips)
        ) {
          throw new Error('Missing required fields in response');
        }

        // Validate macro split adds up to 100
        const macroSum = Object.values(planData.macroSplit).reduce((sum, value) => sum + value, 0);
        if (Math.abs(macroSum - 100) > 1) {
          // Allow for small rounding differences
          throw new Error('Invalid macro split percentages');
        }

        setFitnessPlan(planData);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Failed content:', content);
        throw new Error('Failed to parse fitness plan data. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        reject(new Error('Please upload a valid JPEG or PNG image'));
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        // 20MB
        reject(new Error('Image size should be less than 20MB'));
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        await validateImage(file);
        setFoodImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImagePreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error processing image');
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foodImage) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(foodImage);

      // First Vision Analysis
      const visionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-90b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this food image. List all visible food items, their approximate portions, and preparation methods.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!visionResponse.ok) {
        const errorData = await visionResponse.json().catch(() => ({}));
        console.error('Vision API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to analyze image');
      }

      const visionResult = await visionResponse.json();
      const foodDescription = visionResult.choices[0].message.content;

      // Second Nutritional Analysis
      const nutritionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a nutritionist. Respond only with valid JSON containing nutritional analysis.',
            },
            {
              role: 'user',
              content: `Analyze this food description and respond with a JSON object exactly in this format:
              {
                "calories": "350",
                "protein": "50",
                "carbs": "15",
                "fat": "10",
                "analysis": "<h4>Nutritional Analysis</h4><p>Analysis details here...</p>"
              }
              Food description: ${foodDescription}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      });

      if (!nutritionResponse.ok) {
        const errorData = await nutritionResponse.json().catch(() => ({}));
        console.error('Nutrition API Error:', errorData);
        throw new Error('Failed to analyze nutritional content');
      }

      const nutritionResult = await nutritionResponse.json();
      const cleanedContent = nutritionResult.choices[0].message.content
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .trim();

      const parsedData = JSON.parse(cleanedContent) as NutritionData;
      setNutritionData(parsedData);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Nutrition & Fitness Analyzer</h2>
      </div>

      <div className="p-6 bg-card rounded-xl border shadow-sm">
        <div className="model-form-container">
          {/* Fitness Plan Section */}
          <div className="fitness-goal-section">
            <h3 className="text-lg font-medium mb-3">Get Your Personalized Fitness Plan</h3>
            <form onSubmit={handleFitnessSubmit} className="prediction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={fitnessFormData.age}
                    onChange={handleFitnessChange}
                    required
                    min="15"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={fitnessFormData.gender}
                    onChange={handleFitnessChange}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={fitnessFormData.weight}
                    onChange={handleFitnessChange}
                    required
                    step="0.1"
                    min="30"
                    max="300"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={fitnessFormData.height}
                    onChange={handleFitnessChange}
                    required
                    min="100"
                    max="250"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="activityLevel">Activity Level</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={fitnessFormData.activityLevel}
                  onChange={handleFitnessChange}
                  required
                >
                  <option value="sedentary">Sedentary (Office job, little exercise)</option>
                  <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="very">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="extra">Extra Active (Very hard exercise & physical job)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="goal">Your Goal</label>
                <select id="goal" name="goal" value={fitnessFormData.goal} onChange={handleFitnessChange} required>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Build Muscle</option>
                  <option value="maintenance">Maintain Weight</option>
                  <option value="endurance">Improve Endurance</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Generating...' : 'Generate My Plan'}
              </Button>
            </form>

            {fitnessPlan && fitnessPlan.macroSplit && (
              <div className="fitness-plan-container">
                <div className="plan-header">
                  <h3>Your Personalized Fitness Plan</h3>
                  <div className="daily-target">
                    <div className="target-circle">
                      <span className="target-number">{fitnessPlan.dailyCalories || 'N/A'}</span>
                      <span className="target-label">Daily Calories</span>
                    </div>
                  </div>
                </div>

                <div className="macro-distribution">
                  <h4>Macro Split</h4>
                  <div className="macro-bars">
                    {fitnessPlan.macroSplit.protein && (
                      <div className="macro-bar protein" style={{ width: `${fitnessPlan.macroSplit.protein}%` }}>
                        Protein {fitnessPlan.macroSplit.protein}%
                      </div>
                    )}
                    {fitnessPlan.macroSplit.carbs && (
                      <div className="macro-bar carbs" style={{ width: `${fitnessPlan.macroSplit.carbs}%` }}>
                        Carbs {fitnessPlan.macroSplit.carbs}%
                      </div>
                    )}
                    {fitnessPlan.macroSplit.fats && (
                      <div className="macro-bar fats" style={{ width: `${fitnessPlan.macroSplit.fats}%` }}>
                        Fats {fitnessPlan.macroSplit.fats}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="plan-sections">
                  {fitnessPlan.workoutPlan && (
                    <div className="plan-section" dangerouslySetInnerHTML={{ __html: fitnessPlan.workoutPlan }} />
                  )}
                  {fitnessPlan.mealPlan && (
                    <div className="plan-section" dangerouslySetInnerHTML={{ __html: fitnessPlan.mealPlan }} />
                  )}
                </div>

                {fitnessPlan.tips && fitnessPlan.tips.length > 0 && (
                  <div className="tips-section">
                    <h4>Pro Tips</h4>
                    <ul className="tips-list">
                      {fitnessPlan.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Calorie Scanner Section */}
          <div className="calorie-scanner-section mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-medium mb-3">AI Calorie Scanner</h3>
            <form onSubmit={handleSubmit} className="prediction-form">
              <div className="form-group">
                <label htmlFor="food-image">Upload Food Image</label>
                <input
                  type="file"
                  id="food-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Food preview" />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Food'}
              </Button>
            </form>

            {error && <div className="error">{error}</div>}

            {nutritionData && (
              <div className="analysis-content">
                <h4 className="text-base font-medium">Food Analysis Results</h4>

                <div className="nutrient-cards">
                  <div className="nutrient-card calories">
                    <div className="nutrient-icon">🔥</div>
                    <div className="nutrient-value">{nutritionData.calories}</div>
                    <div className="nutrient-label">Calories</div>
                  </div>

                  <div className="nutrient-card protein">
                    <div className="nutrient-icon">🥩</div>
                    <div className="nutrient-value">{nutritionData.protein}g</div>
                    <div className="nutrient-label">Protein</div>
                  </div>

                  <div className="nutrient-card carbs">
                    <div className="nutrient-icon">🌾</div>
                    <div className="nutrient-value">{nutritionData.carbs}g</div>
                    <div className="nutrient-label">Carbs</div>
                  </div>

                  <div className="nutrient-card fat">
                    <div className="nutrient-icon">🥑</div>
                    <div className="nutrient-value">{nutritionData.fat}g</div>
                    <div className="nutrient-label">Fat</div>
                  </div>
                </div>

                <div className="detailed-analysis" dangerouslySetInnerHTML={{ __html: nutritionData.analysis }} />

                <div className="important-note">
                  <p>Note: These values are estimates based on AI analysis. Actual nutritional content may vary.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

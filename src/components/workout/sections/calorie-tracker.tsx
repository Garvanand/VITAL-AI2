'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import '@/styles/ModelStyles.css';
import { Button } from '@/components/ui/button';
import { Dumbbell, Camera, ChevronDown } from 'lucide-react';

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

      // Store the food data in localStorage for the macro tracker to use
      const foodData = {
        food: `Scanned: ${foodDescription.split('.')[0]}`,
        calories: parsedData.calories,
        protein: parsedData.protein,
        carbs: parsedData.carbs,
        fat: parsedData.fat,
      };

      localStorage.setItem('scannedFood', JSON.stringify(foodData));

      // Trigger storage event for cross-component communication
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'scannedFood',
          newValue: JSON.stringify(foodData),
        }),
      );
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center">
        <motion.h2
          className="text-2xl font-bold flex items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Dumbbell className="h-6 w-6 text-[#15E3E3]" />
          AI Nutrition & Fitness Analyzer
        </motion.h2>
      </div>

      <motion.div
        className="p-6 bg-card rounded-xl border border-[#15E3E3]/10 shadow-sm backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="model-form-container">
          {/* Fitness Plan Section */}
          <div className="fitness-goal-section">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#15E3E3]/10 text-[#15E3E3]">
                <Dumbbell className="h-4 w-4" />
              </span>
              Get Your Personalized Fitness Plan
            </h3>
            <form onSubmit={handleFitnessSubmit} className="prediction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={fitnessFormData.age}
                    onChange={handleFitnessChange}
                    required
                    min="15"
                    max="100"
                    className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={fitnessFormData.gender}
                      onChange={handleFitnessChange}
                      required
                      className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm appearance-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </label>
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
                    className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="height" className="text-sm font-medium">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={fitnessFormData.height}
                    onChange={handleFitnessChange}
                    required
                    min="100"
                    max="250"
                    className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="activityLevel" className="text-sm font-medium">
                  Activity Level
                </label>
                <div className="relative">
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={fitnessFormData.activityLevel}
                    onChange={handleFitnessChange}
                    required
                    className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm appearance-none"
                  >
                    <option value="sedentary">Sedentary (Office job, little exercise)</option>
                    <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                    <option value="very">Very Active (Hard exercise 6-7 days/week)</option>
                    <option value="extra">Extra Active (Very hard exercise & physical job)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="goal" className="text-sm font-medium">
                  Your Goal
                </label>
                <div className="relative">
                  <select
                    id="goal"
                    name="goal"
                    value={fitnessFormData.goal}
                    onChange={handleFitnessChange}
                    required
                    className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm appearance-none"
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Build Muscle</option>
                    <option value="maintenance">Maintain Weight</option>
                    <option value="endurance">Improve Endurance</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate My Plan'}
              </Button>
            </form>

            {fitnessPlan && fitnessPlan.macroSplit && (
              <motion.div
                className="fitness-plan-container mt-6 p-4 bg-card/60 border border-[#15E3E3]/20 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="plan-header mb-4">
                  <h3 className="text-lg font-medium mb-2">Your Personalized Fitness Plan</h3>
                  <div className="daily-target flex items-center justify-center">
                    <div className="target-circle bg-[#15E3E3]/10 text-[#15E3E3] p-4 rounded-full flex flex-col items-center justify-center">
                      <span className="target-number text-2xl font-bold">{fitnessPlan.dailyCalories || 'N/A'}</span>
                      <span className="target-label text-xs">Daily Calories</span>
                    </div>
                  </div>
                </div>

                <div className="macro-distribution mb-4">
                  <h4 className="text-base font-medium mb-2">Macro Split</h4>
                  <div className="macro-bars h-8 w-full bg-muted/30 rounded-lg overflow-hidden flex">
                    {fitnessPlan.macroSplit.protein && (
                      <motion.div
                        className="macro-bar protein h-full flex items-center justify-center text-xs font-medium text-white bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${fitnessPlan.macroSplit.protein}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      >
                        {fitnessPlan.macroSplit.protein > 10 && `Protein ${fitnessPlan.macroSplit.protein}%`}
                      </motion.div>
                    )}
                    {fitnessPlan.macroSplit.carbs && (
                      <motion.div
                        className="macro-bar carbs h-full flex items-center justify-center text-xs font-medium text-white bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${fitnessPlan.macroSplit.carbs}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {fitnessPlan.macroSplit.carbs > 10 && `Carbs ${fitnessPlan.macroSplit.carbs}%`}
                      </motion.div>
                    )}
                    {fitnessPlan.macroSplit.fats && (
                      <motion.div
                        className="macro-bar fats h-full flex items-center justify-center text-xs font-medium text-white bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${fitnessPlan.macroSplit.fats}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        {fitnessPlan.macroSplit.fats > 10 && `Fats ${fitnessPlan.macroSplit.fats}%`}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <div>Protein: {fitnessPlan.macroSplit.protein}%</div>
                    <div>Carbs: {fitnessPlan.macroSplit.carbs}%</div>
                    <div>Fat: {fitnessPlan.macroSplit.fats}%</div>
                  </div>
                </div>

                <div className="plan-sections space-y-4">
                  {fitnessPlan.workoutPlan && (
                    <motion.div
                      className="plan-section p-3 bg-card/60 border border-[#15E3E3]/10 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      dangerouslySetInnerHTML={{ __html: fitnessPlan.workoutPlan }}
                    />
                  )}
                  {fitnessPlan.mealPlan && (
                    <motion.div
                      className="plan-section p-3 bg-card/60 border border-[#15E3E3]/10 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      dangerouslySetInnerHTML={{ __html: fitnessPlan.mealPlan }}
                    />
                  )}
                </div>

                {fitnessPlan.tips && fitnessPlan.tips.length > 0 && (
                  <motion.div
                    className="tips-section mt-4 p-3 bg-card/60 border border-[#15E3E3]/10 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h4 className="text-base font-medium mb-2">Pro Tips</h4>
                    <ul className="tips-list space-y-2">
                      {fitnessPlan.tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          className="text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Calorie Scanner Section */}
          <div className="calorie-scanner-section mt-8 pt-6 border-t border-[#15E3E3]/10">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#15E3E3]/10 text-[#15E3E3]">
                <Camera className="h-4 w-4" />
              </span>
              AI Calorie Scanner
            </h3>
            <form onSubmit={handleSubmit} className="prediction-form">
              <div className="form-group">
                <label htmlFor="food-image" className="text-sm font-medium">
                  Upload Food Image
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#15E3E3]/20 rounded-lg p-4 transition-colors hover:border-[#15E3E3]/40 bg-background/50 backdrop-blur-sm">
                  <input
                    type="file"
                    id="food-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="file-input hidden"
                  />
                  <Camera className="h-10 w-10 text-[#15E3E3]/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Click to select a food image or drag and drop</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-[#15E3E3]/20"
                  >
                    Select Image
                  </Button>
                </div>
                {imagePreview && (
                  <motion.div
                    className="image-preview mt-4 rounded-lg overflow-hidden border border-[#15E3E3]/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={imagePreview} alt="Food preview" className="w-full h-auto" />
                  </motion.div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Food'}
              </Button>
            </form>

            {error && (
              <motion.div
                className="error mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {nutritionData && (
              <motion.div
                className="analysis-content mt-6 p-4 bg-card/60 border border-[#15E3E3]/20 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-base font-medium mb-4">Food Analysis Results</h4>

                <div className="nutrient-cards grid grid-cols-4 gap-3 mb-4">
                  <motion.div
                    className="nutrient-card p-3 rounded-lg bg-[#15E3E3]/5 border border-[#15E3E3]/20 flex flex-col items-center"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="nutrient-icon text-xl mb-1">🔥</div>
                    <div className="nutrient-value text-lg font-semibold">{nutritionData.calories}</div>
                    <div className="nutrient-label text-xs text-muted-foreground">Calories</div>
                  </motion.div>

                  <motion.div
                    className="nutrient-card p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex flex-col items-center"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="nutrient-icon text-xl mb-1">🥩</div>
                    <div className="nutrient-value text-lg font-semibold">{nutritionData.protein}g</div>
                    <div className="nutrient-label text-xs text-muted-foreground">Protein</div>
                  </motion.div>

                  <motion.div
                    className="nutrient-card p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="nutrient-icon text-xl mb-1">🌾</div>
                    <div className="nutrient-value text-lg font-semibold">{nutritionData.carbs}g</div>
                    <div className="nutrient-label text-xs text-muted-foreground">Carbs</div>
                  </motion.div>

                  <motion.div
                    className="nutrient-card p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex flex-col items-center"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="nutrient-icon text-xl mb-1">🥑</div>
                    <div className="nutrient-value text-lg font-semibold">{nutritionData.fat}g</div>
                    <div className="nutrient-label text-xs text-muted-foreground">Fat</div>
                  </motion.div>
                </div>

                <motion.div
                  className="detailed-analysis p-4 bg-card/60 border border-[#15E3E3]/10 rounded-lg mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: nutritionData.analysis }}
                />

                <motion.div
                  className="important-note text-xs text-muted-foreground italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.6 }}
                >
                  <p>Note: These values are estimates based on AI analysis. Actual nutritional content may vary.</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

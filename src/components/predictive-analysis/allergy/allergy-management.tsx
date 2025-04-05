'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, ExternalLink, MapPin } from 'lucide-react';

interface AllergyManagementProps {
  supabase: any;
}

export function AllergyManagement({ supabase }: AllergyManagementProps) {
  const [formData, setFormData] = useState({
    allergies: '',
    foodIntake: '',
    symptoms: '',
    location: '',
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getWeatherData = async (location: string) => {
    // Simulated weather data
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      main: {
        temp: 22.5,
        humidity: 65,
      },
      weather: [
        {
          main: 'Clouds',
          description: 'scattered clouds',
        },
      ],
      wind: {
        speed: 3.5,
      },
      pollen: {
        tree: 'Moderate',
        grass: 'High',
        weed: 'Low',
      },
    };
  };

  const findNearbyHospitals = async (location: string) => {
    // Simulated hospital data
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        name: 'City General Hospital',
        address: '123 Healthcare Blvd, City Center',
        distance: '1.2 miles',
        phone: '(555) 123-4567',
        emergency: true,
      },
      {
        name: 'Allergy & Asthma Specialists',
        address: '456 Medical Drive, Suite 200',
        distance: '2.5 miles',
        phone: '(555) 987-6543',
        emergency: false,
      },
      {
        name: 'Urgent Care Clinic',
        address: '789 Wellness Way',
        distance: '3.0 miles',
        phone: '(555) 456-7890',
        emergency: true,
      },
    ];
  };

  const analyzeAllergies = async () => {
    // Simulated response from AI prediction model
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const weatherConditions = weatherData?.weather[0]?.main || 'Unknown';
    const temperature = weatherData?.main?.temp || 0;
    const humidity = weatherData?.main?.humidity || 0;
    const pollenLevels = weatherData?.pollen || { tree: 'Unknown', grass: 'Unknown', weed: 'Unknown' };

    // Use the simulated ML model to create a response based on inputs
    let analysisHTML = `
      <h4>Allergy Risk Assessment</h4>
      <p>Based on your reported allergies and current environmental conditions, we've analyzed your potential risk factors.</p>
      
      <h4>Environmental Factors</h4>
      <ul>
        <li><strong>Weather:</strong> ${weatherConditions}, ${temperature}°C, ${humidity}% humidity</li>
        <li><strong>Pollen Levels:</strong> Tree (${pollenLevels.tree}), Grass (${pollenLevels.grass}), Weed (${pollenLevels.weed})</li>
      </ul>
      
      <h4>Risk Analysis</h4>
    `;

    // Analyze allergies against weather
    const allergyList = formData.allergies.toLowerCase();

    if (allergyList.includes('pollen') && (pollenLevels.tree === 'High' || pollenLevels.grass === 'High')) {
      analysisHTML += `
        <p class="high-risk">High Risk: Your pollen allergies are likely to be triggered under current conditions with high pollen counts.</p>
        <ul>
          <li>Consider limiting outdoor activities, especially during peak pollen hours (5-10 AM).</li>
          <li>Keep windows closed and use HEPA air purifiers indoors.</li>
          <li>Shower and change clothes after being outdoors to remove pollen.</li>
        </ul>
      `;
    } else if ((allergyList.includes('dust') || allergyList.includes('mold')) && humidity > 60) {
      analysisHTML += `
        <p class="medium-risk">Moderate Risk: High humidity (${humidity}%) may increase dust mite and mold allergen exposure.</p>
        <ul>
          <li>Use dehumidifiers to maintain indoor humidity below 50%.</li>
          <li>Clean damp areas regularly to prevent mold growth.</li>
          <li>Use allergen-proof covers on bedding and pillows.</li>
        </ul>
      `;
    } else {
      analysisHTML += `
        <p class="low-risk">Low Risk: Current environmental conditions are less likely to trigger your reported allergies.</p>
        <ul>
          <li>Continue with your regular allergy management plan.</li>
          <li>Monitor for any changes in symptoms or environmental conditions.</li>
        </ul>
      `;
    }

    // Food related analysis if provided
    if (formData.foodIntake) {
      analysisHTML += `
        <h4>Dietary Considerations</h4>
        <p>Based on your recent food intake:</p>
      `;

      if (
        (allergyList.includes('nut') && formData.foodIntake.toLowerCase().includes('nut')) ||
        (allergyList.includes('dairy') && formData.foodIntake.toLowerCase().includes('milk')) ||
        (allergyList.includes('gluten') &&
          (formData.foodIntake.toLowerCase().includes('wheat') || formData.foodIntake.toLowerCase().includes('bread')))
      ) {
        analysisHTML += `
          <p class="high-risk">Warning: Your recent diet may include potential allergens that match your reported allergies. Please review your food intake carefully.</p>
        `;
      } else {
        analysisHTML += `
          <p>No obvious allergenic foods detected in your reported intake that match your allergy profile. Continue to read food labels carefully.</p>
        `;
      }
    }

    analysisHTML += `
      <h4>Recommended Actions</h4>
      <ul>
        <li>Keep your emergency medications accessible at all times.</li>
        <li>Consider tracking your symptoms and potential triggers in a daily journal.</li>
        <li>For severe allergies, wearing a medical alert bracelet is recommended.</li>
      </ul>
    `;

    return analysisHTML;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get weather data first
      const weather = await getWeatherData(formData.location);
      setWeatherData(weather);

      // Get allergy analysis
      const analysis = await analyzeAllergies();
      setResult(analysis);

      // Find nearby hospitals
      const nearbyHospitals = await findNearbyHospitals(formData.location);
      setHospitals(nearbyHospitals);

      // In a real implementation, you would save the result to Supabase here
      if (supabase) {
        // Example code to save to Supabase (commented out since we're just simulating)
        /*
        const { error } = await supabase
          .from('allergy_assessments')
          .insert([{
            allergies: formData.allergies,
            food_intake: formData.foodIntake,
            symptoms: formData.symptoms,
            location: formData.location,
            weather_data: weather,
            analysis_result: analysis,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error saving to Supabase:', error);
        }
        */
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze allergy risks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">AI Allergy Management Assistant</h2>
              <p className="text-muted-foreground mt-2">
                Get personalized allergy risk assessments based on your allergies, location, and current environmental
                conditions
              </p>
            </div>

            {error && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-md flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g., pollen, dust, peanuts, dairy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodIntake">Recent Food Intake</Label>
                  <Textarea
                    id="foodIntake"
                    name="foodIntake"
                    value={formData.foodIntake}
                    onChange={handleChange}
                    rows={3}
                    placeholder="List foods consumed in the last 24 hours"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Current Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe any symptoms you're experiencing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {loading ? 'Analyzing...' : 'Analyze Allergy Risks'}
              </Button>
            </form>

            {result && (
              <motion.div
                className="mt-8 border rounded-lg p-6 bg-card/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: result }} />

                  <style jsx global>{`
                    .high-risk {
                      color: #e11d48;
                      font-weight: 600;
                    }
                    .medium-risk {
                      color: #eab308;
                      font-weight: 600;
                    }
                    .low-risk {
                      color: #22c55e;
                      font-weight: 600;
                    }
                  `}</style>

                  {hospitals.length > 0 && (
                    <div className="mt-6">
                      <h4>Nearby Healthcare Facilities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {hospitals.map((hospital, index) => (
                          <div key={index} className="border rounded-md p-4 bg-background/50">
                            <div className="flex justify-between">
                              <h5 className="font-medium">{hospital.name}</h5>
                              {hospital.emergency && (
                                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                                  Emergency
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <div className="flex justify-between items-center mt-2 text-sm">
                              <span>{hospital.distance}</span>
                              <span>{hospital.phone}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 text-xs"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`,
                                  '_blank',
                                )
                              }
                            >
                              <MapPin className="h-3 w-3 mr-1" /> Get Directions{' '}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm bg-muted/30 p-4 rounded-md mt-6">
                    <p className="font-medium mb-1">Health Advisory</p>
                    <p>
                      This analysis is for informational purposes only. In case of severe allergic reactions, seek
                      immediate medical attention.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

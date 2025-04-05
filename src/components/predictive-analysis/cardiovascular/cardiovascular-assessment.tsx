'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CardiovascularAssessmentProps {
  session: any;
  supabase: any;
}

export function CardiovascularAssessment({ session, supabase }: CardiovascularAssessmentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: '',
    gender: '1',
    height: '',
    weight: '',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '1',
    gluc: '1',
    smoke: '0',
    alco: '0',
    active: '1',
  });
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const predictCardioRisk = async () => {
    try {
      // This would actually call the backend API that uses the .pkl file
      // For now, simulating a prediction based on medical criteria
      const age = parseInt(formData.age);
      const systolic = parseInt(formData.ap_hi);
      const diastolic = parseInt(formData.ap_lo);
      const cholesterol = parseInt(formData.cholesterol);
      const isSmoke = formData.smoke === '1';

      // Simple risk calculation (would be replaced by ML model)
      let cardioRisk = 0;

      // Age risk factor
      if (age > 50) cardioRisk += 0.15;
      if (age > 60) cardioRisk += 0.15;

      // Blood pressure risk
      if (systolic >= 140 || diastolic >= 90) cardioRisk += 0.3;
      else if (systolic >= 120 || diastolic >= 80) cardioRisk += 0.15;

      // Cholesterol risk
      if (cholesterol === 3)
        cardioRisk += 0.25; // Well above normal
      else if (cholesterol === 2) cardioRisk += 0.15; // Above normal

      // Smoking risk
      if (isSmoke) cardioRisk += 0.15;

      // Convert to binary prediction
      return cardioRisk > 0.4 ? 1 : 0;
    } catch (error) {
      console.error('Error predicting cardiovascular risk:', error);
      throw error;
    }
  };

  const getRecommendations = (predictionResult: number) => {
    if (predictionResult === 1) {
      return [
        'Schedule an appointment with a cardiologist for a comprehensive evaluation',
        'Monitor your blood pressure regularly',
        'Consider dietary changes to reduce cholesterol intake',
        'Start a gradual exercise program after consulting with your doctor',
        'If you smoke, consider a smoking cessation program',
        'Limit alcohol consumption',
        'Maintain a healthy weight',
      ];
    } else {
      return [
        'Continue with regular health check-ups',
        'Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains',
        'Stay physically active with at least 150 minutes of moderate exercise per week',
        'Manage stress through relaxation techniques',
        'Ensure adequate sleep of 7-8 hours per night',
        'Limit sodium, saturated fats, and processed foods',
      ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const processedData = {
        ...formData,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        ap_hi: parseInt(formData.ap_hi),
        ap_lo: parseInt(formData.ap_lo),
      };

      // Get prediction from ML model (simulated)
      const predictionResult = await predictCardioRisk();
      setResult(predictionResult);

      // Generate recommendations based on the result
      const recs = getRecommendations(predictionResult);
      setRecommendations(recs);

      // Save to Supabase if user is logged in
      if (session?.user?.id) {
        const { error } = await supabase.from('cardio_assessments').insert([
          {
            user_id: session.user.id,
            age: parseInt(formData.age),
            gender: formData.gender === '1' ? 'Female' : 'Male',
            height: parseInt(formData.height),
            weight: parseFloat(formData.weight),
            ap_hi: parseInt(formData.ap_hi),
            ap_lo: parseInt(formData.ap_lo),
            cholesterol: parseInt(formData.cholesterol),
            gluc: parseInt(formData.gluc),
            smoke: formData.smoke === '1',
            alco: formData.alco === '1',
            active: formData.active === '1',
            risk_level: predictionResult === 1 ? 'high' : 'low',
            recommendations: recs,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error('Error saving to Supabase:', error);
          throw error;
        }
      }

      toast({
        title: 'Assessment Complete',
        description: 'Your cardiovascular risk assessment has been processed successfully.',
      });
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process prediction');
      toast({
        title: 'Assessment Failed',
        description: err.message || 'An error occurred during assessment',
        variant: 'destructive',
      });
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
              <h2 className="text-2xl font-bold text-primary">Cardiovascular Disease Risk Assessment</h2>
              <p className="text-muted-foreground mt-2">
                Enter your health information to evaluate cardiovascular risk
              </p>
            </div>

            {error && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-md flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => handleSelectChange('gender', value)} defaultValue={formData.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Female</SelectItem>
                      <SelectItem value="2">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="100"
                    max="250"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    min="30"
                    max="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ap_hi">Systolic Blood Pressure</Label>
                  <Input
                    type="number"
                    id="ap_hi"
                    name="ap_hi"
                    value={formData.ap_hi}
                    onChange={handleInputChange}
                    required
                    min="80"
                    max="220"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ap_lo">Diastolic Blood Pressure</Label>
                  <Input
                    type="number"
                    id="ap_lo"
                    name="ap_lo"
                    value={formData.ap_lo}
                    onChange={handleInputChange}
                    required
                    min="40"
                    max="140"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cholesterol">Cholesterol Level</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('cholesterol', value)}
                    defaultValue={formData.cholesterol}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Normal</SelectItem>
                      <SelectItem value="2">Above Normal</SelectItem>
                      <SelectItem value="3">Well Above Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gluc">Glucose Level</Label>
                  <Select onValueChange={(value) => handleSelectChange('gluc', value)} defaultValue={formData.gluc}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Normal</SelectItem>
                      <SelectItem value="2">Above Normal</SelectItem>
                      <SelectItem value="3">Well Above Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smoke">Do you smoke?</Label>
                  <Select onValueChange={(value) => handleSelectChange('smoke', value)} defaultValue={formData.smoke}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alco">Do you consume alcohol?</Label>
                  <Select onValueChange={(value) => handleSelectChange('alco', value)} defaultValue={formData.alco}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Are you physically active?</Label>
                  <Select onValueChange={(value) => handleSelectChange('active', value)} defaultValue={formData.active}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {loading ? 'Processing...' : 'Assess Cardiovascular Risk'}
              </Button>
            </form>

            {result !== null && (
              <motion.div
                className="mt-8 border rounded-lg p-6 bg-card/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-4">Assessment Results</h3>

                <div
                  className={`p-4 rounded-md mb-6 flex items-center ${
                    result === 1 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                  }`}
                >
                  {result === 1 ? <AlertCircle className="mr-2 h-6 w-6" /> : <CheckCircle className="mr-2 h-6 w-6" />}
                  <div>
                    <div className="font-medium text-lg">
                      {result === 1
                        ? 'Warning: High risk of cardiovascular disease detected'
                        : 'Result: Low risk of cardiovascular disease detected'}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      {result === 1
                        ? 'We recommend consulting with a healthcare professional'
                        : 'Continue maintaining your healthy habits'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-3">Risk Factors Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-background/50 rounded-md">
                      <div className="text-sm text-muted-foreground">Blood Pressure</div>
                      <div className="text-xl">
                        {formData.ap_hi}/{formData.ap_lo} mmHg
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {parseInt(formData.ap_hi) >= 140 || parseInt(formData.ap_lo) >= 90
                          ? 'Hypertension detected'
                          : parseInt(formData.ap_hi) >= 120 || parseInt(formData.ap_lo) >= 80
                            ? 'Elevated'
                            : 'Normal'}
                      </div>
                    </div>
                    <div className="p-3 bg-background/50 rounded-md">
                      <div className="text-sm text-muted-foreground">BMI</div>
                      <div className="text-xl">
                        {(parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {parseInt(formData.height) && parseInt(formData.weight)
                          ? parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2) > 25
                            ? 'Overweight'
                            : 'Normal'
                          : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <ul className="space-y-2 pl-5 list-disc">
                    {recommendations.map((rec, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {rec}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

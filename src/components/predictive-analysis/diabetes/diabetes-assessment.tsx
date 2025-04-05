'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Activity, Heart, Lung, Thermometer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface DiabetesAssessmentProps {
  session: any;
  supabase: any;
}

export function DiabetesAssessment({ session, supabase }: DiabetesAssessmentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    hypertension: '0',
    heart_disease: '0',
    smoking_history: '',
    bmi: '',
    HbA1c_level: '',
    blood_glucose_level: '',
  });

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(0);

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

  const saveAssessment = async (risk_level: string) => {
    if (!session?.user?.id) {
      throw new Error('User must be logged in to save assessment');
    }

    const { error } = await supabase.from('diabetes_assessments').insert([
      {
        user_id: session.user.id,
        gender: formData.gender,
        age: parseInt(formData.age),
        hypertension: formData.hypertension === '1',
        heart_disease: formData.heart_disease === '1',
        smoking_history: formData.smoking_history,
        bmi: parseFloat(formData.bmi),
        hba1c_level: parseFloat(formData.HbA1c_level),
        blood_glucose_level: parseInt(formData.blood_glucose_level),
        risk_level,
        recommendations: [],
        ml_prediction: prediction,
      },
    ]);

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const predictDiabetes = async () => {
    try {
      // This would actually call the backend API that uses the .pkl file
      // For now, simulating the prediction based on medical criteria
      const bloodGlucose = parseFloat(formData.blood_glucose_level);
      const hba1c = parseFloat(formData.HbA1c_level);
      const hasBothRiskFactors = formData.hypertension === '1' && formData.heart_disease === '1';

      // Simple risk calculation algorithm (would be replaced by ML model)
      let diabetesRisk = 0;

      if (bloodGlucose >= 200) diabetesRisk += 0.5;
      else if (bloodGlucose >= 140) diabetesRisk += 0.3;
      else diabetesRisk += 0.1;

      if (hba1c >= 6.5) diabetesRisk += 0.5;
      else if (hba1c >= 5.7) diabetesRisk += 0.3;
      else diabetesRisk += 0.1;

      if (hasBothRiskFactors) diabetesRisk += 0.2;

      // Convert to percentage
      const predictionScore = Math.min(diabetesRisk, 1) * 100;
      return Math.round(predictionScore);
    } catch (error) {
      console.error('Error predicting diabetes:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get prediction from ML model (simulated)
      const diabetesPrediction = await predictDiabetes();
      setPrediction(diabetesPrediction);

      // Calculate risk level based on medical criteria
      const bloodGlucose = parseFloat(formData.blood_glucose_level);
      const hba1c = parseFloat(formData.HbA1c_level);

      let risk_level;
      if (bloodGlucose >= 200 || hba1c >= 6.5) {
        risk_level = 'high';
      } else if (bloodGlucose >= 140 || hba1c >= 5.7) {
        risk_level = 'moderate';
      } else {
        risk_level = 'low';
      }

      // Save assessment to Supabase
      if (session?.user?.id) {
        await saveAssessment(risk_level);
      }

      setReport({
        date: new Date().toLocaleDateString(),
        risk_level,
        prediction: diabetesPrediction,
        metrics: {
          bmi: parseFloat(formData.bmi),
          blood_glucose: parseFloat(formData.blood_glucose_level),
          HbA1c: parseFloat(formData.HbA1c_level),
        },
        recommendations:
          risk_level === 'high'
            ? [
                'Schedule an appointment with a healthcare provider for a comprehensive diabetes evaluation',
                'Monitor blood glucose levels regularly',
                'Maintain a balanced, low-sugar diet',
                'Engage in regular physical activity',
                'Consider consulting with a diabetes educator',
              ]
            : risk_level === 'moderate'
              ? [
                  'Monitor blood glucose levels',
                  'Make dietary modifications',
                  'Increase physical activity',
                  'Schedule follow-up assessment',
                ]
              : [
                  'Maintain healthy lifestyle habits',
                  'Continue regular exercise routine',
                  'Follow a balanced diet',
                  'Schedule regular check-ups',
                ],
      });

      toast({
        title: 'Assessment Complete',
        description: 'Your diabetes risk assessment has been processed successfully.',
      });
    } catch (error: any) {
      console.error('Error processing assessment:', error);
      setError('Failed to process assessment. Please try again.');
      toast({
        title: 'Assessment Failed',
        description: error.message || 'An error occurred during assessment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const formContainerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const nextFormStep = () => {
    setFormStep((prevStep) => prevStep + 1);
  };

  const prevFormStep = () => {
    setFormStep((prevStep) => prevStep - 1);
  };

  if (!session) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-4xl mx-auto backdrop-blur-md bg-card/60 border border-amber-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center text-amber-600 mb-4">
              <AlertCircle className="mr-2 animate-pulse" />
              <p>Please sign in to use the Diabetes Risk Assessment tool.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm border border-blue-500/10 shadow-xl">
        <CardContent className="pt-6">
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                Diabetes Risk Assessment
              </h2>
              <p className="text-muted-foreground mt-2">Enter patient information for diabetes risk evaluation</p>
            </motion.div>

            {error && (
              <motion.div
                className="bg-destructive/20 text-destructive p-3 rounded-md flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="mr-2" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {formStep === 0 && (
                <motion.div
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div
                    className="flex items-center justify-center mb-6 p-4 bg-blue-500/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Activity className="h-10 w-10 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Basic details needed for assessment</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange('gender', value)}
                        defaultValue={formData.gender}
                      >
                        <SelectTrigger className="border-blue-500/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="120"
                        className="border-blue-500/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="smoking_history">Smoking History</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange('smoking_history', value)}
                        defaultValue={formData.smoking_history}
                      >
                        <SelectTrigger className="border-blue-500/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select Smoking History" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="former">Former</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="bmi">BMI</Label>
                      <Input
                        type="number"
                        id="bmi"
                        name="bmi"
                        value={formData.bmi}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        min="10"
                        max="50"
                        className="border-blue-500/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {formStep === 1 && (
                <motion.div
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div
                    className="flex items-center justify-center mb-6 p-4 bg-blue-500/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Heart className="h-10 w-10 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Medical History</h3>
                      <p className="text-sm text-muted-foreground">Pre-existing conditions</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="hypertension">Hypertension</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange('hypertension', value)}
                        defaultValue={formData.hypertension}
                      >
                        <SelectTrigger className="border-blue-500/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="heart_disease">Heart Disease</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange('heart_disease', value)}
                        defaultValue={formData.heart_disease}
                      >
                        <SelectTrigger className="border-blue-500/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex justify-between pt-4 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button type="button" onClick={prevFormStep} variant="outline" className="w-1/2 border-blue-500/20">
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div
                    className="flex items-center justify-center mb-6 p-4 bg-blue-500/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Thermometer className="h-10 w-10 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Lab Results</h3>
                      <p className="text-sm text-muted-foreground">Clinical measurements</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="HbA1c_level">HbA1c Level (%)</Label>
                      <Input
                        type="number"
                        id="HbA1c_level"
                        name="HbA1c_level"
                        value={formData.HbA1c_level}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        min="4"
                        max="15"
                        className="border-blue-500/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="blood_glucose_level">Blood Glucose Level (mg/dL)</Label>
                      <Input
                        type="number"
                        id="blood_glucose_level"
                        name="blood_glucose_level"
                        value={formData.blood_glucose_level}
                        onChange={handleInputChange}
                        required
                        min="70"
                        max="300"
                        className="border-blue-500/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex justify-between pt-4 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button type="button" onClick={prevFormStep} variant="outline" className="w-1/2 border-blue-500/20">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 relative overflow-hidden"
                    >
                      {loading ? (
                        <>
                          <span className="opacity-0">Assess Risk</span>
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="h-5 w-5 rounded-full border-2 border-t-transparent border-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </motion.div>
                        </>
                      ) : (
                        'Assess Risk'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </form>

            {report && (
              <motion.div
                className="mt-8 border border-blue-500/20 rounded-lg p-6 bg-card/50 backdrop-blur-sm shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              >
                <motion.h3
                  className="text-xl font-semibold mb-4 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                    Assessment Report
                  </span>
                  <span className="ml-2 text-muted-foreground">({report.date})</span>
                </motion.h3>

                <motion.div
                  className={`p-4 rounded-md mb-6 flex items-center ${
                    report.risk_level === 'high'
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                      : report.risk_level === 'moderate'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'bg-green-500/20 text-green-500 border border-green-500/30'
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {report.risk_level === 'high' ? (
                    <AlertCircle className="mr-2 h-5 w-5" />
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  <span className="font-medium">{report.risk_level.toUpperCase()} RISK</span>

                  {report.prediction && (
                    <motion.div
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5,
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <div className="text-sm">AI Prediction</div>
                      <div className="text-2xl font-bold">{report.prediction}%</div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="font-semibold mb-2">Assessment Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      className="p-3 bg-background/50 rounded-md border border-blue-500/10"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="text-sm text-muted-foreground">BMI</div>
                      <div className="text-xl">{report.metrics.bmi}</div>
                    </motion.div>
                    <motion.div
                      className="p-3 bg-background/50 rounded-md border border-blue-500/10"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="text-sm text-muted-foreground">Blood Glucose</div>
                      <div className="text-xl">{report.metrics.blood_glucose} mg/dL</div>
                    </motion.div>
                    <motion.div
                      className="p-3 bg-background/50 rounded-md border border-blue-500/10"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="text-sm text-muted-foreground">HbA1c</div>
                      <div className="text-xl">{report.metrics.HbA1c}%</div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <ul className="space-y-2 pl-5 list-none">
                    {report.recommendations.map((rec: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-start"
                      >
                        <motion.div
                          className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0"
                          whileHover={{ scale: 1.2, backgroundColor: 'rgba(59, 130, 246, 0.3)' }}
                        >
                          <motion.div
                            className="h-2 w-2 rounded-full bg-blue-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                          />
                        </motion.div>
                        <span>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

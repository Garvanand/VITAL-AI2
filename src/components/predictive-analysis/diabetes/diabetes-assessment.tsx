'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Activity, Heart, Lung, Thermometer, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
    // Only attempt to save if user is logged in and supabase client exists
    if (!session?.user?.id || !supabase) {
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error in saveAssessment:', error);
      // Continue with assessment flow even if saving fails
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

      // Save assessment to Supabase if user is logged in
      await saveAssessment(risk_level);

      // Set flag to show login prompt if user is not logged in
      if (!session?.user?.id) {
        setShowLoginPrompt(true);
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

  // Helper component for tooltips
  const FieldTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-[#15E3E3]/70 ml-1 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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

  // Display report after assessment
  if (report) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border border-[#15E3E3]/10 backdrop-blur-sm bg-card/30">
            <CardContent className="p-0">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Diabetes Risk Assessment Report</h2>
                <div className="text-sm text-muted-foreground mb-4">Generated on {report.date}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Risk Assessment</h3>
                    <div className="mb-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-muted-foreground">Diabetes Risk Level:</span>
                        <span
                          className={`text-sm font-semibold ${
                            report.risk_level === 'high'
                              ? 'text-[#ff4d4d]'
                              : report.risk_level === 'moderate'
                                ? 'text-[#fff800]'
                                : 'text-[#15E3E3]'
                          }`}
                        >
                          {report.risk_level.charAt(0).toUpperCase() + report.risk_level.slice(1)}
                        </span>
                      </div>

                      {/* Risk level visualization */}
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <motion.div
                          className={`h-full ${
                            report.risk_level === 'high'
                              ? 'bg-[#ff4d4d]'
                              : report.risk_level === 'moderate'
                                ? 'bg-[#fff800]'
                                : 'bg-[#15E3E3]'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${report.prediction}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-right">
                        Estimated risk: {report.prediction}%
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-3 mt-6">Key Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">BMI:</span>
                        <span className="text-sm font-medium">{report.metrics.bmi.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Blood Glucose (mg/dL):</span>
                        <span className="text-sm font-medium">{report.metrics.blood_glucose}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">HbA1c Level (%):</span>
                        <span className="text-sm font-medium">{report.metrics.HbA1c.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-[#15E3E3] mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {showLoginPrompt && (
                      <motion.div
                        className="mt-6 p-3 bg-[#15E3E3]/10 border border-[#15E3E3]/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h4 className="text-sm font-medium mb-1">Want to save your results?</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Create an account or sign in to save this assessment and track your progress over time.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-xs h-8 border-[#15E3E3]/30 hover:bg-[#15E3E3]/10"
                            size="sm"
                            onClick={() => (window.location.href = '/login')}
                          >
                            Sign In
                          </Button>
                          <Button
                            className="text-xs h-8 bg-[#15E3E3] hover:bg-[#15E3E3]/80 text-black"
                            size="sm"
                            onClick={() => (window.location.href = '/signup')}
                          >
                            Create Account
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#15E3E3]/5 border-t border-[#15E3E3]/10">
                <Button
                  variant="outline"
                  className="w-full border-[#15E3E3]/20 hover:bg-[#15E3E3]/10"
                  onClick={() => {
                    setReport(null);
                    setFormStep(0);
                    setFormData({
                      gender: '',
                      age: '',
                      hypertension: '0',
                      heart_disease: '0',
                      smoking_history: '',
                      bmi: '',
                      HbA1c_level: '',
                      blood_glucose_level: '',
                    });
                  }}
                >
                  Start New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            This assessment is for informational purposes only and does not constitute medical advice. Consult with a
            healthcare professional for proper diagnosis and treatment.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-3xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border border-[#15E3E3]/10 backdrop-blur-sm bg-card/30 overflow-hidden">
        <CardContent className="p-6">
          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Form header */}
            <div className="text-center mb-6">
              <motion.div variants={itemVariants}>
                <div
                  className="w-16 h-16 mx-auto rounded-full mb-4 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(21, 227, 227, 0.2), rgba(21, 227, 227, 0.05))',
                    boxShadow: '0 0 20px rgba(21, 227, 227, 0.15)',
                  }}
                >
                  <Activity className="h-8 w-8 text-[#15E3E3]" />
                </div>
                <h2 className="text-2xl font-bold">Diabetes Risk Assessment</h2>
              </motion.div>
              <motion.p className="text-sm text-muted-foreground mt-2" variants={itemVariants}>
                Complete the form below to assess your diabetes risk factors
              </motion.p>
            </div>

            {/* Form progress indicator */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Step {formStep + 1} of 3</span>
                <span className="text-xs text-[#15E3E3]">{Math.round(((formStep + 1) / 3) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#15E3E3]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((formStep + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                className="bg-red-500/10 text-red-500 p-3 rounded-md border border-red-500/20 text-sm flex items-start gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>{error}</div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {formStep === 0 && (
                <motion.div
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div
                    className="flex items-center justify-center mb-6 p-4 bg-[#15E3E3]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Activity className="h-10 w-10 text-[#15E3E3] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Basic details about you</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="gender">Gender</Label>
                        <FieldTooltip content="Your biological sex can influence certain risk factors for diabetes." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('gender', value)}
                        defaultValue={formData.gender}
                      >
                        <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="age">Age</Label>
                        <FieldTooltip content="Risk of type 2 diabetes increases with age, especially after 45." />
                      </div>
                      <Input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="18"
                        max="120"
                        className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="smoking_history">Smoking History</Label>
                      <FieldTooltip content="Smoking can increase insulin resistance and the risk of type 2 diabetes." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('smoking_history', value)}
                      defaultValue={formData.smoking_history}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="former">Former</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                      <FieldTooltip content="BMI values over 25 can increase diabetes risk. BMI is calculated as weight(kg)/height²(m)." />
                    </div>
                    <Input
                      type="number"
                      id="bmi"
                      name="bmi"
                      value={formData.bmi}
                      onChange={handleInputChange}
                      required
                      step="0.1"
                      min="15"
                      max="50"
                      className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                    />
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-block px-2 py-1 mr-2 bg-green-500/10 text-green-500 rounded">
                        18.5-24.9: Healthy
                      </span>
                      <span className="inline-block px-2 py-1 mr-2 bg-amber-500/10 text-amber-500 rounded">
                        25-29.9: Overweight
                      </span>
                      <span className="inline-block px-2 py-1 bg-red-500/10 text-red-500 rounded">30+: Obese</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-full md:w-auto bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
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
                    className="flex items-center justify-center mb-6 p-4 bg-[#15E3E3]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Heart className="h-10 w-10 text-[#15E3E3] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Medical History</h3>
                      <p className="text-sm text-muted-foreground">Your existing health conditions</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="hypertension">Hypertension (High Blood Pressure)</Label>
                        <FieldTooltip content="Hypertension and diabetes often occur together and can increase risk of complications." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('hypertension', value)}
                        defaultValue={formData.hypertension}
                      >
                        <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="heart_disease">Heart Disease</Label>
                        <FieldTooltip content="People with heart disease have a higher risk of developing type 2 diabetes." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('heart_disease', value)}
                        defaultValue={formData.heart_disease}
                      >
                        <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
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
                    <Button
                      type="button"
                      onClick={prevFormStep}
                      variant="outline"
                      className="w-1/2 border-[#15E3E3]/20"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-1/2 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black"
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
                    className="flex items-center justify-center mb-6 p-4 bg-[#15E3E3]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Thermometer className="h-10 w-10 text-[#15E3E3] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Lab Results</h3>
                      <p className="text-sm text-muted-foreground">Clinical measurements</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="HbA1c_level">HbA1c Level (%)</Label>
                        <FieldTooltip content="HbA1c measures average blood glucose over 2-3 months. Normal: below 5.7%, Prediabetes: 5.7-6.4%, Diabetes: 6.5% or higher." />
                      </div>
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
                        className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Normal: &lt;5.7%</span>
                        <span>Prediabetes: 5.7-6.4%</span>
                        <span>Diabetes: ≥6.5%</span>
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="blood_glucose_level">Blood Glucose Level (mg/dL)</Label>
                        <FieldTooltip content="Fasting blood glucose levels. Normal: below 100 mg/dL, Prediabetes: 100-125 mg/dL, Diabetes: 126 mg/dL or higher." />
                      </div>
                      <Input
                        type="number"
                        id="blood_glucose_level"
                        name="blood_glucose_level"
                        value={formData.blood_glucose_level}
                        onChange={handleInputChange}
                        required
                        min="70"
                        max="300"
                        className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Normal: &lt;100</span>
                        <span>Prediabetes: 100-125</span>
                        <span>Diabetes: ≥126</span>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex justify-between pt-4 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="button"
                      onClick={prevFormStep}
                      variant="outline"
                      className="w-1/2 border-[#15E3E3]/20"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/80 hover:opacity-90 text-black relative overflow-hidden"
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
                              className="h-5 w-5 rounded-full border-2 border-t-transparent border-black"
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
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

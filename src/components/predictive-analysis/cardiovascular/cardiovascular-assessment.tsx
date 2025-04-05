'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Activity, Heart, Thermometer, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CardiovascularAssessmentProps {
  session: any;
  supabase: any;
}

export function CardiovascularAssessment({ session, supabase }: CardiovascularAssessmentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
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
      const { error } = await supabase.from('cardio_assessments').insert([
        {
          user_id: session.user.id,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseInt(formData.height),
          weight: parseFloat(formData.weight),
          ap_hi: parseInt(formData.ap_hi),
          ap_lo: parseInt(formData.ap_lo),
          cholesterol: parseInt(formData.cholesterol),
          gluc: parseInt(formData.gluc),
          smoke: formData.smoke === '1',
          alco: formData.alco === '1',
          active: formData.active === '1',
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

  const predictCardioRisk = async () => {
    try {
      // This would actually call the backend API that uses the .pkl file
      // For now, simulating the prediction based on medical criteria
      const age = parseInt(formData.age);
      const systolic = parseInt(formData.ap_hi);
      const diastolic = parseInt(formData.ap_lo);
      const cholesterol = parseInt(formData.cholesterol);
      const isSmoke = formData.smoke === '1';
      const isActive = formData.active === '1';
      const isAlcohol = formData.alco === '1';

      // Simple risk calculation algorithm (would be replaced by ML model)
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

      // Alcohol risk
      if (isAlcohol) cardioRisk += 0.1;

      // Physical activity (protective)
      if (isActive) cardioRisk -= 0.1;

      // Convert to percentage (cap at 100%)
      const predictionScore = Math.min(cardioRisk * 100, 100);
      return Math.round(predictionScore);
    } catch (error) {
      console.error('Error predicting cardiovascular risk:', error);
      return null;
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
      // Get prediction from ML model (simulated)
      const cardioRiskScore = await predictCardioRisk();
      setPrediction(cardioRiskScore);

      // Calculate risk level based on prediction score
      let risk_level;
      if (cardioRiskScore >= 70) {
        risk_level = 'high';
      } else if (cardioRiskScore >= 40) {
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
        prediction: cardioRiskScore,
        metrics: {
          age: parseInt(formData.age),
          systolic: parseInt(formData.ap_hi),
          diastolic: parseInt(formData.ap_lo),
          cholesterol: parseInt(formData.cholesterol),
          bmi: (parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1),
        },
        recommendations:
          risk_level === 'high'
            ? [
                'Schedule an appointment with a cardiologist for a comprehensive evaluation',
                'Monitor your blood pressure regularly',
                'Consider dietary changes to reduce cholesterol intake',
                'Start a gradual exercise program after consulting with your doctor',
                'If you smoke, consider a smoking cessation program',
              ]
            : risk_level === 'moderate'
              ? [
                  'Schedule a follow-up with your primary care physician',
                  'Adopt a heart-healthy diet low in sodium and saturated fats',
                  'Engage in regular moderate physical activity',
                  'Monitor your blood pressure monthly',
                  'Reduce stress through mindfulness or relaxation techniques',
                ]
              : [
                  'Maintain a heart-healthy lifestyle',
                  'Continue with regular physical activity',
                  'Follow a balanced diet rich in fruits and vegetables',
                  'Schedule regular health check-ups',
                ],
      });

      toast({
        title: 'Assessment Complete',
        description: 'Your cardiovascular risk assessment has been processed successfully.',
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
          <Info className="h-4 w-4 text-[#ff4d4d]/70 ml-1 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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

  if (!session) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-4xl mx-auto backdrop-blur-md bg-card/60 border border-amber-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center text-amber-600 mb-4">
              <AlertCircle className="mr-2 animate-pulse" />
              <p>Please sign in to use the Cardiovascular Risk Assessment tool.</p>
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
          <Card className="overflow-hidden border border-[#ff4d4d]/10 backdrop-blur-sm bg-card/30">
            <CardContent className="p-0">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Cardiovascular Risk Assessment Report</h2>
                <div className="text-sm text-muted-foreground mb-4">Generated on {report.date}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Risk Assessment</h3>
                    <div className="mb-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-muted-foreground">Cardiovascular Risk Level:</span>
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
                        <span className="text-sm text-muted-foreground">Age:</span>
                        <span className="text-sm font-medium">{report.metrics.age} years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Blood Pressure:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.systolic}/{report.metrics.diastolic} mmHg
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cholesterol Level:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.cholesterol === 1
                            ? 'Normal'
                            : report.metrics.cholesterol === 2
                              ? 'Above Normal'
                              : 'Well Above Normal'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">BMI:</span>
                        <span className="text-sm font-medium">{report.metrics.bmi}</span>
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
                          <CheckCircle className="h-5 w-5 text-[#ff4d4d] mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {showLoginPrompt && (
                      <motion.div
                        className="mt-6 p-3 bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 rounded-lg"
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
                            className="text-xs h-8 border-[#ff4d4d]/30 hover:bg-[#ff4d4d]/10"
                            size="sm"
                            onClick={() => (window.location.href = '/login')}
                          >
                            Sign In
                          </Button>
                          <Button
                            className="text-xs h-8 bg-[#ff4d4d] hover:bg-[#ff4d4d]/80 text-white"
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

              <div className="p-4 bg-[#ff4d4d]/5 border-t border-[#ff4d4d]/10">
                <Button
                  variant="outline"
                  className="w-full border-[#ff4d4d]/20 hover:bg-[#ff4d4d]/10"
                  onClick={() => {
                    setReport(null);
                    setFormStep(0);
                    setFormData({
                      age: '',
                      gender: '',
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
      <Card className="border border-[#ff4d4d]/10 backdrop-blur-sm bg-card/30 overflow-hidden">
        <CardContent className="p-6">
          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Form header */}
            <div className="text-center mb-6">
              <motion.div variants={itemVariants}>
                <div
                  className="w-16 h-16 mx-auto rounded-full mb-4 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.2), rgba(255, 77, 77, 0.05))',
                    boxShadow: '0 0 20px rgba(255, 77, 77, 0.15)',
                  }}
                >
                  <Heart className="h-8 w-8 text-[#ff4d4d]" />
                </div>
                <h2 className="text-2xl font-bold">Cardiovascular Risk Assessment</h2>
              </motion.div>
              <motion.p className="text-sm text-muted-foreground mt-2" variants={itemVariants}>
                Complete the form below to assess your cardiovascular risk factors
              </motion.p>
            </div>

            {/* Form progress indicator */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Step {formStep + 1} of 3</span>
                <span className="text-xs text-[#ff4d4d]">{Math.round(((formStep + 1) / 3) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#ff4d4d]"
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
                    className="flex items-center justify-center mb-6 p-4 bg-[#ff4d4d]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Activity className="h-10 w-10 text-[#ff4d4d] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Basic details about you</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="gender">Gender</Label>
                        <FieldTooltip content="Gender can influence cardiovascular risk profiles." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('gender', value)}
                        defaultValue={formData.gender}
                      >
                        <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="age">Age</Label>
                        <FieldTooltip content="Risk of cardiovascular disease increases with age." />
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
                        className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="height">Height (cm)</Label>
                        <FieldTooltip content="Used to calculate BMI, which is a risk factor for heart disease." />
                      </div>
                      <Input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        required
                        min="100"
                        max="250"
                        className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <FieldTooltip content="Used to calculate BMI, which is a risk factor for heart disease." />
                      </div>
                      <Input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        min="30"
                        max="300"
                        className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-full md:w-auto bg-gradient-to-r from-[#ff4d4d] to-[#ff4d4d]/80 hover:opacity-90 text-white"
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
                    className="flex items-center justify-center mb-6 p-4 bg-[#ff4d4d]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Heart className="h-10 w-10 text-[#ff4d4d] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Lifestyle Factors</h3>
                      <p className="text-sm text-muted-foreground">Your habits and activities</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="smoke">Smoking Status</Label>
                        <FieldTooltip content="Smoking significantly increases risk of cardiovascular disease." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('smoke', value)}
                        defaultValue={formData.smoke}
                      >
                        <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Non-smoker</SelectItem>
                          <SelectItem value="1">Smoker</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="alco">Alcohol Consumption</Label>
                        <FieldTooltip content="Regular heavy alcohol consumption increases cardiovascular risk." />
                      </div>
                      <Select onValueChange={(value) => handleSelectChange('alco', value)} defaultValue={formData.alco}>
                        <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No/Moderate</SelectItem>
                          <SelectItem value="1">Regular/Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="active">Physical Activity</Label>
                      <FieldTooltip content="Regular physical activity reduces cardiovascular disease risk." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('active', value)}
                      defaultValue={formData.active}
                    >
                      <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Inactive/Sedentary</SelectItem>
                        <SelectItem value="1">Regularly Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

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
                      className="w-1/2 border-[#ff4d4d]/20"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextFormStep}
                      className="w-1/2 bg-gradient-to-r from-[#ff4d4d] to-[#ff4d4d]/80 hover:opacity-90 text-white"
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
                    className="flex items-center justify-center mb-6 p-4 bg-[#ff4d4d]/10 rounded-lg"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Thermometer className="h-10 w-10 text-[#ff4d4d] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Medical Measurements</h3>
                      <p className="text-sm text-muted-foreground">Clinical information</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="ap_hi">Systolic Blood Pressure (mmHg)</Label>
                        <FieldTooltip content="The top number in blood pressure reading. Normal: below 120, Elevated: 120-129, High: 130+" />
                      </div>
                      <Input
                        type="number"
                        id="ap_hi"
                        name="ap_hi"
                        value={formData.ap_hi}
                        onChange={handleInputChange}
                        required
                        min="70"
                        max="250"
                        className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Normal: &lt;120</span>
                        <span>Elevated: 120-129</span>
                        <span>High: ≥130</span>
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="ap_lo">Diastolic Blood Pressure (mmHg)</Label>
                        <FieldTooltip content="The bottom number in blood pressure reading. Normal: below 80, High: 80+" />
                      </div>
                      <Input
                        type="number"
                        id="ap_lo"
                        name="ap_lo"
                        value={formData.ap_lo}
                        onChange={handleInputChange}
                        required
                        min="40"
                        max="180"
                        className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Normal: &lt;80</span>
                        <span>High: ≥80</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="cholesterol">Cholesterol Level</Label>
                        <FieldTooltip content="Higher levels increase risk of cardiovascular disease." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('cholesterol', value)}
                        defaultValue={formData.cholesterol}
                      >
                        <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Normal</SelectItem>
                          <SelectItem value="2">Above Normal</SelectItem>
                          <SelectItem value="3">Well Above Normal</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="gluc">Glucose Level</Label>
                        <FieldTooltip content="Elevated blood glucose is a risk factor for cardiovascular disease." />
                      </div>
                      <Select onValueChange={(value) => handleSelectChange('gluc', value)} defaultValue={formData.gluc}>
                        <SelectTrigger className="border-[#ff4d4d]/20 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Normal</SelectItem>
                          <SelectItem value="2">Above Normal</SelectItem>
                          <SelectItem value="3">Well Above Normal</SelectItem>
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
                      className="w-1/2 border-[#ff4d4d]/20"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 bg-gradient-to-r from-[#ff4d4d] to-[#ff4d4d]/80 hover:opacity-90 text-white relative overflow-hidden"
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
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Brain, Info, Moon, BatteryCharging, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MentalHealthAssessmentProps {
  session?: any;
  supabase?: any;
}

export function MentalHealthAssessment({ session, supabase }: MentalHealthAssessmentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    sleep_hours: '',
    stress_level: '3',
    anxiety_frequency: '2',
    physical_activity: '2',
    social_support: '3',
    work_life_balance: '3',
    previous_diagnosis: '0',
    medication: '0',
  });

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Sample responses for demonstration (would be replaced by actual API)
  const BOT_RESPONSES = {
    greeting:
      "Hello! I'm your mental health support assistant. I'm here to listen, provide support, and help you with personalized CBT exercises and self-care strategies. How are you feeling today?",

    great:
      "I'm glad to hear you're feeling great! It's important to recognize and appreciate these positive moments. What's been contributing to your positive mood lately?",

    good: "It's good to hear you're doing well. Acknowledging when we're in a good place mentally is an important part of self-awareness. Is there anything specific that's having a positive impact on your mood?",

    okay: "Thanks for sharing that you're feeling okay. Sometimes being 'okay' is just fine - not every day needs to be exceptional. Is there anything on your mind you'd like to talk about?",

    down: "I'm sorry to hear you're feeling down. It takes courage to acknowledge these feelings. Would you like to talk about what might be contributing to this feeling? Sometimes putting things into words can help us process them better.",

    struggling:
      "I appreciate you sharing that you're struggling right now. That can be really difficult, and reaching out is an important step. Would it help to explore what's making things hard right now, or would you prefer some grounding techniques to help in the moment?",

    generic: [
      'I understand how that might feel. Could you tell me more about that?',
      'Thank you for sharing that with me. How long have you been feeling this way?',
      'That sounds challenging. What strategies have helped you cope with similar situations in the past?',
      'It takes courage to talk about these things. Have you considered how your thoughts might be influencing these feelings?',
      "I'm here to support you. What would feel most helpful right now - exploring this further, or discussing some potential coping strategies?",
      'Your feelings are valid. Sometimes it can help to practice mindfulness when dealing with difficult emotions. Would you like to try a brief mindfulness exercise?',
      "I hear you. Remember that it's okay to prioritize your own well-being. What's one small thing you could do today to care for yourself?",
    ],
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [userMood, setUserMood] = useState<any>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const moods = [
    { emoji: '😊', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😔', label: 'Down' },
    { emoji: '😢', label: 'Struggling' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodSelect = async (mood: { emoji: string; label: string }) => {
    setUserMood(mood);
    const moodMessage = `I'm feeling ${mood.label}`;
    addMessage('user', moodMessage);
    await getChatbotResponse(moodMessage);
  };

  const addMessage = (type: 'user' | 'bot', content: string) => {
    setMessages((prev) => [...prev, { type, content }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get prediction from ML model (simulated)
      const mentalHealthRiskScore = await predictMentalHealthRisk();
      setPrediction(mentalHealthRiskScore);

      // Calculate risk level based on score
      let risk_level;
      if (mentalHealthRiskScore >= 70) {
        risk_level = 'high';
      } else if (mentalHealthRiskScore >= 40) {
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
        prediction: mentalHealthRiskScore,
        metrics: {
          sleep_hours: parseFloat(formData.sleep_hours),
          stress_level: parseInt(formData.stress_level),
          anxiety_frequency: parseInt(formData.anxiety_frequency),
          social_support: parseInt(formData.social_support),
          work_life_balance: parseInt(formData.work_life_balance),
        },
        recommendations:
          risk_level === 'high'
            ? [
                'Consider scheduling an appointment with a mental health professional',
                'Establish a consistent sleep routine',
                'Practice daily stress management techniques',
                'Strengthen your social support network',
                'Set healthy boundaries between work and personal life',
              ]
            : risk_level === 'moderate'
              ? [
                  'Implement regular stress reduction activities',
                  'Prioritize adequate sleep',
                  'Engage in regular physical activity',
                  'Nurture supportive relationships',
                  'Consider mindfulness or meditation practices',
                ]
              : [
                  'Maintain your current healthy habits',
                  'Continue prioritizing good sleep hygiene',
                  'Stay physically active',
                  'Nurture your social connections',
                  'Practice preventive self-care',
                ],
      });

      toast({
        title: 'Assessment Complete',
        description: 'Your mental health assessment has been processed successfully.',
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

  // Simulated chatbot response - would be replaced with actual API call
  const getChatbotResponse = async (userMessage: string) => {
    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      let response = '';

      // Check if this is a mood message
      if (userMessage.includes("I'm feeling")) {
        const mood = userMessage.split("I'm feeling ")[1].toLowerCase();

        switch (mood) {
          case 'great':
            response = BOT_RESPONSES.great;
            break;
          case 'good':
            response = BOT_RESPONSES.good;
            break;
          case 'okay':
            response = BOT_RESPONSES.okay;
            break;
          case 'down':
            response = BOT_RESPONSES.down;
            break;
          case 'struggling':
            response = BOT_RESPONSES.struggling;
            break;
          default:
            response = BOT_RESPONSES.generic[Math.floor(Math.random() * BOT_RESPONSES.generic.length)];
        }
      } else {
        // For any other message, provide a random response
        response = BOT_RESPONSES.generic[Math.floor(Math.random() * BOT_RESPONSES.generic.length)];
      }

      addMessage('bot', response);
    } catch (err) {
      addMessage('bot', 'I apologize, but I am having trouble responding right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (label: string) => {
    switch (label) {
      case 'Great':
        return <SmilePlus className="h-6 w-6" />;
      case 'Good':
        return <Smile className="h-6 w-6" />;
      case 'Okay':
        return <Meh className="h-6 w-6" />;
      case 'Down':
        return <Frown className="h-6 w-6" />;
      case 'Struggling':
        return <Angry className="h-6 w-6" />;
      default:
        return null;
    }
  };

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
      const { error } = await supabase.from('mental_health_assessments').insert([
        {
          user_id: session.user.id,
          age: parseInt(formData.age),
          gender: formData.gender,
          sleep_hours: parseFloat(formData.sleep_hours),
          stress_level: parseInt(formData.stress_level),
          anxiety_frequency: parseInt(formData.anxiety_frequency),
          physical_activity: parseInt(formData.physical_activity),
          social_support: parseInt(formData.social_support),
          work_life_balance: parseInt(formData.work_life_balance),
          previous_diagnosis: formData.previous_diagnosis === '1',
          medication: formData.medication === '1',
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

  const predictMentalHealthRisk = async () => {
    try {
      // This would actually call the backend API that uses the .pkl file
      // For now, simulating the prediction based on key risk factors
      const sleepHours = parseFloat(formData.sleep_hours);
      const stressLevel = parseInt(formData.stress_level);
      const anxietyFrequency = parseInt(formData.anxiety_frequency);
      const socialSupport = parseInt(formData.social_support);
      const workLifeBalance = parseInt(formData.work_life_balance);
      const hasPreviousDiagnosis = formData.previous_diagnosis === '1';

      // Simple risk calculation algorithm (would be replaced by ML model)
      let mentalHealthRisk = 0;

      // Sleep factor (protective when adequate)
      if (sleepHours < 6) mentalHealthRisk += 0.2;
      else if (sleepHours > 9) mentalHealthRisk += 0.1;

      // Stress level impact
      if (stressLevel >= 4) mentalHealthRisk += 0.2;
      else if (stressLevel >= 3) mentalHealthRisk += 0.1;

      // Anxiety frequency
      if (anxietyFrequency >= 4) mentalHealthRisk += 0.2;
      else if (anxietyFrequency >= 3) mentalHealthRisk += 0.1;

      // Social support (protective factor)
      if (socialSupport <= 2) mentalHealthRisk += 0.15;

      // Work-life balance (protective factor)
      if (workLifeBalance <= 2) mentalHealthRisk += 0.15;

      // Previous diagnosis is a strong predictor
      if (hasPreviousDiagnosis) mentalHealthRisk += 0.3;

      // Convert to percentage (cap at 100%)
      const predictionScore = Math.min(mentalHealthRisk * 100, 100);
      return Math.round(predictionScore);
    } catch (error) {
      console.error('Error predicting mental health risk:', error);
      return null;
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
          <Info className="h-4 w-4 text-[#15E3E3]/70 ml-1 cursor-help" />
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
              <p>Please sign in to use the Mental Health Assessment tool.</p>
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
                <h2 className="text-2xl font-bold mb-4">Mental Health Assessment Report</h2>
                <div className="text-sm text-muted-foreground mb-4">Generated on {report.date}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Risk Assessment</h3>
                    <div className="mb-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-muted-foreground">Mental Health Risk Level:</span>
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
                        <span className="text-sm text-muted-foreground">Sleep:</span>
                        <span className="text-sm font-medium">{report.metrics.sleep_hours} hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stress Level:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.stress_level === 1
                            ? 'Very Low'
                            : report.metrics.stress_level === 2
                              ? 'Low'
                              : report.metrics.stress_level === 3
                                ? 'Moderate'
                                : report.metrics.stress_level === 4
                                  ? 'High'
                                  : 'Very High'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Anxiety Frequency:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.anxiety_frequency === 1
                            ? 'Rarely'
                            : report.metrics.anxiety_frequency === 2
                              ? 'Sometimes'
                              : report.metrics.anxiety_frequency === 3
                                ? 'Often'
                                : report.metrics.anxiety_frequency === 4
                                  ? 'Very Often'
                                  : 'Almost Always'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Social Support:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.social_support === 1
                            ? 'Very Poor'
                            : report.metrics.social_support === 2
                              ? 'Poor'
                              : report.metrics.social_support === 3
                                ? 'Adequate'
                                : report.metrics.social_support === 4
                                  ? 'Good'
                                  : 'Excellent'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Work-Life Balance:</span>
                        <span className="text-sm font-medium">
                          {report.metrics.work_life_balance === 1
                            ? 'Very Poor'
                            : report.metrics.work_life_balance === 2
                              ? 'Poor'
                              : report.metrics.work_life_balance === 3
                                ? 'Adequate'
                                : report.metrics.work_life_balance === 4
                                  ? 'Good'
                                  : 'Excellent'}
                        </span>
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
                      age: '',
                      gender: '',
                      sleep_hours: '',
                      stress_level: '3',
                      anxiety_frequency: '2',
                      physical_activity: '2',
                      social_support: '3',
                      work_life_balance: '3',
                      previous_diagnosis: '0',
                      medication: '0',
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
            mental health professional for proper diagnosis and treatment.
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
                  <Brain className="h-8 w-8 text-[#15E3E3]" />
                </div>
                <h2 className="text-2xl font-bold">Mental Health Assessment</h2>
              </motion.div>
              <motion.p className="text-sm text-muted-foreground mt-2" variants={itemVariants}>
                Complete the form below to assess your mental health risk factors
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
                    <Brain className="h-10 w-10 text-[#15E3E3] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Basic details about you</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="gender">Gender</Label>
                        <FieldTooltip content="Some mental health conditions may present differently across genders." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('gender', value)}
                        defaultValue={formData.gender}
                      >
                        <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
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
                        <FieldTooltip content="Mental health risks can vary by age group." />
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
                      <Label htmlFor="sleep_hours">Average Sleep Hours (per night)</Label>
                      <FieldTooltip content="Sleep quality and duration are important indicators of mental health." />
                    </div>
                    <Input
                      type="number"
                      id="sleep_hours"
                      name="sleep_hours"
                      value={formData.sleep_hours}
                      onChange={handleInputChange}
                      required
                      step="0.5"
                      min="3"
                      max="12"
                      className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Poor: &lt;6 hours</span>
                      <span>Ideal: 7-9 hours</span>
                      <span>Excessive: &gt;9 hours</span>
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
                      <h3 className="text-xl font-semibold">Emotional Wellbeing</h3>
                      <p className="text-sm text-muted-foreground">Your emotional health indicators</p>
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="stress_level">Stress Level</Label>
                      <FieldTooltip content="Chronic stress can contribute to mental health challenges." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('stress_level', value)}
                      defaultValue={formData.stress_level}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Low</SelectItem>
                        <SelectItem value="2">Low</SelectItem>
                        <SelectItem value="3">Moderate</SelectItem>
                        <SelectItem value="4">High</SelectItem>
                        <SelectItem value="5">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="anxiety_frequency">Anxiety Frequency</Label>
                      <FieldTooltip content="How often you experience feelings of anxiety or worry." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('anxiety_frequency', value)}
                      defaultValue={formData.anxiety_frequency}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Rarely</SelectItem>
                        <SelectItem value="2">Sometimes</SelectItem>
                        <SelectItem value="3">Often</SelectItem>
                        <SelectItem value="4">Very Often</SelectItem>
                        <SelectItem value="5">Almost Always</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="physical_activity">Physical Activity Level</Label>
                      <FieldTooltip content="Regular physical activity can positively impact mental health." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('physical_activity', value)}
                      defaultValue={formData.physical_activity}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Sedentary</SelectItem>
                        <SelectItem value="2">Light Activity</SelectItem>
                        <SelectItem value="3">Moderate Activity</SelectItem>
                        <SelectItem value="4">Active</SelectItem>
                        <SelectItem value="5">Very Active</SelectItem>
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
                    <BatteryCharging className="h-10 w-10 text-[#15E3E3] mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Support & History</h3>
                      <p className="text-sm text-muted-foreground">Your support systems and background</p>
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="social_support">Social Support Network</Label>
                      <FieldTooltip content="Strong social connections are protective factors for mental health." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('social_support', value)}
                      defaultValue={formData.social_support}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Poor</SelectItem>
                        <SelectItem value="2">Poor</SelectItem>
                        <SelectItem value="3">Adequate</SelectItem>
                        <SelectItem value="4">Good</SelectItem>
                        <SelectItem value="5">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center">
                      <Label htmlFor="work_life_balance">Work-Life Balance</Label>
                      <FieldTooltip content="Balancing professional and personal life is important for mental wellbeing." />
                    </div>
                    <Select
                      onValueChange={(value) => handleSelectChange('work_life_balance', value)}
                      defaultValue={formData.work_life_balance}
                    >
                      <SelectTrigger className="border-[#15E3E3]/20 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Poor</SelectItem>
                        <SelectItem value="2">Poor</SelectItem>
                        <SelectItem value="3">Adequate</SelectItem>
                        <SelectItem value="4">Good</SelectItem>
                        <SelectItem value="5">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <div className="flex items-center">
                        <Label htmlFor="previous_diagnosis">Previous Mental Health Diagnosis</Label>
                        <FieldTooltip content="Previous diagnoses can help assess your current risk profile." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('previous_diagnosis', value)}
                        defaultValue={formData.previous_diagnosis}
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
                        <Label htmlFor="medication">Currently Taking Mental Health Medication</Label>
                        <FieldTooltip content="Current medication can affect your mental health status." />
                      </div>
                      <Select
                        onValueChange={(value) => handleSelectChange('medication', value)}
                        defaultValue={formData.medication}
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

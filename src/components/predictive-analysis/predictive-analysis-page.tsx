'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@/contexts/UserContext';
import { Footer } from '@/components/home/footer/footer';
import { DiabetesAssessment } from '@/components/predictive-analysis/diabetes/diabetes-assessment';
import { CardiovascularAssessment } from '@/components/predictive-analysis/cardiovascular/cardiovascular-assessment';
import { MentalHealthAssessment } from '@/components/predictive-analysis/mental-health/mental-health-assessment';
import { SkinDiseaseAssessment } from '@/components/predictive-analysis/skin-disease/skin-disease-assessment';
import { AllergyManagement } from '@/components/predictive-analysis/allergy/allergy-management';
import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { BarChart3, LineChart, Activity, Heart, Dna, Stethoscope, Brain, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Custom animated tab trigger
function AnimatedTabTrigger({ value, activeTab, children }) {
  return (
    <TabsTrigger value={value} className="relative overflow-hidden">
      {children}
      {value === activeTab && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(21,227,227,0.3)] to-[rgba(21,227,227,0.1)] rounded-md -z-10"
          layoutId="activeTab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </TabsTrigger>
  );
}

// Assessment category details
const assessmentDetails = {
  diabetes: {
    title: 'Diabetes Risk Assessment',
    icon: <Activity className="h-8 w-8 text-[#15E3E3]" />,
    description: 'Evaluate your risk factors for diabetes based on health metrics and lifestyle factors.',
    metrics: ['Blood Glucose', 'HbA1c Levels', 'BMI', 'Family History'],
    color: '#15E3E3',
  },
  cardiovascular: {
    title: 'Cardiovascular Health Analysis',
    icon: <Heart className="h-8 w-8 text-[#ff4d4d]" />,
    description: 'Assess your heart health risk factors and receive personalized recommendations.',
    metrics: ['Blood Pressure', 'Cholesterol', 'Physical Activity', 'Smoking Status'],
    color: '#ff4d4d',
  },
  mental: {
    title: 'Mental Health Assessment',
    icon: <Brain className="h-8 w-8 text-[#15E3E3]" />,
    description: 'Measure stress levels, anxiety indicators, and overall mental wellbeing.',
    metrics: ['Stress Indicators', 'Sleep Quality', 'Mood Patterns', 'Support Systems'],
    color: '#15E3E3',
  },
  'skin-disease': {
    title: 'Skin Condition Analysis',
    icon: <ShieldAlert className="h-8 w-8 text-[#fff800]" />,
    description: 'Analyze potential skin conditions and receive guidance on next steps.',
    metrics: ['Skin Type', 'Lesion Analysis', 'Environmental Factors', 'Medical History'],
    color: '#fff800',
  },
  allergy: {
    title: 'Allergy Risk Evaluation',
    icon: <Dna className="h-8 w-8 text-[#15E3E3]" />,
    description: 'Identify potential allergens and understand your allergy risk profile.',
    metrics: ['Environmental Allergens', 'Food Sensitivities', 'Genetic Factors', 'Medical History'],
    color: '#15E3E3',
  },
};

export function PredictiveAnalysisPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('diabetes');
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const supabaseClient = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      return createClient(supabaseUrl, supabaseKey);
    }
    return null;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const fadeInUpVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeLoginStyleBackground />

      {/* Hero section with assessment details */}
      <motion.section className="relative pt-24 pb-12 overflow-hidden" style={{ opacity, scale }}>
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(21, 227, 227, 0.2) 0%, rgba(21, 227, 227, 0) 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 248, 0, 0.15) 0%, rgba(255, 248, 0, 0) 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(21, 227, 227, 0.1) 0%, rgba(21, 227, 227, 0) 70%)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </motion.div>

        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#15E3E3] to-[#15E3E3]/70">
                AI-Powered Health Analysis
              </h1>
            </motion.div>
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto" variants={itemVariants}>
              Complete a short assessment to receive personalized health insights and recommendations.
            </motion.p>
            <motion.div
              className="mt-6"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              <div className="inline-flex items-center px-4 py-2 border border-[#15E3E3]/30 rounded-full backdrop-blur-md bg-[#15E3E3]/10">
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-[#15E3E3]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="text-sm font-medium ml-2">AI Models Actively Processing</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Assessment overview card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 backdrop-blur-sm bg-card/20 border border-[#15E3E3]/10 rounded-xl overflow-hidden relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(45deg, ${assessmentDetails[activeTab].color}22, transparent)`,
                    borderRadius: 'inherit',
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${assessmentDetails[activeTab].color}33, ${assessmentDetails[activeTab].color}11)`,
                        boxShadow: `0 0 20px ${assessmentDetails[activeTab].color}33`,
                      }}
                    >
                      {assessmentDetails[activeTab].icon}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold">{assessmentDetails[activeTab].title}</h2>
                      <div className="text-sm text-muted-foreground">5-10 minutes to complete</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 text-left">
                    <p className="mb-3 text-sm text-muted-foreground">{assessmentDetails[activeTab].description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assessmentDetails[activeTab].metrics.map((metric, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-[#15E3E3]/10 border border-[#15E3E3]/20"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Main content with tabs */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative z-10"
          >
            <Tabs
              defaultValue="diabetes"
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value);
              }}
            >
              <motion.div
                className="flex justify-center mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 p-1 backdrop-blur-md bg-card/30 border border-[#15E3E3]/10 rounded-xl">
                  <AnimatedTabTrigger value="diabetes" activeTab={activeTab}>
                    Diabetes
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="cardiovascular" activeTab={activeTab}>
                    Cardiovascular
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="mental" activeTab={activeTab}>
                    Mental Health
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="skin-disease" activeTab={activeTab}>
                    Skin Disease
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="allergy" activeTab={activeTab}>
                    Allergy
                  </AnimatedTabTrigger>
                </TabsList>
              </motion.div>

              <div className="relative">
                <motion.div
                  className="absolute inset-0 -z-10 opacity-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 1.5 }}
                >
                  <div
                    className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full filter blur-[80px]"
                    style={{
                      background: 'radial-gradient(circle, rgba(21, 227, 227, 0.6) 0%, rgba(21, 227, 227, 0) 70%)',
                    }}
                  />
                  <div
                    className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full filter blur-[80px]"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 248, 0, 0.4) 0%, rgba(255, 248, 0, 0) 70%)',
                    }}
                  />
                </motion.div>

                <TabsContent value="diabetes" className="mt-6">
                  <DiabetesAssessment session={user ? { user } : null} supabase={supabaseClient} />
                </TabsContent>

                <TabsContent value="cardiovascular" className="mt-6">
                  <CardiovascularAssessment session={user ? { user } : null} supabase={supabaseClient} />
                </TabsContent>

                <TabsContent value="mental" className="mt-6">
                  <MentalHealthAssessment />
                </TabsContent>

                <TabsContent value="skin-disease" className="mt-6">
                  <SkinDiseaseAssessment session={user ? { user } : null} supabase={supabaseClient} />
                </TabsContent>

                <TabsContent value="allergy" className="mt-6">
                  <AllergyManagement session={user ? { user } : null} supabase={supabaseClient} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

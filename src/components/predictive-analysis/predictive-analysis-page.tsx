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
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Text, Trail, MeshDistortMaterial } from '@react-three/drei';

// Create medicine floating model with distortion effect
function FloatingMedical() {
  return (
    <Float speed={1.5} rotationIntensity={0.7} floatIntensity={0.7}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial color="#4d94ff" speed={2.5} distort={0.3} wireframe />
      </mesh>
    </Float>
  );
}

// Create DNA model that rotates with trail effect
function DNAModel() {
  const count = 10;
  const gap = 0.2;

  return (
    <group position={[0, 0, 0]}>
      <Trail width={1} color="#ffffff" attenuation={(t) => t * t}>
        {Array.from({ length: count }).map((_, i) => (
          <group key={i} position={[0, i * gap - (count * gap) / 2, 0]} rotation={[0, i * 0.2, 0]}>
            <mesh position={[0.5, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#fff800" emissive="#ffb700" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.5, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#4d94ff" emissive="#0066ff" emissiveIntensity={0.5} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
            </mesh>
          </group>
        ))}
      </Trail>
    </group>
  );
}

// Floating text for 3D scene
function FloatingText({ text, position, color }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={position}
        color={color}
        fontSize={0.15}
        font="/fonts/inter-var.woff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </Float>
  );
}

// 3D Scene Component with additional elements
function Scene() {
  return (
    <Canvas className="canvas" camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight position={[-10, -10, -10]} intensity={0.5} color="#4d94ff" />

      <group position={[-2, 0, 0]}>
        <FloatingMedical />
        <FloatingText text="AI Analysis" position={[0, 1.5, 0]} color="#ffffff" />
      </group>

      <group position={[2, 0, -2]} rotation={[0, Math.PI / 4, 0]}>
        <DNAModel />
        <FloatingText text="Health Data" position={[0, -1.5, 0]} color="#ffffff" />
      </group>

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}

// Custom animated tab trigger
function AnimatedTabTrigger({ value, activeTab, children }) {
  return (
    <TabsTrigger value={value} className="relative overflow-hidden">
      {children}
      {value === activeTab && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-md -z-10"
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

export function PredictiveAnalysisPage() {
  const { user } = useUser();
  const session = user ? { user } : null;
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

      {/* Hero section with 3D elements */}
      <motion.section className="relative pt-24 pb-16 overflow-hidden" style={{ opacity, scale }}>
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[#4d94ff]/20 rounded-full filter blur-3xl"
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
            className="absolute bottom-0 left-0 w-64 h-64 bg-[#fff800]/20 rounded-full filter blur-3xl"
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
            className="absolute top-1/2 left-1/4 w-48 h-48 bg-[#ff4dac]/10 rounded-full filter blur-3xl"
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
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                AI-Powered Health Analysis
              </h1>
            </motion.div>
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto" variants={itemVariants}>
              Leverage the power of artificial intelligence to gain insights into your health conditions and receive
              personalized guidance.
            </motion.p>
            <motion.div
              className="mt-6"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              <div className="inline-flex items-center px-4 py-2 border border-blue-500/30 rounded-full backdrop-blur-md bg-blue-500/10">
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"
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
                <span className="text-sm font-medium">AI Models Actively Processing</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="h-[400px] max-w-3xl mx-auto mb-16 relative z-0 rounded-xl overflow-hidden shadow-xl shadow-blue-900/10"
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {mounted && <Scene />}
            <div className="absolute inset-0 pointer-events-none border border-blue-500/20 rounded-xl" />
          </motion.div>
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
            <Tabs defaultValue="diabetes" className="w-full" onValueChange={setActiveTab}>
              <motion.div
                className="flex justify-center mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 p-1 backdrop-blur-md bg-card/30 border border-blue-500/10 rounded-xl">
                  <AnimatedTabTrigger value="diabetes" activeTab={activeTab}>
                    Diabetes
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="cardiovascular" activeTab={activeTab}>
                    Cardiovascular
                  </AnimatedTabTrigger>
                  <AnimatedTabTrigger value="mental-health" activeTab={activeTab}>
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                  >
                    <TabsContent value="diabetes" className="mt-0">
                      <DiabetesAssessment session={session} supabase={supabaseClient} />
                    </TabsContent>

                    <TabsContent value="cardiovascular" className="mt-0">
                      <CardiovascularAssessment session={session} supabase={supabaseClient} />
                    </TabsContent>

                    <TabsContent value="mental-health" className="mt-0">
                      <MentalHealthAssessment />
                    </TabsContent>

                    <TabsContent value="skin-disease" className="mt-0">
                      <SkinDiseaseAssessment session={session} supabase={supabaseClient} />
                    </TabsContent>

                    <TabsContent value="allergy" className="mt-0">
                      <AllergyManagement supabase={supabaseClient} />
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

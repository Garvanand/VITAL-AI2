'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award, Users, TrendingUp, Brain, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustIndicatorProps {
  icon: React.ReactNode;
  text: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
}

const TrustIndicator = ({ icon, text }: TrustIndicatorProps) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const FeatureCard = ({ icon, title }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    whileHover={{
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    }}
    transition={{ duration: 0.5 }}
    className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
  >
    <div className="flex items-start gap-6">
      <motion.div
        className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm relative"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl bg-primary/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {icon}
      </motion.div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-foreground leading-tight">{title}</p>
        <div className="h-1 w-16 bg-primary/20 rounded-full" />
      </div>
    </div>
  </motion.div>
);

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="text-foreground">Transform Healthcare with</span>
              <br />
              <span className="text-primary">AI-Powered</span>
              <br />
              <span className="text-foreground">Diagnostics</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Empower your medical practice with cutting-edge AI technology that delivers 99% accurate diagnostics and
              early disease detection in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
            <TrustIndicator icon={<Shield className="h-5 w-5 text-primary" />} text="HIPAA Compliant" />
            <TrustIndicator icon={<Award className="h-5 w-5 text-primary" />} text="FDA Approved" />
            <TrustIndicator icon={<Users className="h-5 w-5 text-primary" />} text="50k+ Users" />
          </div>
        </motion.div>

        {/* Right Column - Feature Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative">
          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-primary/0 to-background blur-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 rounded-2xl blur-2xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <FeatureCard
              icon={<TrendingUp className="h-7 w-7 text-primary relative z-10" />}
              title="91% Accuracy in Disease Detection"
            />
          </div>
          <FeatureCard
            icon={<Brain className="h-7 w-7 text-primary relative z-10" />}
            title="24/7 AI Support with Real-time Analysis"
          />
          <FeatureCard
            icon={<Plus className="h-7 w-7 text-primary relative z-10" />}
            title="5M+ Diagnoses Processed Daily"
          />
        </motion.div>
      </div>
    </section>
  );
}

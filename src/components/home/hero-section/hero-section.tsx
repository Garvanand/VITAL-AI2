'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award, Users, TrendingUp, Brain, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TrustIndicatorProps {
  icon: React.ReactNode;
  text: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  index?: number;
  isClient: boolean;
}

const TrustIndicator = ({ icon, text }: TrustIndicatorProps) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const FeatureCard = ({ icon, title, index = 0, isClient }: FeatureCardProps) => {
  // Static version for server-side rendering and initial client render
  if (!isClient) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-start gap-6">
          <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm relative">{icon}</div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground leading-tight">{title}</p>
            <div className="h-1 w-16 bg-primary/20 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side animated version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -12,
        scale: 1.03,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: {
          duration: 0.2,
          ease: 'easeOut',
        },
      }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <motion.div
            className="h-1 w-16 bg-primary/20 rounded-full"
            whileHover={{ width: '100%', transition: { duration: 0.3 } }}
            initial={{ width: '4rem' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export function HeroSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        {isClient ? (
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
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href={'/workout'}>Daily Health Check</Link>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                <Link href={'/predictive-analysis'}>Predict Health Risk</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
              <TrustIndicator icon={<Shield className="h-5 w-5 text-primary" />} text="HIPAA Compliant" />
              <TrustIndicator icon={<Award className="h-5 w-5 text-primary" />} text="FDA Approved" />
              <TrustIndicator icon={<Users className="h-5 w-5 text-primary" />} text="50k+ Users" />
            </div>
          </motion.div>
        ) : (
          /* Static version for server-side rendering */
          <div className="flex flex-col gap-6">
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
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
              >
                Daily Health Check
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                Predict Health Risk
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
              <TrustIndicator icon={<Shield className="h-5 w-5 text-primary" />} text="HIPAA Compliant" />
              <TrustIndicator icon={<Award className="h-5 w-5 text-primary" />} text="FDA Approved" />
              <TrustIndicator icon={<Users className="h-5 w-5 text-primary" />} text="50k+ Users" />
            </div>
          </div>
        )}

        {/* Right Column - Feature Cards */}
        {isClient ? (
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
                index={0}
                isClient={isClient}
              />
            </div>
            <FeatureCard
              icon={<Brain className="h-7 w-7 text-primary relative z-10" />}
              title="24/7 AI Support with Real-time Analysis"
              index={1}
              isClient={isClient}
            />
            <FeatureCard
              icon={<Plus className="h-7 w-7 text-primary relative z-10" />}
              title="5+ Diagnoses Processed Daily"
              index={2}
              isClient={isClient}
            />
          </motion.div>
        ) : (
          /* Static version for server-side rendering */
          <div className="space-y-8 relative">
            <div className="relative">
              <FeatureCard
                icon={<TrendingUp className="h-7 w-7 text-primary relative z-10" />}
                title="91% Accuracy in Disease Detection"
                isClient={isClient}
              />
            </div>
            <FeatureCard
              icon={<Brain className="h-7 w-7 text-primary relative z-10" />}
              title="24/7 AI Support with Real-time Analysis"
              isClient={isClient}
            />
            <FeatureCard
              icon={<Plus className="h-7 w-7 text-primary relative z-10" />}
              title="5+ Diagnoses Processed Daily"
              isClient={isClient}
            />
          </div>
        )}
      </div>
    </section>
  );
}

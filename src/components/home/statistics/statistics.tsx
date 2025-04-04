'use client';

import { motion } from 'framer-motion';
import { ActivitySquare, Building2, FileCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  index?: number;
  isClient: boolean;
}

const StatItem = ({ icon, value, label, index = 0, isClient }: StatItemProps) => {
  // Base styling that applies to both static and animated versions
  const baseClasses =
    'flex flex-col items-center gap-2 p-8 rounded-xl border border-border bg-card/30 backdrop-blur-sm transition-all duration-300';

  // Content for both static and animated versions
  const content = (
    <>
      {isClient ? (
        <motion.div
          className="p-4 rounded-full bg-primary/10 text-primary relative overflow-hidden"
          whileHover={{
            scale: 1.05,
            rotate: 5,
            transition: { duration: 0.2 },
          }}
        >
          <motion.div
            className="absolute inset-0 bg-primary/5 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {icon}
        </motion.div>
      ) : (
        <div className="p-4 rounded-full bg-primary/10 text-primary relative overflow-hidden">{icon}</div>
      )}

      {isClient ? (
        <motion.h3
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {value}
        </motion.h3>
      ) : (
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
      )}

      <p className="text-muted-foreground text-center">{label}</p>

      {isClient ? (
        <motion.div
          className="h-1 w-16 bg-primary/20 rounded-full mt-2"
          initial={{ width: 0 }}
          animate={{ width: '4rem' }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ width: '80%', transition: { duration: 0.3 } }}
        />
      ) : (
        <div className="h-1 w-16 bg-primary/20 rounded-full mt-2"></div>
      )}
    </>
  );

  // Static version for server-side rendering
  if (!isClient) {
    return <div className={baseClasses}>{content}</div>;
  }

  // Client-side animated version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2 },
      }}
      className={`${baseClasses} hover:bg-card/50 hover:border-primary/20`}
    >
      {content}
    </motion.div>
  );
};

export function Statistics() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Content to be rendered
  const title = 'Transforming Healthcare with AI';
  const description =
    'Our AI-powered diagnostic platform is helping healthcare providers deliver better patient outcomes through accurate analysis and early detection.';
  const stats = [
    {
      icon: <ActivitySquare className="h-8 w-8" />,
      value: '91%',
      label: 'Accuracy Rate in Disease Detection',
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      value: '5+',
      label: 'Hospitals Using Our Platform',
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      value: '100+',
      label: 'Diagnoses Types Supported',
    },
  ];

  // Section title and description (used in both versions)
  const sectionHeading = (
    <div className={isClient ? '' : 'text-center mb-16'}>
      {isClient ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-semibold text-foreground mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{description}</p>
        </motion.div>
      ) : (
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{description}</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      {sectionHeading}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <StatItem key={i} icon={stat.icon} value={stat.value} label={stat.label} index={i} isClient={isClient} />
        ))}
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Star, User, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  index?: number;
  isClient: boolean;
}

const TestimonialCard = ({ quote, name, title, index = 0, isClient }: TestimonialCardProps) => {
  // Static or animated display based on whether client-side hydration is complete
  const baseCardClasses = 'p-8 rounded-xl border border-border bg-card/30 backdrop-blur-sm flex flex-col gap-4';
  const animatedCardClasses = `${baseCardClasses} hover:bg-card/50 hover:border-primary/20 transition-all duration-300 relative overflow-hidden`;

  // Always render the stars as an array, but conditionally wrap them in motion elements
  const stars = [...Array(5)].map((_, i) => {
    const star = <Star key={i} className="h-5 w-5 fill-primary text-primary" />;

    if (!isClient) return star;

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 * i, duration: 0.3 }}
        whileHover={{ scale: 1.2, rotate: 5, transition: { duration: 0.2 } }}
      >
        {star}
      </motion.div>
    );
  });

  // Static content rendering (used in both versions)
  const testimonialContent = (
    <>
      <div className="flex gap-1 mb-2">{stars}</div>
      <p className="text-muted-foreground text-lg italic z-10">"{quote}"</p>
      <div className="flex items-center gap-4 mt-4 z-10">
        {isClient ? (
          <motion.div
            className="h-12 w-12 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center"
            whileHover={{ scale: 1.1, borderColor: 'var(--primary)', transition: { duration: 0.2 } }}
          >
            <User className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        ) : (
          <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </>
  );

  // Static version for server-side rendering
  if (!isClient) {
    return <div className={baseCardClasses}>{testimonialContent}</div>;
  }

  // Client-side animated version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      viewport={{ once: true }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2 },
      }}
      className={animatedCardClasses}
    >
      {/* Background gradient accent */}
      <motion.div
        className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/5 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Quote icon */}
      <motion.div
        className="absolute top-4 right-4 text-primary/10"
        whileHover={{ scale: 1.2, rotate: 10, transition: { duration: 0.2 } }}
      >
        <Quote size={40} />
      </motion.div>

      {testimonialContent}
    </motion.div>
  );
};

export function Testimonials() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const testimonials = [
    {
      quote:
        "The AI's early detection capabilities have helped us identify several cancer cases in early stages, significantly improving patient outcomes.",
      name: 'Dr. Sarah Chen',
      title: 'Oncologist, Memorial Hospital',
    },
    {
      quote:
        "As a diagnostician, HealthHype's AI has become an invaluable second opinion. The 91% accuracy rate has been consistent with our experience.",
      name: 'Dr. Michael Rodriguez',
      title: 'Chief of Diagnostics, City Medical Center',
    },
    {
      quote:
        "The real-time analysis has revolutionized our emergency department's workflow, allowing us to prioritize critical cases more effectively.",
      name: 'Dr. Emily Johnson',
      title: 'Emergency Medicine, University Hospital',
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
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-semibold text-foreground mb-4">What Healthcare Professionals Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trusted by leading medical professionals who rely on our AI-powered diagnostics for accurate results and
            early detection.
          </p>
        </motion.div>
      ) : (
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-4">What Healthcare Professionals Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trusted by leading medical professionals who rely on our AI-powered diagnostics for accurate results and
            early detection.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-b from-background to-background/80">
      {sectionHeading}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            quote={testimonial.quote}
            name={testimonial.name}
            title={testimonial.title}
            index={index}
            isClient={isClient}
          />
        ))}
      </div>
    </section>
  );
}

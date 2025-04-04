'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

type SharedPageBackgroundProps = {
  intensity?: 'low' | 'medium' | 'high';
  primaryColor?: string;
  secondaryColor?: string;
  animated?: boolean;
};

export function SharedPageBackground({
  intensity = 'medium',
  primaryColor = 'primary',
  secondaryColor = 'secondary',
  animated = true,
}: SharedPageBackgroundProps) {
  // All hooks must be called unconditionally to maintain consistent order
  const [isMounted, setIsMounted] = useState(false);

  // Using useRef to store scroll values safely
  const scrollRef = useRef({
    scrollY: 0,
    lastScrollY: 0,
  });

  // Intensity multipliers
  const intensityMultipliers = {
    low: 0.7,
    medium: 1,
    high: 1.3,
  };

  const multiplier = intensityMultipliers[intensity];

  // State for animation values
  const [animationValues, setAnimationValues] = useState({
    primaryY: '0%',
    primaryOpacity: 0.8 * multiplier,
    primaryScale: 1,
    primaryRotate: 0,
    secondaryY: '0%',
    secondaryOpacity: 0.5 * multiplier,
    secondaryScale: 1,
    accent1X: '0%',
    accent1Scale: 1,
    accent1Opacity: 0.4 * multiplier,
    accent2X: '0%',
    accent2Scale: 1,
    accent2Opacity: 0.3 * multiplier,
  });

  // Update animation values based on scroll
  useEffect(() => {
    if (typeof window === 'undefined' || !animated) return;

    const handleScroll = () => {
      // Get scroll progress (0 to 1)
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

      // Update animation values
      setAnimationValues({
        primaryY: `${scrollProgress * 100}%`,
        primaryOpacity:
          (0.8 - scrollProgress * 0.4 + (scrollProgress >= 0.5 ? (scrollProgress - 0.5) * 0.8 : 0)) * multiplier,
        primaryScale: 1 + (scrollProgress <= 0.5 ? scrollProgress * 0.2 : (1 - scrollProgress) * 0.2),
        primaryRotate: scrollProgress * 15,
        secondaryY: `${-scrollProgress * 50}%`,
        secondaryOpacity:
          (0.5 + (scrollProgress <= 0.5 ? scrollProgress * 0.4 : (1 - scrollProgress) * 0.4)) * multiplier,
        secondaryScale: 1 + (scrollProgress <= 0.5 ? scrollProgress * 0.4 : (1 - scrollProgress) * 0.4),
        accent1X: `${scrollProgress * 20}%`,
        accent1Scale: 1 + (scrollProgress <= 0.5 ? scrollProgress * 0.8 : (1 - scrollProgress) * 0.8),
        accent1Opacity:
          (0.4 + (scrollProgress <= 0.5 ? scrollProgress * 0.6 : (1 - scrollProgress) * 0.6) - 0.3) * multiplier,
        accent2X: `${-scrollProgress * 30}%`,
        accent2Scale: 1 + (scrollProgress <= 0.5 ? scrollProgress * 0.4 : scrollProgress * 0.8),
        accent2Opacity:
          (0.3 + (scrollProgress <= 0.5 ? scrollProgress * 0.6 : scrollProgress * 0.2) - 0.1) * multiplier,
      });

      scrollRef.current = {
        scrollY: window.scrollY,
        lastScrollY: scrollRef.current.scrollY,
      };
    };

    // Set up scroll listener
    window.addEventListener('scroll', handleScroll);
    // Initialize
    handleScroll();
    setIsMounted(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [animated, multiplier]);

  // Common base elements that appear in both static and animated versions
  const baseGradient = <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />;

  // Create gradient styles using CSS variables
  const getPrimaryGradientStyle = () => ({
    background: `linear-gradient(to bottom right, rgba(var(--${primaryColor}-rgb), 0.1), rgba(var(--${secondaryColor}-rgb), 0.05), rgba(0, 0, 0, 0))`,
    opacity: 0.8 * multiplier,
  });

  const getSecondaryGradientStyle = () => ({
    background: `linear-gradient(to top right, rgba(0, 0, 0, 0), rgba(var(--${primaryColor}-rgb), 0.1), rgba(var(--${secondaryColor}-rgb), 0.05))`,
    opacity: 0.5 * multiplier,
  });

  const getPrimaryBlurStyle = () => ({
    background: `radial-gradient(circle, rgba(var(--${primaryColor}-rgb), 0.1) 0%, rgba(var(--${primaryColor}-rgb), 0) 70%)`,
    opacity: 0.4 * multiplier,
  });

  const getSecondaryBlurStyle = () => ({
    background: `radial-gradient(circle, rgba(var(--${secondaryColor}-rgb), 0.15) 0%, rgba(var(--${secondaryColor}-rgb), 0) 70%)`,
    opacity: 0.3 * multiplier,
  });

  // Static version for server-side rendering or initial client render
  if (!isMounted || !animated) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {baseGradient}
        <div className="absolute inset-0 animated-gradient" style={getPrimaryGradientStyle()} />
        <div className="absolute inset-0" style={getSecondaryGradientStyle()} />
        <div
          className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px]"
          style={getPrimaryBlurStyle()}
        />
        <div
          className="absolute top-[60%] -right-[10%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={getSecondaryBlurStyle()}
        />
      </div>
    );
  }

  // Client-side animated version
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {baseGradient}

      {/* Primary animated gradient */}
      <motion.div
        className="absolute inset-0 animated-gradient"
        style={getPrimaryGradientStyle()}
        animate={{
          y: animationValues.primaryY,
          opacity: animationValues.primaryOpacity,
          scale: animationValues.primaryScale,
          rotate: animationValues.primaryRotate,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 100,
        }}
      />

      {/* Secondary animated gradient */}
      <motion.div
        className="absolute inset-0 animated-gradient"
        style={getSecondaryGradientStyle()}
        animate={{
          y: animationValues.secondaryY,
          opacity: animationValues.secondaryOpacity,
          scale: animationValues.secondaryScale,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 90,
        }}
      />

      {/* Accent gradients */}
      <motion.div
        className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px]"
        style={getPrimaryBlurStyle()}
        animate={{
          x: animationValues.accent1X,
          scale: animationValues.accent1Scale,
          opacity: animationValues.accent1Opacity,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 80,
        }}
      />

      <motion.div
        className="absolute top-[60%] -right-[10%] w-[400px] h-[400px] rounded-full blur-[100px]"
        style={getSecondaryBlurStyle()}
        animate={{
          x: animationValues.accent2X,
          scale: animationValues.accent2Scale,
          opacity: animationValues.accent2Opacity,
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 70,
        }}
      />
    </div>
  );
}

'use client';

import { SharedPageBackground } from './shared-page-background';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HomePageBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <SharedPageBackground intensity="high" primaryColor="primary" secondaryColor="secondary" animated={true} />

      {/* Additional gradient elements specific to the home page */}
      {isMounted && (
        <>
          <motion.div
            className="fixed top-[10%] left-[5%] w-[300px] h-[300px] rounded-full"
            style={{ opacity: 0 }}
            animate={{
              backgroundImage: [
                'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--secondary-rgb), 0.15) 0%, rgba(var(--secondary-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0) 70%)',
              ],
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
              filter: ['blur(40px)', 'blur(80px)', 'blur(40px)'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="fixed bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full"
            style={{ opacity: 0 }}
            animate={{
              backgroundImage: [
                'radial-gradient(circle, rgba(var(--secondary-rgb), 0.15) 0%, rgba(var(--secondary-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--secondary-rgb), 0.15) 0%, rgba(var(--secondary-rgb), 0) 70%)',
              ],
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.1, 1],
              filter: ['blur(60px)', 'blur(100px)', 'blur(60px)'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />

          <motion.div
            className="fixed top-[40%] left-[50%] w-[600px] h-[600px] -translate-x-1/2 rounded-full"
            style={{ opacity: 0 }}
            animate={{
              backgroundImage: [
                'radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0) 70%)',
                'radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0) 70%)',
              ],
              opacity: [0.3, 0.5, 0.3],
              scale: [0.8, 1, 0.8],
              filter: ['blur(80px)', 'blur(120px)', 'blur(80px)'],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </>
      )}
    </>
  );
}

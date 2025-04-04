import { Tier } from '@/constants/pricing-tier';
import { CircleCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props {
  tier: Tier;
  isClient?: boolean;
}

export function FeaturesList({ tier, isClient = false }: Props) {
  // Common feature rendering for both static and animated versions
  const renderFeatures = tier.features.map((feature: string, index: number) => {
    if (!isClient) {
      return (
        <li key={feature} className="flex gap-x-3 items-center">
          <CircleCheck className={'h-6 w-6 text-muted-foreground'} />
          <span className={'text-base'}>{feature}</span>
        </li>
      );
    }

    return (
      <motion.li
        key={feature}
        className="flex gap-x-3 items-center"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 * index }}
        whileHover={{ x: 5, transition: { duration: 0.2 } }}
      >
        <motion.div
          whileHover={{
            scale: 1.2,
            rotate: 10,
            color: 'var(--primary)',
            transition: { duration: 0.2 },
          }}
        >
          <CircleCheck className={'h-6 w-6 text-muted-foreground'} />
        </motion.div>
        <span className={'text-base'}>{feature}</span>
      </motion.li>
    );
  });

  return <ul className={'p-8 flex flex-col gap-4'}>{renderFeatures}</ul>;
}

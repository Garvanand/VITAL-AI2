import { PricingTier } from '@/constants/pricing-tier';
import { IBillingFrequency } from '@/constants/billing-frequency';
import { FeaturesList } from '@/components/home/pricing/features-list';
import { PriceAmount } from '@/components/home/pricing/price-amount';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PriceTitle } from '@/components/home/pricing/price-title';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/gradients/featured-card-gradient';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Static version for server-side rendering
  if (!isClient) {
    return (
      <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {PricingTier.map((tier) => (
          <div key={tier.id} className={cn('rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden')}>
            <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border relative')}>
              {tier.featured && <FeaturedCardGradient />}
              <PriceTitle tier={tier} />
              <PriceAmount
                loading={loading}
                tier={tier}
                priceMap={priceMap}
                value={frequency.value}
                priceSuffix={frequency.priceSuffix}
              />
              <div className={'px-8'}>
                <Separator className={'bg-border'} />
              </div>
              <div className={'px-8 text-[16px] leading-[24px]'}>{tier.description}</div>
            </div>
            <div className={'px-8 mt-8'}>
              <Button
                className={'w-full bg-gradient-to-r from-primary to-primary/80'}
                variant={'secondary'}
                asChild={true}
              >
                <Link href={`/checkout/${tier.priceId[frequency.value]}`}>Get started</Link>
              </Button>
            </div>
            <FeaturesList tier={tier} isClient={isClient} />
          </div>
        ))}
      </div>
    );
  }

  // Client-side animated version
  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
      {PricingTier.map((tier, index) => (
        <motion.div
          key={tier.id}
          className={cn('rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
          viewport={{ once: true }}
          whileHover={{
            y: -10,
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
        >
          <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border relative')}>
            {tier.featured && (
              <>
                <FeaturedCardGradient />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </>
            )}
            <PriceTitle tier={tier} />
            <PriceAmount
              loading={loading}
              tier={tier}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}
            />
            <div className={'px-8'}>
              <Separator className={'bg-border'} />
            </div>
            <div className={'px-8 text-[16px] leading-[24px]'}>{tier.description}</div>
          </div>
          <div className={'px-8 mt-8'}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className={'w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-md'}
                variant={'secondary'}
                asChild={true}
              >
                <Link href={`/checkout/${tier.priceId[frequency.value]}`}>Get started</Link>
              </Button>
            </motion.div>
          </div>
          <FeaturesList tier={tier} isClient={isClient} />
        </motion.div>
      ))}
    </div>
  );
}

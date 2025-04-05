'use client';

import { useState } from 'react';

import '../../styles/home-page.css';
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/pricing/pricing';
import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { Footer } from '@/components/home/footer/footer';
import { Statistics } from '@/components/home/statistics/statistics';
import { Testimonials } from '@/components/home/testimonials/testimonials';

export function HomePage() {
  const [country, setCountry] = useState('US');

  return (
    <>
      <LocalizationBanner country={country} onCountryChange={setCountry} />
      <div>
        <HomeLoginStyleBackground />
        <HeroSection />
        <Statistics />
        <Testimonials />
        <Pricing country={country} />
        <Footer />
      </div>
    </>
  );
}

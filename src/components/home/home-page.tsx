'use client';

import { useState } from 'react';
import '../../styles/home-page.css';
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/pricing/pricing';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const [country, setCountry] = useState('US');

  return (
    <>
      <LocalizationBanner country={country} onCountryChange={setCountry} />
      <div>
        <HomePageBackground />
        <HeroSection />
        <Pricing country={country} />
        <Footer />
      </div>
    </>
  );
}

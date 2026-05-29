'use client';

import { LandingHero } from '@/components/LandingHero';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingCTA } from '@/components/LandingCTA';
import { LandingTestimonials } from '@/components/LandingTestimonials';
import { LandingFAQ } from '@/components/LandingFAQ';
import { LandingFooter } from '@/components/LandingFooter';
import PlansPage from './plans/page';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingCTA />
      <PlansPage />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}

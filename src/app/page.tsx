'use client';

import { LandingHero } from '@/components/LandingHero';
import { LandingHowItWorks } from '@/components/LandingHowItWorks';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingTestimonials } from '@/components/LandingTestimonials';
import { LandingSecurity } from '@/components/LandingSecurity';
import { LandingCTA } from '@/components/LandingCTA';
import { LandingFAQ } from '@/components/LandingFAQ';
import { LandingFooter } from '@/components/LandingFooter';
import PlansPage from './plans/page';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingSecurity />
      <LandingCTA />
      <PlansPage />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}

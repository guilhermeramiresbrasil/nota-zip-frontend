import { LandingHero } from '@/components/LandingHero';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingCTA } from '@/components/LandingCTA';
import PlansPage from './plans/page';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <LandingFeatures />
      <LandingCTA />
      <PlansPage />
    </div>
  );
}

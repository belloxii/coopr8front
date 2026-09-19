import React from "react";
import LandingNav from "./LandingNav";
import LandingHero from "./LandingHero";
import LandingFeatures from "./LandingFeatures";
import LandingAiSpotlight from "./LandingAiSpotlight";
import LandingPricing from "./LandingPricing";
import LandingSecurity from "./LandingSecurity";
import LandingFaq from "./LandingFaq";
import LandingCta from "./LandingCta";
import LandingFooter from "./LandingFooter";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingAiSpotlight />
      <LandingPricing />
      <LandingSecurity />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { ProofStrip } from "@/components/marketing/ProofStrip";
import { ServicesOverview } from "@/components/marketing/ServicesOverview";
import { BentoFeatures } from "@/components/marketing/BentoFeatures";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Pricing } from "@/components/marketing/Pricing";
import { Faq } from "@/components/marketing/Faq";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Footer } from "@/components/marketing/Footer";
import { faqJsonLd, softwareApplicationJsonLd } from "@/lib/schema";
import { createCollectionCrud } from "@/lib/collection-crud";
import { getSiteSettings } from "@/lib/site-settings-content";

// Same reasoning as app/blog/page.tsx: Firestore reads (bento features,
// FAQ, pricing, testimonials, site settings) aren't visible to Next's
// fetch-based cache heuristics, so without this the homepage renders once
// at build time and admin edits never reach it until the next deploy.
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

interface FaqDoc {
  question: string;
  answer: string;
}

interface PricingTierDoc {
  name: string;
  isContact: boolean;
  priceUSD: number;
  ctaHref: string;
}

export default async function Home() {
  const [faqItems, pricingTiers, siteSettings] = await Promise.all([
    createCollectionCrud<FaqDoc>("faqItems").list(),
    createCollectionCrud<PricingTierDoc>("pricingTiers").list(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <ProofStrip />
        <ServicesOverview />
        <BentoFeatures />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
      <Script
        id="software-application-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd(siteSettings.companyName, pricingTiers)
          ),
        }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />
    </>
  );
}

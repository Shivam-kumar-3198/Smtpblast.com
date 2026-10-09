import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { ProofStrip } from "@/components/marketing/ProofStrip";
import { ServicesOverview } from "@/components/marketing/ServicesOverview";
import { BentoFeatures } from "@/components/marketing/BentoFeatures";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Pricing, type PricingTierDoc as PricingSectionTier } from "@/components/marketing/Pricing";
import { Faq } from "@/components/marketing/Faq";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Footer } from "@/components/marketing/Footer";
import { faqJsonLd, jsonLdScript, softwareApplicationJsonLd } from "@/lib/schema";
import { getOrderedCollection, getSiteSettings } from "@/lib/public-data";

// Firestore reads (bento features, FAQ, pricing, testimonials, site
// settings) aren't visible to Next's fetch-based cache heuristics, so this
// is what makes the homepage re-render after build instead of freezing at
// deploy time. 300s matches the data cache window in lib/public-data.ts —
// a shorter page window would only re-read the same cached data.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

interface FaqDoc {
  question: string;
  answer: string;
}

export default async function Home() {
  const [faqItems, pricingTiers, siteSettings] = await Promise.all([
    getOrderedCollection<FaqDoc>("faqItems"),
    getOrderedCollection<PricingSectionTier>("pricingTiers"),
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
        <Pricing tiers={pricingTiers} />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
      <Script
        id="software-application-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            softwareApplicationJsonLd(siteSettings.companyName, pricingTiers)
          ),
        }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd(faqItems)) }}
      />
    </>
  );
}

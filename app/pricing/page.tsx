import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Reveal } from "@/components/marketing/Reveal";
import { SectionEyebrow } from "@/components/marketing/SectionEyebrow";
import { PricingTable } from "@/components/marketing/PricingTable";
import { listPricingTiers } from "@/lib/pricing-content";

// Same reasoning as app/blog/page.tsx: without this, listPricingTiers()
// only runs once at build time and an admin's price edit never reaches
// this page until the next deploy — even though the homepage's pricing
// section (a live Firestore subscription) already shows it instantly.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Dedicated SMTP and bulk email pricing that scales with your sending volume, shown in your own currency — from a 7-day trial to multi-IP cluster plans.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const tiers = await listPricingTiers();

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 bg-white">
        {/* ================= Hero ================= */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(15,23,42,0.09) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(55% 55% at 50% 0%, black, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(55% 55% at 50% 0%, black, transparent 75%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(247,148,29,0.12),transparent_70%)]"
          />

          <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-14 text-center sm:pt-20">
            <Reveal>
              <nav aria-label="Breadcrumb" className="text-small text-slate-400">
                <Link href="/" className="hover:text-ink-950">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-ink-950">Pricing</span>
              </nav>
            </Reveal>

            <Reveal delay={0.05} className="mt-6 flex flex-col items-center gap-5">
              <SectionEyebrow>Pricing</SectionEyebrow>
              <h1 className="max-w-2xl text-balance text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                Bulk email pricing that scales with your sending volume.
              </h1>
              <p className="max-w-xl text-balance text-body-lg leading-relaxed text-slate-600">
                Every tier lists a different sending rate, IP count, and support SLA — from a
                7-day trial to a multi-IP cluster. Prices shown in your own currency, wherever
                you&apos;re sending from.
              </p>

              <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Link
                  href="/get-started"
                  className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-slate-900 px-8 text-[0.95rem] font-medium text-white outline-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_16px_32px_-14px_rgba(15,23,42,0.5)] focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
                  />
                  <span className="relative">Get started</span>
                  <ArrowRight
                    aria-hidden
                    className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </Link>
                <Link
                  href="/talk-to-sales"
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-8 text-[0.95rem] font-medium text-ink-800 outline-none transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-accent-500/40"
                >
                  Talk to sales
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Pricing table ================= */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <PricingTable tiers={tiers} />
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

type CurrencyCode = "USD" | "INR" | "EUR";

const CURRENCIES: CurrencyCode[] = ["USD", "INR", "EUR"];
const currencySymbols: Record<CurrencyCode, string> = { USD: "$", INR: "₹", EUR: "€" };

interface PricingLimit {
  label: string;
  value: string;
}

interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingTierDoc {
  name: string;
  tagline: string;
  isContact: boolean;
  priceUSD: number;
  priceINR: number;
  priceEUR: number;
  priceUnit: string;
  highlighted: boolean;
  limits: PricingLimit[];
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
}

const priceByCurrency: Record<CurrencyCode, keyof PricingTierDoc> = {
  USD: "priceUSD",
  INR: "priceINR",
  EUR: "priceEUR",
};

export function Pricing() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [tiers, setTiers] = useState<(PricingTierDoc & { id: string })[] | null>(null);

  useEffect(() => {
    const unsubscribe = createCollectionCrud<PricingTierDoc>("pricingTiers").subscribe(
      (data) => setTiers(data),
      () => setTiers([])
    );
    return () => unsubscribe();
  }, []);

  if (tiers !== null && tiers.length === 0) return null;

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex flex-col items-start gap-4">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <div>
              <h2 className="max-w-xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                Bulk email pricing that scales with your sending volume.
              </h2>
              <p className="mt-2 text-body-lg text-slate-600">
                Every tier lists a different sending rate, IP count, and support SLA.
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Currency"
            className="flex shrink-0 rounded-full border border-slate-200 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            {CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={currency === code}
                onClick={() => setCurrency(code)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ease-out ${
                  currency === code
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(tiers ?? []).map((tier, i) => (
          <Reveal key={tier.id} delay={i * 0.05}>
            <div
              className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 ring-1 transition-shadow duration-300 ease-out ${
                tier.highlighted
                  ? "ring-2 ring-accent-500 shadow-[0_32px_64px_-28px_rgba(161,96,19,0.35)]"
                  : "ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]"
              }`}
            >
              {tier.highlighted && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500"
                />
              )}
              {tier.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent-50 px-2.5 py-1 text-small font-medium text-accent-600">
                  Most popular
                </span>
              )}

              <h3 className="text-h4 font-semibold text-ink-950">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{tier.tagline}</p>

              <div className="mt-5 font-numeric">
                {tier.isContact ? (
                  <div className="text-h3 font-semibold text-ink-950">Contact us</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-h3 font-semibold text-ink-950">
                      {currencySymbols[currency]}
                      {Number(tier[priceByCurrency[currency]]).toLocaleString("en-US")}
                    </span>
                    <span className="text-sm text-slate-400">{tier.priceUnit}</span>
                  </div>
                )}
              </div>

              {tier.limits.length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                  {tier.limits.map((limit) => (
                    <li key={limit.label} className="text-sm">
                      <span className="block text-small text-slate-400">{limit.label}</span>
                      <span className="font-medium text-ink-950">{limit.value}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tier.features.length > 0 && (
                <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" strokeWidth={2} />
                      ) : (
                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                      )}
                      <span className={feature.included ? "text-ink-950" : "text-slate-400"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={tier.ctaHref}
                className={`group relative mt-8 inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200 ease-out ${
                  tier.highlighted
                    ? "bg-accent-600 text-white hover:bg-accent-700"
                    : "border border-slate-200 text-ink-800 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tier.ctaLabel}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

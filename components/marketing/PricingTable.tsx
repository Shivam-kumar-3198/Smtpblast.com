"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Globe } from "lucide-react";
import { CURRENCIES, EXACT_CURRENCIES, priceInCurrency, type PricingTier } from "@/lib/pricing-content";
import { Reveal } from "./Reveal";

export function PricingTable({ tiers }: { tiers: PricingTier[] }) {
  const [currencyCode, setCurrencyCode] = useState("USD");

  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0],
    [currencyCode]
  );
  const isExactCurrency = (EXACT_CURRENCIES as readonly string[]).includes(currencyCode);

  return (
    <div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing prices in <span className="font-medium text-ink-950">{currency.label}</span>.
        </p>

        <label className="flex items-center gap-2">
          <span className="sr-only">Choose a currency</span>
          <Globe aria-hidden className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
          <select
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className="rounded-full border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-sm font-medium text-ink-950 outline-none transition-colors duration-200 ease-out hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-accent-500/40"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!isExactCurrency && (
        <p className="mt-3 text-small leading-relaxed text-slate-400">
          Prices in {currency.label} are approximate, converted from our USD pricing at an
          indicative exchange rate. Billing is always processed in USD, INR, or EUR.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier, i) => {
          const { amount, isExact } = priceInCurrency(tier, currencyCode);
          return (
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
                        {currency.symbol}
                        {amount.toLocaleString("en-US")}
                      </span>
                      <span className="text-sm text-slate-400">{tier.priceUnit}</span>
                      {!isExact && (
                        <span className="ml-1 text-small text-slate-400">est.</span>
                      )}
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
          );
        })}
      </div>
    </div>
  );
}

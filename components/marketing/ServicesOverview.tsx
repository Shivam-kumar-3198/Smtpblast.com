import Link from "next/link";
import { ArrowRight, MessageSquareText, Sparkles, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { listServices } from "@/lib/services-content";
import { getSolutionsSettingsDoc } from "@/lib/solutions-content";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

/**
 * ServicesOverview — signature card design
 *
 * Three layered ideas, fused into one card (this combination is the
 * signature — each layer alone exists in the wild, together they don't):
 *
 *  1. GRADIENT-BORDER REVEAL (the "lit edge")
 *     Each card is wrapped in a 1px frame. At rest the frame is a plain
 *     hairline; on hover it becomes a diagonal accent gradient, so the
 *     card looks lit from within its own edge. Pure CSS, no JS.
 *
 *  2. GHOST WATERMARK (the "echo")
 *     The service's own icon is repeated as a huge, faint outline in the
 *     bottom-right corner, clipped by the card. On hover it tints toward
 *     accent and tilts 6° — the card feels alive without any gimmick.
 *
 *  3. BEAM SWEEP (the "signal")
 *     A thin light beam crosses the top edge of the card on hover —
 *     a quiet nod to a message travelling to the inbox.
 *
 * Plus a permanent final card — "Need something tailored?" — in a dashed
 * frame. It balances the grid at any service count AND catches the
 * visitor whose problem doesn't match a listed service, which is exactly
 * the lead most sites lose.
 *
 * Responsive: 1 col → 2 (sm) → 3 (lg). Equal heights everywhere.
 */

const FALLBACK_ICON: LucideIcon = Sparkles;

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? FALLBACK_ICON;
}

export async function ServicesOverview() {
  const [services, settings] = await Promise.all([listServices(), getSolutionsSettingsDoc()]);
  if (services.length === 0) return null;

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>{settings.overviewEyebrow}</SectionEyebrow>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            {settings.overviewHeading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {services.map((service, i) => {
            const Icon = resolveIcon(service.icon);
            return (
              <Reveal key={service.slug} delay={i * 0.05} className="h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative block h-full rounded-2xl bg-slate-900/8 p-px transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {/* 1 — Lit edge: gradient frame revealed on hover */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-600/70 via-slate-200 to-accent-600/40 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                  />

                  {/* Card body */}
                  <span className="relative flex h-full flex-col overflow-hidden rounded-[15px] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out group-hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] sm:p-7">
                    {/* 3 — Beam sweep along the top edge */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent-600/70 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                    />

                    {/* 2 — Ghost watermark: the icon echoed large and faint */}
                    <Icon
                      aria-hidden
                      strokeWidth={0.75}
                      className="pointer-events-none absolute -bottom-7 -right-7 h-32 w-32 text-slate-900/[0.04] transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-105 group-hover:text-accent-600/[0.09] motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
                    />

                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white shadow-[0_8px_16px_-8px] shadow-accent-600/50 transition-transform duration-300 ease-out group-hover:scale-105">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>

                    <span className="mt-4 block text-h4 font-semibold text-ink-950">
                      {service.name}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                      {service.summary}
                    </span>

                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent-600">
                      {settings.overviewCardCtaLabel}
                      <ArrowRight
                        aria-hidden
                        className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}

          {/* Balancing card — same shell as every service card, so it reads
              as part of the family. Only the icon chip differs (outlined at
              rest, fills with accent on hover) to hint it's an invitation. */}
          <Reveal delay={services.length * 0.05} className="h-full">
            <Link
              href={settings.overviewCalloutCtaHref}
              className="group relative block h-full rounded-2xl bg-slate-900/8 p-px transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {/* Lit edge — identical to the service cards */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-600/70 via-slate-200 to-accent-600/40 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
              />

              <span className="relative flex h-full flex-col overflow-hidden rounded-[15px] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out group-hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] sm:p-7">
                {/* Beam sweep — identical to the service cards */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent-600/70 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />

                {/* Ghost watermark — identical treatment */}
                <MessageSquareText
                  aria-hidden
                  strokeWidth={0.75}
                  className="pointer-events-none absolute -bottom-7 -right-7 h-32 w-32 text-slate-900/[0.04] transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-105 group-hover:text-accent-600/[0.09] motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
                />

                {/* The one differentiator: outlined chip that fills on hover */}
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-accent-600 ring-1 ring-accent-600/40 transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-accent-600 group-hover:text-white group-hover:shadow-[0_8px_16px_-8px] group-hover:shadow-accent-600/50">
                  <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />
                </span>

                <span className="mt-4 block text-h4 font-semibold text-ink-950">
                  {settings.overviewCalloutHeading}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                  {settings.overviewCalloutBody}
                </span>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent-600">
                  {settings.overviewCalloutCtaLabel}
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
                    strokeWidth={1.75}
                  />
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
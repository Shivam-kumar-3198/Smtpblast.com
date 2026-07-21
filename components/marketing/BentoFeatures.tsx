import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

/**
 * BentoFeatures — a true bento, not a uniform grid
 *
 * What changed and why:
 *
 *  LAYOUT — Real bento rhythm. Cells alternate wide ↔ small in a zigzag
 *  (4+2 / 2+4 on a 6-column grid), so the eye travels instead of scanning
 *  three identical columns. Works with any feature count; always fills rows.
 *
 *  VISUALS — Every card gets art. If a feature document provides an
 *  `image`, it renders via next/image. Otherwise the card receives one of
 *  four generated SVG motifs, cycled by position, all drawn from the
 *  product's world: inbox-placement bars, signal rings, an envelope
 *  flight path, and a delivery dot-grid. No stock photos, no empty cards.
 *
 *  METRICS — On wide cards the metric becomes a display-size stat
 *  (the number is the proof — let it be seen). Small cards keep it as a
 *  quiet accent line.
 *
 *  SHELL — Same lit-edge + beam-sweep + lift treatment as the services
 *  grid, so the whole site reads as one designed system.
 *
 * Responsive: everything stacks to 1 column on mobile; wide-card visuals
 * move below the copy instead of beside it. Focus-visible mirrors hover;
 * motion-reduce disables lift and sweeps.
 */

interface FeatureDoc {
  icon: string;
  title: string;
  description: string;
  metric: string;
  href: string;
  /** Optional illustration/screenshot. When absent, a generated motif is used. */
  image?: string;
}

const FALLBACK_ICON: LucideIcon = Icons.Sparkles;

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? FALLBACK_ICON;
}

/* ————— Generated motifs (pure SVG, themed to email deliverability) ————— */

function MotifInboxBars() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
      {[
        { x: 12, h: 34 }, { x: 40, h: 48 }, { x: 68, h: 58 },
        { x: 96, h: 72 }, { x: 124, h: 88 },
      ].map((b, i, arr) => (
        <rect
          key={b.x}
          x={b.x}
          y={96 - b.h}
          width={18}
          rx={4}
          height={b.h}
          className={
            i === arr.length - 1
              ? "fill-accent-600 transition-opacity duration-300"
              : "fill-slate-200 transition-colors duration-300 group-hover:fill-slate-300"
          }
        />
      ))}
      <circle cx={133} cy={96 - 88 - 6} r={3} className="fill-accent-600/40" />
    </svg>
  );
}

function MotifSignalRings() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
      {[46, 34, 22].map((r, i) => (
        <circle
          key={r}
          cx={80}
          cy={50}
          r={r}
          fill="none"
          strokeWidth={1.25}
          className={`stroke-slate-200 transition-colors duration-500 ${
            i === 2 ? "group-hover:stroke-accent-600/60" : "group-hover:stroke-slate-300"
          }`}
        />
      ))}
      <circle cx={80} cy={50} r={6} className="fill-accent-600" />
      <circle
        cx={80}
        cy={50}
        r={11}
        fill="none"
        strokeWidth={1}
        className="stroke-accent-600/30"
      />
    </svg>
  );
}

function MotifFlightPath() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
      <path
        d="M12 78 C 50 78, 60 26, 104 26 S 148 50, 148 50"
        fill="none"
        strokeWidth={1.25}
        strokeDasharray="4 4"
        className="stroke-slate-300 transition-colors duration-500 group-hover:stroke-accent-600/50"
      />
      <circle cx={12} cy={78} r={4} className="fill-slate-300" />
      {/* envelope at the destination */}
      <g className="transition-transform duration-500 ease-out group-hover:translate-x-1">
        <rect x={136} y={41} width={22} height={16} rx={3} className="fill-accent-600" />
        <path
          d="M138 44 L147 51 L156 44"
          fill="none"
          strokeWidth={1.25}
          className="stroke-white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function MotifDotGrid() {
  const dots: { cx: number; cy: number; lit: boolean }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      dots.push({ cx: 20 + c * 20, cy: 20 + r * 20, lit: (r === 1 && c >= 2) || (r === 2 && c === 5) });
    }
  }
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.lit ? 3.5 : 2.5}
          className={
            d.lit
              ? "fill-accent-600/70 transition-opacity duration-300 group-hover:fill-accent-600"
              : "fill-slate-200"
          }
        />
      ))}
    </svg>
  );
}

const MOTIFS = [MotifInboxBars, MotifSignalRings, MotifFlightPath, MotifDotGrid];

/* Bento rhythm on a 6-col grid: 4+2 / 2+4 zigzag, repeats cleanly. */
function spanClass(i: number): { span: string; wide: boolean } {
  const wide = i % 4 === 0 || i % 4 === 3;
  return { span: wide ? "md:col-span-4" : "md:col-span-2", wide };
}

export async function BentoFeatures() {
  const bentoFeatures = await createCollectionCrud<FeatureDoc>("bentoFeatures").list();
  if (bentoFeatures.length === 0) return null;

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <Reveal className="flex flex-col items-start gap-4">
        <SectionEyebrow>What&apos;s included</SectionEyebrow>
        <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
          Built for teams sending real volume.
        </h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6 sm:gap-5">
        {bentoFeatures.map((feature, i) => {
          const Icon = resolveIcon(feature.icon);
          const Motif = MOTIFS[i % MOTIFS.length];
          const { span, wide } = spanClass(i);

          const visual = feature.image ? (
            <div className="relative h-full w-full overflow-hidden rounded-xl ring-1 ring-slate-900/[0.06]">
              <Image
                src={feature.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              />
            </div>
          ) : (
            <Motif />
          );

          const content = (
            <div className="group relative block h-full rounded-2xl bg-slate-900/8 p-px transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              {/* Lit edge — shared with the services grid */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-600/70 via-slate-200 to-accent-600/40 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
              />

              <div
                className={`relative flex h-full overflow-hidden rounded-[15px] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out group-hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] ${
                  wide ? "flex-col md:flex-row md:items-stretch" : "flex-col"
                }`}
              >
                {/* Beam sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent-600/70 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />

                {/* Copy */}
                <div className={`flex flex-col p-6 sm:p-7 ${wide ? "md:w-3/5" : ""}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white shadow-[0_8px_16px_-8px] shadow-accent-600/50 transition-transform duration-300 ease-out group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>

                  <h3 className="mt-4 text-h4 font-semibold text-ink-950">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>

                  {feature.metric &&
                    (wide ? (
                      /* Wide card: the metric is the proof — display size */
                      <span className="mt-auto pt-6 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                        {feature.metric}
                      </span>
                    ) : (
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-small font-medium text-accent-600">
                        <span aria-hidden className="h-px w-4 bg-accent-600/40" />
                        {feature.metric}
                      </span>
                    ))}
                </div>

                {/* Visual */}
                <div
                  className={
                    wide
                      ? "relative flex items-center justify-center bg-surface-50/70 p-6 md:w-2/5 md:p-8"
                      : "relative mt-auto h-24 px-6 pb-5 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  }
                >
                  {wide ? (
                    <div className="relative h-32 w-full md:h-full md:min-h-[10rem]">
                      {visual}
                    </div>
                  ) : (
                    visual
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <Reveal key={feature.id} delay={i * 0.05} className={`col-span-1 h-full ${span}`}>
              {feature.href ? (
                <Link
                  href={feature.href}
                  className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
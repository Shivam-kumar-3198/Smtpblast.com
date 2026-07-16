import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings-content";

const PipelineDashboard = dynamic(() =>
  import("./PipelineDashboard").then((mod) => mod.PipelineDashboard)
);

/* ------------------------------------------------------------------ */
/*  SMTPblast — "The Quiet Stage" hero                                 */
/*                                                                     */
/*  Soothing comes from symmetry and stillness, so this hero is        */
/*  center-staged like a keynote: a calm column of type descending     */
/*  onto the product, which rests on a lit stage below.                */
/*                                                                     */
/*  Signature details:                                                 */
/*  1. One serif italic word — "inbox" — set against the sans          */
/*     headline. A single typographic gesture instead of gradients.    */
/*  2. An ISP marquee: a slow, edge-faded stream of the inboxes you    */
/*     actually deliver to (Gmail, Outlook, iCloud…). Real proof,      */
/*     gently in motion.                                               */
/*  3. The stage itself: the dashboard begins softly tilted back in    */
/*     3D and straightens to face the visitor as they scroll —         */
/*     pure CSS scroll-driven animation, flat-rendering fallback       */
/*     everywhere it isn't supported.                                  */
/*                                                                     */
/*  Two faint vertical hairlines frame the column like the margins     */
/*  of a well-set page. Everything runs on transform/opacity.          */
/* ------------------------------------------------------------------ */

const INBOXES = [
  "Gmail",
  "Outlook",
  "Yahoo Mail",
  "iCloud Mail",
  "Proton Mail",
  "Zoho Mail",
  "Fastmail",
  "AOL Mail",
  "GMX",
  "Comcast",
];

export async function Hero() {
  const siteSettings = await getSiteSettings();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto w-full max-w-[80rem] px-5 sm:px-8 lg:px-12">
        {/* ---------- page margins: two faint vertical hairlines ---------- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-5 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:left-8 lg:left-12 lg:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-5 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:right-8 lg:right-12 lg:block"
        />

        <div className="flex flex-col items-center pb-24 pt-16 text-center sm:pt-24">
          {/* ================= the column of type ================= */}

          {/* status eyebrow */}
          <div
            className="animate-settle inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/80 py-1.5 pl-3.5 pr-4 text-[0.8rem] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="hero-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All systems operational
            <span aria-hidden className="h-3 w-px bg-slate-200" />
            <span className="text-slate-400">Live in 24 hours</span>
          </div>

          {/* headline — one serif italic gesture, nothing else */}
          <h1
            className="animate-settle mt-8 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.035em] text-ink-950 sm:text-6xl lg:text-[4.25rem]"
            style={{ animationDelay: "80ms" }}
          >
            High-deliverability SMTP servers that reach the{" "}
            <em className="relative whitespace-nowrap font-serif font-medium italic tracking-[-0.01em] text-accent-600">
              inbox
              <svg
                aria-hidden
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-2 w-full sm:-bottom-3"
              >
                <path
                  d="M3 7 C 60 2.5, 140 2, 197 5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  pathLength="1"
                  className="hero-underline"
                />
              </svg>
            </em>
          </h1>

          {/* sub-copy */}
          <p
            className="animate-settle mt-7 max-w-xl text-balance text-body-lg leading-relaxed text-slate-600"
            style={{ animationDelay: "160ms" }}
          >
            Dedicated IPs, managed warm-up, and real-time analytics — so every
            send lands where it should, from day one.
          </p>

          {/* CTAs */}
          <div
            className="animate-settle mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="#pricing"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-slate-900 px-8 text-[0.95rem] font-medium text-white outline-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_16px_32px_-14px_rgba(15,23,42,0.5)] focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
              />
              <span className="relative">View pricing</span>
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
              Talk to a deliverability engineer
            </Link>
          </div>

          {/* ================= ISP marquee ================= */}
          <div
            className="animate-settle mt-14 w-full max-w-3xl"
            style={{ animationDelay: "320ms" }}
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Optimized for every major inbox
            </p>
            <div className="hero-marquee mt-5 overflow-hidden">
              <div className="hero-marquee-track flex w-max items-center gap-3">
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex items-center gap-3"
                  >
                    {INBOXES.map((name) => (
                      <li
                        key={name}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[0.82rem] font-medium text-slate-500"
                      >
                        <span
                          aria-hidden
                          className="h-1 w-1 rounded-full bg-emerald-400"
                        />
                        {name}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>

          {/* ================= the stage ================= */}
          <div className="mt-16 w-full sm:mt-20 lg:mt-24">
            <div className="hero-stage mx-auto w-full max-w-5xl">
              <div
                className="hero-stage-inner animate-settle relative"
                style={{ animationDelay: "380ms" }}
              >
                {/* product window */}
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_48px_100px_-40px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.05)]">
                  {/* window chrome */}
                  <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-3">
                    <span aria-hidden className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    </span>
                    <span className="mx-auto flex items-center gap-2 rounded-md bg-slate-50 px-8 py-1 font-mono text-[0.72rem] text-slate-400">
                      app.smtpblast.io/analytics
                    </span>
                    <span aria-hidden className="w-[3.25rem]" />
                  </div>

                  <PipelineDashboard />
                </div>
              </div>
            </div>
          </div>

          {siteSettings.trustStat && (
            <p
              className="animate-settle mt-16 text-small text-slate-500"
              style={{ animationDelay: "440ms" }}
            >
              {siteSettings.trustStat.value}
            </p>
          )}
        </div>
      </div>

      {/* ---------------- component styles ---------------- */}
      <style>{`
        /* Heartbeat — slow, so it reads as calm uptime, not an alert. */
        .hero-ping {
          opacity: 0.75;
          animation: hero-ping 2.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes hero-ping {
          0%        { transform: scale(1);   opacity: 0.6; }
          70%, 100% { transform: scale(2.6); opacity: 0; }
        }

        /* The serif word underlines itself after the headline settles. */
        .hero-underline {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hero-underline-draw 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.6s forwards;
        }
        @keyframes hero-underline-draw {
          to { stroke-dashoffset: 0; }
        }

        /* ISP marquee — unhurried (46s per loop), edges faded so pills
           dissolve in and out of the page rather than hitting a wall.
           Pauses on hover so names can be read. */
        .hero-marquee {
          mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
        }
        .hero-marquee-track {
          animation: hero-marquee 46s linear infinite;
          will-change: transform;
        }
        .hero-marquee:hover .hero-marquee-track {
          animation-play-state: paused;
        }
        @keyframes hero-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-50% - 0.375rem), 0, 0); }
        }

        /* The stage — scroll-driven straightening. The window starts
           tilted back and rises to face the visitor as it scrolls into
           view. Progressive enhancement: browsers without scroll-driven
           animations simply render it flat. */
        .hero-stage {
          perspective: 1400px;
        }
        @supports (animation-timeline: view()) {
          .hero-stage-inner {
            transform: rotateX(16deg) scale(0.96);
            transform-origin: 50% 0%;
            animation: hero-flatten linear both;
            animation-timeline: view();
            animation-range: entry 0% cover 42%;
          }
          @keyframes hero-flatten {
            to { transform: rotateX(0deg) scale(1); }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-ping { animation: none; opacity: 0; }
          .hero-underline { animation: none; stroke-dashoffset: 0; }
          .hero-marquee-track { animation: none; }
          .hero-stage-inner { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
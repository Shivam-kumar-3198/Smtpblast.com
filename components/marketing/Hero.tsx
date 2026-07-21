import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Mail } from "lucide-react";
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

/**
 * Official brand marks (path data + brand color) for the providers that
 * have a properly licensed logo available. The rest fall back to a
 * neutral mail icon in InboxPill below — no unlicensed/imitation logos.
 */
const INBOX_LOGOS: Record<string, { viewBox: string; color: string; path: string }> = {
  Gmail: {
    viewBox: "0 0 24 24",
    color: "#EA4335",
    path: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
  },
  "Yahoo Mail": {
    viewBox: "0 0 512 512",
    color: "#6001D2",
    path: "M223.69,141.06,167,284.23,111,141.06H14.93L120.76,390.19,82.19,480h94.17L317.27,141.06Zm105.4,135.79a58.22,58.22,0,1,0,58.22,58.22A58.22,58.22,0,0,0,329.09,276.85ZM394.65,32l-93,223.47H406.44L499.07,32Z",
  },
  "iCloud Mail": {
    viewBox: "0 0 24 24",
    color: "#3693F3",
    path: "M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z",
  },
  "Proton Mail": {
    viewBox: "0 0 24 24",
    color: "#6D4AFF",
    path: "m15.24 8.998 3.656-3.073v15.81H2.482C1.11 21.735 0 20.609 0 19.223V6.944l7.58 6.38a2.186 2.186 0 0 0 2.871-.042l4.792-4.284h-.003zm-5.456 3.538 1.809-1.616a2.438 2.438 0 0 1-1.178-.533L.905 2.395A.552.552 0 0 0 0 2.826v2.811l8.226 6.923a1.186 1.186 0 0 0 1.558-.024zM23.871 2.463a.551.551 0 0 0-.776-.068l-3.199 2.688v16.653h1.623c1.371 0 2.481-1.127 2.481-2.513V2.824a.551.551 0 0 0-.129-.36z",
  },
  "Zoho Mail": {
    viewBox: "0 0 24 24",
    color: "#E42527",
    path: "M8.66 6.897a1.299 1.299 0 0 0-1.205.765l-.642 1.44-.062-.385A1.291 1.291 0 0 0 5.27 7.648l-4.185.678A1.291 1.291 0 0 0 .016 9.807l.678 4.18a1.293 1.293 0 0 0 1.27 1.087c.074 0 .143-.01.216-.017l4.18-.678c.436-.07.784-.351.96-.723l2.933 1.307a1.304 1.304 0 0 0 .988.026c.321-.12.575-.365.716-.678l.28-.629.038.276a1.297 1.297 0 0 0 1.455 1.103l3.712-.501a1.29 1.29 0 0 0 1.03.514h4.236c.713 0 1.29-.58 1.291-1.291V9.545c0-.712-.58-1.291-1.291-1.291h-4.236c-.079 0-.155.008-.23.022a1.309 1.309 0 0 0-.275-.288c-.275-.21-.614-.3-.958-.253l-4.197.571c-.155.021-.3.07-.432.14L9.159 7.01a1.27 1.27 0 0 0-.499-.113zm-.025.705c.077 0 .159.013.24.052l2.971 1.324c-.128.238-.18.508-.142.782l.357 2.596h.002l-.745 1.672a.59.59 0 0 1-.777.296l-3.107-1.385-.004-.041-.41-2.526L8.1 7.95a.589.589 0 0 1 .536-.348zm-3.159.733c.125 0 .245.039.343.112.13.09.21.227.237.382l.234 1.446-.56 1.259a1.27 1.27 0 0 0-.026.987c.12.322.364.575.678.717l.295.131a.585.585 0 0 1-.428.314l-4.185.678a.59.59 0 0 1-.674-.485l-.678-4.18a.588.588 0 0 1 .485-.674l4.185-.678c.03-.004.064-.01.094-.01zm11.705.09a.59.59 0 0 1 .415.173 1.287 1.287 0 0 0-.416.947v4.237c0 .033.003.065.005.097l-3.55.482a.586.586 0 0 1-.66-.502l-.191-1.403.899-2.017a1.29 1.29 0 0 0-.333-1.5l3.754-.51c.026-.004.051-.004.077-.004zm1.3.532h4.227c.326 0 .588.266.588.588v4.237a.589.589 0 0 1-.588.588h-4.237a.564.564 0 0 1-.12-.013c.47-.246.758-.765.684-1.318zm-5.988.309.254.113c.296.133.43.48.296.777l-.432.97-.207-1.465a.58.58 0 0 1 .09-.395zm5.39.538.453 3.325a.583.583 0 0 1-.453.65zM6.496 11.545l.17 1.052a.588.588 0 0 1-.293-.776zm3.985 4.344a.588.588 0 0 0-.612.603c0 .358.244.61.601.61a.582.582 0 0 0 .607-.608c0-.35-.242-.605-.596-.605zm5.545 0a.588.588 0 0 0-.612.603c0 .358.245.61.602.61a.582.582 0 0 0 .606-.608c0-.35-.24-.605-.596-.605zm-8.537.018a.047.047 0 0 0-.048.047v.085c0 .026.021.047.048.047h.52l-.623.9a.052.052 0 0 0-.009.027v.027c0 .026.021.047.048.047h.815a.047.047 0 0 0 .047-.047v-.085a.047.047 0 0 0-.047-.047h-.55l.606-.9a.05.05 0 0 0 .008-.026v-.028a.047.047 0 0 0-.047-.047zm5.303 0a.047.047 0 0 0-.047.047v1.086c0 .026.02.047.047.047h.135a.047.047 0 0 0 .047-.047v-.454h.545v.454c0 .026.02.047.047.047h.134a.047.047 0 0 0 .047-.047v-1.086a.047.047 0 0 0-.047-.047h-.134a.047.047 0 0 0-.047.047v.453h-.545v-.453a.047.047 0 0 0-.047-.047zm-2.324.164c.25 0 .372.194.372.425 0 .219-.109.425-.358.426-.242 0-.375-.197-.375-.419 0-.235.108-.432.36-.432zm5.545 0c.25 0 .372.194.372.425 0 .219-.108.425-.358.426-.242 0-.374-.197-.374-.419 0-.235.108-.432.36-.432z",
  },
  GMX: {
    viewBox: "0 0 24 24",
    color: "#1C449B",
    path: "M3.904 11.571v1.501H5.46c-.075.845-.712 1.274-1.539 1.274-1.255 0-1.934-1.157-1.934-2.3 0-1.118.65-2.317 1.906-2.317.77 0 1.321.468 1.586 1.166l1.812-.76C6.66 8.765 5.489 8.086 3.979 8.086 1.614 8.087 0 9.654 0 12.037c0 2.309 1.604 3.876 3.913 3.876 1.227 0 2.308-.439 3.025-1.44.651-.916.731-1.831.75-2.904zM13.65 8.3l-1.586 3.95-1.5-3.95H8.67l-1.255 7.392h1.91l.619-4.257h.019l1.695 4.257h.765l1.775-4.257h.024l.538 4.257h1.92L15.562 8.3zm7.708 3.473 2.086-3.475h-2.128l-1.11 1.767L19.012 8.3H16.68l2.459 3.47-2.46 3.922h2.333l1.33-2.223 1.576 2.223H24l-2.642-3.92",
  },
};

/** A brand mark where we have one, licensed to display as a "works with"
 * indicator; a neutral mail glyph everywhere else. Never an imitation
 * logo standing in for a real one. */
function InboxPill({ name }: { name: string }) {
  const logo = INBOX_LOGOS[name];
  return (
    <li className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[0.82rem] font-medium text-slate-500">
      {logo ? (
        <svg aria-hidden viewBox={logo.viewBox} className="h-3.5 w-3.5 shrink-0">
          <path fill={logo.color} d={logo.path} />
        </svg>
      ) : (
        <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.75} />
      )}
      {name}
    </li>
  );
}

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
            <p className="sr-only">{INBOXES.join(", ")}</p>

            {/* Two rows drifting in opposite directions, offset a half-pill
                against each other, so the logos cross paths as they pass —
                rather than one row simply repeating itself. */}
            <div aria-hidden className="mt-5 flex flex-col gap-3">
              <div className="hero-marquee overflow-hidden">
                <div className="hero-marquee-track hero-marquee-track--forward flex w-max items-center gap-3">
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="flex items-center gap-3">
                      {INBOXES.map((name) => (
                        <InboxPill key={name} name={name} />
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
              <div className="hero-marquee overflow-hidden">
                <div className="hero-marquee-track hero-marquee-track--reverse flex w-max items-center gap-3 pl-16">
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="flex items-center gap-3">
                      {[...INBOXES].reverse().map((name) => (
                        <InboxPill key={`rev-${name}`} name={name} />
                      ))}
                    </ul>
                  ))}
                </div>
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

        /* ISP marquee — two rows drifting in opposite directions at
           slightly different speeds (46s / 54s) so they fall in and out
           of phase rather than mirroring each other, giving the pills a
           criss-crossing rhythm as they pass. Edges faded so pills
           dissolve in and out of the page rather than hitting a wall.
           Pauses on hover so names can be read. */
        .hero-marquee {
          mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
        }
        .hero-marquee-track {
          will-change: transform;
        }
        .hero-marquee-track--forward {
          animation: hero-marquee-forward 46s linear infinite;
        }
        .hero-marquee-track--reverse {
          animation: hero-marquee-reverse 54s linear infinite;
        }
        .hero-marquee:hover .hero-marquee-track {
          animation-play-state: paused;
        }
        @keyframes hero-marquee-forward {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-50% - 0.375rem), 0, 0); }
        }
        @keyframes hero-marquee-reverse {
          from { transform: translate3d(calc(-50% - 0.375rem), 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
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
          .hero-marquee-track--forward,
          .hero-marquee-track--reverse { animation: none; }
          .hero-stage-inner { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
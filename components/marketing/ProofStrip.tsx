import { ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { proofFootnote, proofRows } from "@/content/proof-strip";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

/**
 * ProofStrip — "Shared vs. dedicated" (customer-centric redesign)
 *
 * Designed around the visitor's actual questions, in the order they ask them:
 *
 *  1. "Is this my problem?"  → The neighborhood diagram literally places a
 *     dot labeled YOU next to the spammer on the shared IP. Self-recognition
 *     is the hook — visitors don't read about risk, they see themselves in it.
 *  2. "What does it cost me?" → The "Where your email lands" bars translate
 *     the abstract risk into the one number customers feel: inbox placement.
 *  3. "Prove it."             → The comparison table, with the dedicated
 *     column elevated like a recommended plan, ends in a plain-language
 *     verdict row.
 *  4. "What do I do next?"    → A single CTA with risk-reversal microcopy
 *     (setup time, guided warmup) so the decision feels safe, not salesy.
 */

/* ——— Illustrative placement numbers ———
   Replace with your real measured averages (or your case-study numbers).
   Keeping them honest matters: this section is called ProofStrip. */
const SHARED_INBOX_RATE = 71;
const DEDICATED_INBOX_RATE = 98;

/* Deterministic dot layout for the shared-IP neighborhood.
   YOU_DOT sits adjacent to BAD_DOT on purpose — that proximity is the story. */
const SHARED_DOTS = [
  { cx: 24, cy: 26 }, { cx: 62, cy: 18 }, { cx: 100, cy: 30 },
  { cx: 140, cy: 20 }, { cx: 178, cy: 32 }, { cx: 40, cy: 62 },
  { cx: 82, cy: 56 }, { cx: 122, cy: 64 }, { cx: 162, cy: 58 },
  { cx: 28, cy: 96 }, { cx: 70, cy: 100 }, { cx: 112, cy: 94 },
  { cx: 154, cy: 102 }, { cx: 190, cy: 88 },
];
const BAD_DOT = 7;
const YOU_DOT = 6;
const TAINTED = new Set([2, 6, 8, 11, 12]);

export function ProofStrip() {
  return (
    <section className="relative border-y border-slate-200 bg-white">
      {/* Local keyframes. All motion is disabled under prefers-reduced-motion. */}
      <style>{`
        @keyframes ps-contaminate {
          0%   { r: 5; opacity: 0.55; }
          70%  { r: 26; opacity: 0; }
          100% { r: 26; opacity: 0; }
        }
        @keyframes ps-breathe {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 0.5; }
        }
        @keyframes ps-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .ps-pulse { animation: ps-contaminate 2.4s ease-out infinite; transform-box: fill-box; }
        .ps-glow  { animation: ps-breathe 3.2s ease-in-out infinite; }
        .ps-bar   { transform-origin: left; animation: ps-fill 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ps-pulse, .ps-glow, .ps-bar { animation: none; }
          .ps-pulse { opacity: 0.25; }
          .ps-bar   { transform: scaleX(1); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* ——— 1. Frame the problem in the customer's words ——— */}
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>Shared vs. dedicated</SectionEyebrow>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            Shared IPs put your inbox rate in someone else&apos;s hands.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-500">
            Every email you send is judged by the reputation of the IP it
            comes from. On a shared IP, that reputation belongs to everyone in
            the pool. On a dedicated IP, it belongs to you — and only you.
          </p>
        </Reveal>

        {/* ——— 2. Self-recognition: put the customer inside the diagram ——— */}
        <Reveal delay={0.05} className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Shared neighborhood — "you" trapped next to the spammer */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl bg-surface-50 p-6 ring-1 ring-slate-900/[0.06] transition-shadow duration-300 hover:shadow-[0_16px_48px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-small font-medium text-slate-500">
                <XCircle className="h-4 w-4 text-danger-600" strokeWidth={1.5} />
                Shared IP
              </span>
              <span className="rounded-full bg-danger-600/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-danger-600">
                You + everyone else
              </span>
            </div>

            <svg
              viewBox="0 0 214 132"
              className="mt-5 h-32 w-full"
              role="img"
              aria-label="Diagram of a shared IP: your sending sits in a pool of strangers, directly next to a bad sender whose reputation damage spreads to you"
            >
              {[...TAINTED].map((i) => (
                <line
                  key={`l-${i}`}
                  x1={SHARED_DOTS[BAD_DOT].cx}
                  y1={SHARED_DOTS[BAD_DOT].cy}
                  x2={SHARED_DOTS[i].cx}
                  y2={SHARED_DOTS[i].cy}
                  stroke="currentColor"
                  className="text-danger-600/25"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              ))}
              {SHARED_DOTS.map((d, i) => {
                const isBad = i === BAD_DOT;
                const isYou = i === YOU_DOT;
                const isTainted = TAINTED.has(i);
                return (
                  <g key={i}>
                    {isBad && (
                      <circle
                        cx={d.cx}
                        cy={d.cy}
                        r={5}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="ps-pulse text-danger-600"
                      />
                    )}
                    <circle
                      cx={d.cx}
                      cy={d.cy}
                      r={isBad ? 5.5 : isYou ? 5.5 : 4.5}
                      className={
                        isBad
                          ? "fill-danger-600"
                          : isYou
                            ? "fill-ink-950"
                            : isTainted
                              ? "fill-danger-600/40"
                              : "fill-slate-300"
                      }
                    />
                    {isYou && (
                      <>
                        <circle
                          cx={d.cx}
                          cy={d.cy}
                          r={9}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          className="text-ink-950/30"
                        />
                        <text
                          x={d.cx}
                          y={d.cy + 24}
                          textAnchor="middle"
                          className="fill-ink-950 text-[10px] font-semibold"
                        >
                          You
                        </text>
                      </>
                    )}
                    {isBad && (
                      <text
                        x={d.cx}
                        y={d.cy - 12}
                        textAnchor="middle"
                        className="fill-danger-600 text-[10px] font-medium"
                      >
                        Spammer
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <p className="mt-4 text-small leading-relaxed text-slate-500">
              You never chose your neighbors. When one of them spams, mailbox
              providers punish the IP — and your email goes down with theirs.
            </p>

            {/* Where your email lands — shared */}
            <div className="mt-5 border-t border-slate-900/[0.06] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Where your email lands
                </span>
                <span className="text-sm font-semibold tabular-nums text-ink-950">
                  ~{SHARED_INBOX_RATE}%{" "}
                  <span className="font-normal text-slate-400">inbox</span>
                </span>
              </div>
              <div
                className="mt-2 flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`On a typical shared IP, about ${SHARED_INBOX_RATE}% of email reaches the inbox; the rest is filtered to spam`}
              >
                <div
                  className="ps-bar h-full rounded-full bg-slate-400"
                  style={{ width: `${SHARED_INBOX_RATE}%` }}
                />
                <div
                  className="ps-bar h-full rounded-full bg-danger-600/60"
                  style={{ width: `${100 - SHARED_INBOX_RATE}%`, animationDelay: "0.15s" }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                The rest lands in spam — unread, unclicked, unbought.
              </p>
            </div>
          </div>

          {/* Dedicated neighborhood — "you", alone, in control */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-success-600/25 transition-shadow duration-300 hover:shadow-[0_16px_48px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-small font-medium text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-success-600" strokeWidth={1.5} />
                Dedicated IP
              </span>
              <span className="rounded-full bg-success-600/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-success-600">
                Just you
              </span>
            </div>

            <svg
              viewBox="0 0 214 132"
              className="mt-5 h-32 w-full"
              role="img"
              aria-label="Diagram of a dedicated IP: you are the only sender, so your reputation is fully yours"
            >
              <circle
                cx={107}
                cy={58}
                r={28}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                className="ps-glow text-success-600"
              />
              <circle
                cx={107}
                cy={58}
                r={15}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                className="text-success-600/40"
              />
              <circle cx={107} cy={58} r={6} className="fill-ink-950" />
              <text
                x={107}
                y={102}
                textAnchor="middle"
                className="fill-ink-950 text-[10px] font-semibold"
              >
                You
              </text>
            </svg>

            <p className="mt-4 text-small leading-relaxed text-slate-500">
              Your IP, your reputation. Every good send compounds into better
              placement — and no stranger can take it away from you.
            </p>

            {/* Where your email lands — dedicated */}
            <div className="mt-5 border-t border-success-600/15 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Where your email lands
                </span>
                <span className="text-sm font-semibold tabular-nums text-ink-950">
                  ~{DEDICATED_INBOX_RATE}%{" "}
                  <span className="font-normal text-slate-400">inbox</span>
                </span>
              </div>
              <div
                className="mt-2 flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`On a well-warmed dedicated IP, about ${DEDICATED_INBOX_RATE}% of email reaches the inbox`}
              >
                <div
                  className="ps-bar h-full rounded-full bg-success-600"
                  style={{ width: `${DEDICATED_INBOX_RATE}%` }}
                />
                <div
                  className="ps-bar h-full rounded-full bg-slate-200"
                  style={{ width: `${100 - DEDICATED_INBOX_RATE}%`, animationDelay: "0.15s" }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Warmed properly, your list actually sees what you send.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ——— 3. Evidence: the comparison table, verdict included ——— */}
        <Reveal
          delay={0.1}
          className="mt-6 overflow-hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_24px_64px_-32px_rgba(15,23,42,0.25)]"
        >
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-surface-50">
                <th
                  scope="col"
                  className="py-4 pl-6 pr-4 text-small font-medium text-slate-400"
                >
                  What you care about
                </th>
                <th scope="col" className="py-4 pr-4 text-small font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-danger-600" strokeWidth={1.5} />
                    Shared IP
                  </span>
                </th>
                <th
                  scope="col"
                  className="border-l border-success-600/15 bg-success-600/[0.04] py-4 pl-4 pr-6 text-small font-medium text-ink-950"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success-600" strokeWidth={1.5} />
                    Dedicated IP
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {proofRows.map((row) => (
                <tr
                  key={row.label}
                  className="group border-b border-slate-100 transition-colors hover:bg-surface-50/60"
                >
                  <td className="py-4 pl-6 pr-4 text-sm font-medium text-ink-950">
                    {row.label}
                  </td>
                  <td className="py-4 pr-4 text-sm text-slate-500">{row.shared}</td>
                  <td className="border-l border-success-600/15 bg-success-600/[0.04] py-4 pl-4 pr-6 text-sm font-medium text-ink-950 transition-colors group-hover:bg-success-600/[0.07]">
                    {row.dedicated}
                  </td>
                </tr>
              ))}
              {/* Verdict row: say the conclusion for them, in their language */}
              <tr className="bg-surface-50">
                <td className="py-4 pl-6 pr-4 text-sm font-semibold text-ink-950">
                  Bottom line
                </td>
                <td className="py-4 pr-4 text-sm text-slate-500">
                  Your results depend on strangers.
                </td>
                <td className="border-l border-success-600/15 bg-success-600/[0.06] py-4 pl-4 pr-6 text-sm font-semibold text-ink-950">
                  Your results depend on you.
                </td>
              </tr>
            </tbody>
          </table>
        </Reveal>

        <p className="mt-4 text-small text-slate-400">{proofFootnote}</p>

        {/* ——— 4. Next step: one clear action, made to feel safe ——— */}
        <Reveal
          delay={0.15}
          className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink-950 p-8 sm:flex-row sm:items-center"
        >
          <div className="max-w-md">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Own your sending reputation.
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              Get a dedicated IP with guided warmup — so you build a clean
              reputation from day one, without the deliverability guesswork.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {/* Swap this <a> for your shared Button component if you have one */}
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get your dedicated IP
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-success-600" strokeWidth={1.5} />
              Set up in minutes · Warmup plan included
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
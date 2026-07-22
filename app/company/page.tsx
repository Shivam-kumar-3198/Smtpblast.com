import type { Metadata } from "next";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Company",
  description:
    "SMTPblast builds dedicated SMTP infrastructure and manages the IP warm-up process that most spam-folder problems come from skipping.",
  alternates: { canonical: "/company" },
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

/**
 * Hero photo — server racks (Taylor Vick, Unsplash).
 * Unsplash license: free for commercial use, no attribution required,
 * hotlinking via images.unsplash.com is officially supported.
 * To use your own photo later, just replace this URL (or point it to a
 * file in /public, e.g. "/company-hero.jpg").
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1280&auto=format&fit=crop";

const STATS: { value: string; label: string }[] = [
  { value: "1:1", label: "Dedicated IPs per customer — reputation never shared" },
  { value: "30 days", label: "Managed warm-up on every IP before full volume" },
  { value: "99.99%", label: "Uptime SLA across the sending fleet" },
  { value: "24/7", label: "Deliverability engineers on call, not a ticket queue" },
];

const PRINCIPLES: { code: string; title: string; body: string }[] = [
  {
    code: "DEDICATED",
    title: "Your reputation should be yours alone",
    body:
      "On a shared IP, your inbox placement is hostage to whoever else is sending through it. Every SMTPblast customer gets dedicated IP addresses, so the sending history mailbox providers see is the history you actually earned — nothing more, nothing less.",
  },
  {
    code: "WARM-UP",
    title: "Warm-up is infrastructure, not a checkbox",
    body:
      "A new IP pushed to full volume on day one looks exactly like a spammer to Gmail and Outlook. We run a managed ramp on every IP we provision — seed lists first, engaged recipients next, full volume last — and we watch the reputation signals the whole way.",
  },
  {
    code: "VISIBILITY",
    title: "Deliverability is measurable, so we measure it",
    body:
      "Inbox placement isn't a feeling. We track bounce classes, complaint rates, blocklist status, and provider-level acceptance for every IP, and surface all of it. When something drifts, you see it before your open rates do.",
  },
  {
    code: "HUMANS",
    title: "Real engineers answer, and they've seen your problem before",
    body:
      "When a mailbox provider starts deferring your mail at 2 a.m., a knowledge-base article doesn't help. Our deliverability engineers have remediated blocklistings, negotiated with postmasters, and rebuilt reputations. That experience is part of the product.",
  },
];

const WARMUP_STEPS: { days: string; volume: string; detail: string }[] = [
  { days: "Days 1–3", volume: "~50/day", detail: "Seed lists and internal addresses establish first sending history" },
  { days: "Days 4–10", volume: "500–2,500/day", detail: "Most-engaged recipients only — opens and replies build trust fastest" },
  { days: "Days 11–20", volume: "10k–30k/day", detail: "Volume ramps as provider feedback loops confirm acceptance" },
  { days: "Days 21–30", volume: "→ full volume", detail: "Reputation established; monitoring continues permanently" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CompanyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        {/* ---------------------------------------------------------- */}
        {/* Hero — thesis + infrastructure photo                       */}
        {/* ---------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-slate-200">
          {/* faint routing-grid backdrop, decorative only */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_35%,transparent_100%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-14">
            {/* Left — thesis */}
            <div>
              <p className="anim-rise font-mono text-xs uppercase tracking-[0.22em] text-slate-500 [animation-delay:0ms]">
                About SMTPblast
              </p>
              <h1 className="anim-rise mt-5 text-h3 font-semibold leading-[1.08] tracking-tight text-ink-950 [animation-delay:80ms] sm:text-h2">
                Infrastructure for teams that got tired of the spam folder.
              </h1>
              <p className="anim-rise mt-6 text-body-lg text-slate-600 [animation-delay:160ms]">
                SMTPblast provides dedicated SMTP servers and IP addresses for teams
                sending marketing and transactional email at volume — along with the
                domain authentication and warm-up process that determines whether that
                mail actually reaches the inbox.
              </p>
              <p className="anim-rise mt-4 max-w-xl text-sm leading-relaxed text-slate-600 [animation-delay:240ms]">
                Most deliverability problems trace back to a shared IP with someone
                else&apos;s reputation attached to it, or a new IP pushed to full volume
                before it has any sending history. We provision dedicated IPs per
                customer and run a managed warm-up schedule on every one of them, rather
                than treat that step as optional.
              </p>
              <div className="anim-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:320ms]">
                <a
                  href="https://wa.link/zf6mav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-accent-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
                >
                  Talk to a deliverability engineer
                </a>
                <a
                  href="#how-we-warm-up"
                  className="inline-flex items-center gap-2 rounded-md px-2 py-3 text-sm font-medium text-ink-950 underline-offset-4 transition-colors hover:text-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
                >
                  See how we warm up an IP
                  <span aria-hidden="true" className="font-mono">↓</span>
                </a>
              </div>
            </div>

            {/* Right — infrastructure photo */}
            <figure className="anim-rise relative mx-auto w-full max-w-xl lg:max-w-none [animation-delay:280ms]">
              <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-900/10 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_IMAGE}
                  alt="Rows of dedicated server racks with structured network cabling inside a data center"
                  width={1280}
                  height={960}
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[4/3] w-full object-cover"
                />
                {/* soft bottom fade so the badge stays readable */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent"
                />
                {/* small identity badge */}
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-slate-950/70 px-3 py-1.5 font-mono text-[11px] tracking-wide text-slate-200 backdrop-blur">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  mx1.smtpblast.io · dedicated
                </span>
              </div>
              <figcaption className="mt-3 text-center font-mono text-[11px] tracking-wide text-slate-500">
                Dedicated racks, dedicated IPs — your sending reputation, and only yours.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Stat rail                                                  */}
        {/* ---------------------------------------------------------- */}
        <section aria-label="How SMTPblast operates, in numbers" className="border-b border-slate-200 bg-slate-50/60">
          <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-slate-200 px-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {STATS.map((s) => (
              <div key={s.label} className="py-8 sm:px-6 lg:py-10 lg:first:pl-0 lg:last:pr-0">
                <dt className="order-2 mt-2 block text-sm leading-relaxed text-slate-600">{s.label}</dt>
                <dd className="order-1 font-mono text-2xl font-medium tracking-tight text-ink-950">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Principles                                                 */}
        {/* ---------------------------------------------------------- */}
        <section aria-labelledby="principles-heading" className="border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                What we believe
              </p>
              <h2 id="principles-heading" className="mt-4 text-h3 font-semibold tracking-tight text-ink-950">
                Deliverability is an engineering problem. We treat it like one.
              </h2>
            </div>
            <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <article key={p.code} className="border-t border-slate-200 pt-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-600">
                    {p.code}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-950">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* The warm-up schedule — curve + ledger                      */}
        {/* ---------------------------------------------------------- */}
        <section
          id="how-we-warm-up"
          aria-labelledby="warmup-heading"
          className="scroll-mt-24 border-b border-slate-200 bg-slate-50/60"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                How an IP earns its reputation
              </p>
              <h2 id="warmup-heading" className="mt-4 text-h3 font-semibold tracking-tight text-ink-950">
                Thirty days from cold IP to established sender.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Mailbox providers judge new IPs by their sending history — and a brand-new
                IP has none. This is the ramp we run on every IP we provision. It&apos;s the
                unglamorous step most providers skip, and it&apos;s where inbox placement
                is actually won.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
              {/* Curve */}
              <figure aria-label="Warm-up curve: sending volume ramping from roughly 50 emails per day to full volume over 30 days">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <svg viewBox="0 0 640 260" role="img" aria-hidden="true" className="w-full">
                    {/* horizontal gridlines + volume labels */}
                    {[
                      { y: 40, label: "100k" },
                      { y: 100, label: "10k" },
                      { y: 160, label: "1k" },
                      { y: 220, label: "100" },
                    ].map((g) => (
                      <g key={g.y}>
                        <line x1="52" y1={g.y} x2="620" y2={g.y} stroke="#E2E8F0" strokeWidth="1" />
                        <text x="44" y={g.y + 4} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="ui-monospace, monospace">
                          {g.label}
                        </text>
                      </g>
                    ))}
                    {/* area fill under curve */}
                    <path
                      d="M64 226 C 200 222, 320 200, 420 140 S 570 55, 608 40 L 608 236 L 64 236 Z"
                      fill="currentColor"
                      className="text-accent-600"
                      opacity="0.06"
                    />
                    {/* the ramp */}
                    <path
                      d="M64 226 C 200 222, 320 200, 420 140 S 570 55, 608 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="text-accent-600"
                    />
                    {/* milestones */}
                    {[
                      { x: 64, y: 226, d: "Day 1" },
                      { x: 250, y: 213, d: "Day 10" },
                      { x: 420, y: 140, d: "Day 20" },
                      { x: 608, y: 40, d: "Day 30" },
                    ].map((m) => (
                      <g key={m.d}>
                        <circle cx={m.x} cy={m.y} r="4.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="2" className="text-accent-600" />
                        <text
                          x={m.x}
                          y={252}
                          textAnchor={m.x > 560 ? "end" : m.x < 90 ? "start" : "middle"}
                          fontSize="10"
                          fill="#64748B"
                          fontFamily="ui-monospace, monospace"
                        >
                          {m.d}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                <figcaption className="mt-3 font-mono text-[11px] tracking-wide text-slate-500">
                  fig. 01 — managed volume ramp, per dedicated IP (log scale)
                </figcaption>
              </figure>

              {/* Ledger */}
              <ol className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
                {WARMUP_STEPS.map((step) => (
                  <li key={step.days} className="grid gap-1 px-6 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                    <div>
                      <p className="font-mono text-xs font-medium text-ink-950">{step.days}</p>
                      <p className="font-mono text-[11px] text-accent-600">{step.volume}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{step.detail}</p>
                  </li>
                ))}
                <li className="px-6 py-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Day 31 onward — monitoring never stops. Reputation is maintained, not archived.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Closing CTA                                                */}
        {/* ---------------------------------------------------------- */}
        <section aria-labelledby="cta-heading" className="bg-[#0B1120]">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Ready when you are
              </p>
              <h2 id="cta-heading" className="mt-4 text-h3 font-semibold tracking-tight text-white">
                Send from infrastructure with your name on it.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Tell us your volume, your domains, and where your mail is landing today.
                A deliverability engineer — not a sales script — will map out your
                dedicated setup and warm-up plan.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://wa.link/zf6mav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-accent-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Talk to a deliverability engineer
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* ------------------------------------------------------------ */}
      {/* Page-scoped motion. Fully disabled under reduced motion.     */}
      {/* ------------------------------------------------------------ */}
      <style>{`
        @keyframes company-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-rise {
          opacity: 0;
          animation: company-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-rise { opacity: 1; animation: none; transform: none; }
        }
      `}</style>
    </>
  );
}
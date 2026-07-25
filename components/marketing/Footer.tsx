import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings-content";
import { listServices } from "@/lib/services-content";
import {
  Send,
  Instagram,
  MessageCircle,
  MapPin,
  Link2,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

const SOCIAL_ICON_MAP: Record<string, typeof Link2> = {
  "Twitter / X": Send,
  Instagram: Instagram,
  Telegram: MessageCircle,
  Pinterest: MapPin,
};

const companyLinks = [
  { label: "About", href: "/company" },
  { label: "Blog", href: "/blog" },
  { label: "Talk to sales", href: "/talk-to-sales" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Anti-Spam Policy", href: "/legal/anti-spam-policy" },
];

const PROOF_POINTS = [
  { label: "avg. first reply", value: "< 4 hrs" },
  { label: "inbox placement", value: "98.4%" },
  { label: "uptime", value: "99.99%" },
];

export async function Footer() {
  const [siteSettings, services] = await Promise.all([getSiteSettings(), listServices()]);
  const year = new Date().getFullYear();

  // Solutions column mirrors the live services collection (same order as
  // the admin panel and the homepage overview) instead of a hand-maintained
  // list, so it can never drift out of sync with what's actually published.
  const solutionsLinks = services.map((s) => ({ label: s.name, href: `/services/${s.slug}` }));
  const linkColumns = [
    { heading: "Solutions", links: solutionsLinks },
    { heading: "Company", links: companyLinks },
    { heading: "Legal", links: legalLinks },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-slate-300">
      {/* ═════════ CTA — full-bleed white band, split cell with proof metrics ═════════ */}
      <div className="relative border-b border-slate-200 bg-white">
        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <div className="py-16 pr-0 lg:border-r lg:border-slate-200 lg:pr-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-600">
                next step
              </p>
              <h2 className="mt-4 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-ink-950 sm:text-[2.75rem]">
                Every email you send deserves{" "}
                <span className="relative whitespace-nowrap">
                  the inbox.
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-accent-500"
                  />
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
                Dedicated IP, full authentication, managed warm-up — set up with
                you by an engineer, not a ticket bot.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/get-started"
                  className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-ink-950 px-8 text-[0.95rem] font-medium text-white outline-none transition-shadow duration-300 ease-out hover:shadow-[0_16px_32px_-14px_rgba(11,14,20,0.35)] focus-visible:ring-2 focus-visible:ring-accent-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
                  />
                  <span className="relative">Get started</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </Link>
                <a
                  href="https://wa.link/zf6mav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-3 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-ink-950 focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent-600 focus-visible:underline-offset-4"
                >
                  Talk to sales
                </a>
              </div>
            </div>

            {/* Proof metrics cell */}
            <div className="grid content-center gap-0 border-t border-slate-200 lg:border-t-0 lg:pl-14">
              {PROOF_POINTS.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-baseline justify-between gap-6 py-6 ${
                    i > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </span>
                  <span className="font-numeric text-2xl font-medium text-ink-950 sm:text-[1.75rem]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
        {/* Soft radial glow anchoring this dark section — matches CtaBand.
            Scoped inside this container (not a direct footer child) so it
            paints behind this section's own content instead of leaking
            into the white CTA band above. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-[480px] w-[480px] rounded-full bg-accent-500 opacity-[0.06] blur-[120px]"
        />

        {/* ═════════ Main grid — brand + hairline-divided columns ═════════ */}
        <div className="relative grid gap-y-14 py-16 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-y-0">
          {/* Brand cell */}
          <div className="lg:border-r lg:border-white/10 lg:pr-14">
            <Link href="/" aria-label="SMTPblast home" className="inline-block">
              <Image
                src="/smtpblast-logo.webp"
                alt="SMTPblast"
                width={210}
                height={31}
                className="h-7 w-auto brightness-0 invert"
                priority={false}
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              Dedicated SMTP servers, managed IP warm-up, and deliverability
              monitoring for teams sending 100K–10M emails a month.
            </p>

            {(siteSettings.phone || siteSettings.email) && (
              <ul className="mt-8 space-y-3">
                {siteSettings.phone && (
                  <li className="flex items-baseline gap-4">
                    <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      tel
                    </span>
                    <a
                      href={siteSettings.phone.href}
                      className="text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent-400 focus-visible:underline-offset-4"
                    >
                      {siteSettings.phone.display}
                    </a>
                  </li>
                )}
                {siteSettings.email && (
                  <li className="flex items-baseline gap-4">
                    <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      mail
                    </span>
                    <a
                      href={siteSettings.email.href}
                      className="text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent-400 focus-visible:underline-offset-4"
                    >
                      {siteSettings.email.display}
                    </a>
                  </li>
                )}
              </ul>
            )}

            {siteSettings.social.length > 0 && (
              <div className="mt-8 flex gap-2.5">
                {siteSettings.social.map((s) => {
                  const Icon = SOCIAL_ICON_MAP[s.platform] ?? Link2;
                  return (
                    <a
                      key={s.platform}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors duration-200 hover:border-accent-400/50 hover:bg-accent-400/10 hover:text-accent-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400/20"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link columns — sliding-arrow hover, hairline separation */}
          <nav aria-label="Footer" className="contents">
            {linkColumns.map(({ heading, links }, i) => (
              <div
                key={heading}
                className={`lg:pl-10 ${
                  i < linkColumns.length - 1
                    ? "lg:border-r lg:border-white/10 lg:pr-6"
                    : ""
                }`}
              >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-400">
                  {heading}
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center text-sm leading-relaxed text-slate-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
                      >
                        <ArrowRight
                          className="h-3.5 w-0 -translate-x-1 text-accent-400 opacity-0 transition-all duration-200 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:w-3.5 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className="transition-transform duration-200 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transform-none">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* ═════════ Bottom bar — handshake · status · copyright ═════════ */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="font-numeric truncate text-slate-500" aria-hidden="true">
            <span className="text-accent-400">220</span> smtp.smtpblast.io ESMTP
            ready
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>
            <span className="text-slate-500">
              © {year} {siteSettings.legalName}. All rights reserved.
            </span>
            <a
              href="#main-content"
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent-400 focus-visible:underline-offset-4"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* ═════════ Watermark wordmark ═════════
          Sized to render in full — no crop, no clipping — with real
          breathing room below it so it never presses against the true
          bottom edge of the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative mx-auto max-w-7xl select-none px-6 pb-10 pt-4 text-center sm:px-10 sm:pb-14 lg:px-14"
      >
        <p className="whitespace-nowrap text-6xl font-bold leading-none tracking-[-0.03em] text-white/5 sm:text-8xl lg:text-9xl">
          SMTPBLAST
        </p>
      </div>
    </footer>
  );
}

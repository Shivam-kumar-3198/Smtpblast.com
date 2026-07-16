import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Megaphone,
  Mail,
  Server,
  Rocket,
  Plug,
  FileCheck2,
  ShieldAlert,
  Gauge,
  MapPinned,
  BadgeCheck,
  Headphones,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Reveal } from "@/components/marketing/Reveal";
import { SectionEyebrow } from "@/components/marketing/SectionEyebrow";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every SMTPblast plan includes fast setup, SPF/DKIM authentication, bounce and spam management, high delivery rates, dedicated IPs, white-label servers, and 24/7 multilingual support.",
  alternates: { canonical: "/features" },
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

interface OfferCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const OFFERS: OfferCard[] = [
  {
    icon: Sparkles,
    title: "AI-Based Email Marketing Services",
    description:
      "SMTPblast is a trusted email marketing services provider with clients across Germany and the rest of Europe. Our managed campaigns move your business forward by keeping every send relevant to the person receiving it.",
    href: "/services/email-marketing",
  },
  {
    icon: Megaphone,
    title: "Email Campaign Services",
    description:
      "We bring deep experience across a wide range of email campaign work. Whether you're new to sending or already running high-volume campaigns, we review your requirements and budget before guiding you to the right setup.",
    href: "/services/email-campaigns",
  },
  {
    icon: Mail,
    title: "Bulk Email Services",
    description:
      "Our bulk email services keep delivery and deliverability at the highest standard, whatever type of bulk email you're sending. Modular, scalable, and reasonably priced — built to help you win more clients.",
    href: "/services/bulk-email",
  },
  {
    icon: Server,
    title: "AI-Enabled SMTP Server Provider",
    description:
      "Cloud-based SMTP server infrastructure built for unlimited marketing email. Manage your entire mailing list with dedicated support running on your own server, not a pool shared with other senders.",
    href: "/services/dedicated-smtp",
  },
];

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PACKAGE_FEATURES: FeatureCard[] = [
  {
    icon: Rocket,
    title: "Fast Setup",
    description:
      "As soon as you subscribe and complete payment, your service is initiated right away. There's no long wait — access to your servers is typically ready within minutes.",
  },
  {
    icon: Plug,
    title: "Compatible with Major Email Clients",
    description:
      "Our SMTP servers work with every major sending tool, including Turbo Mailer, Max Bulk Mailer, Microsoft Outlook, AMS (Advanced Mass Sender), Send Blaster, and more.",
  },
  {
    icon: FileCheck2,
    title: "SPF & DKIM Records",
    description:
      "We configure SPF and DKIM for your domain to increase its authority and keep your emails out of the spam folder.",
  },
  {
    icon: ShieldAlert,
    title: "Email Bounce and Spam Management",
    description:
      "We monitor spam complaints and bounces and notify you the moment an issue appears, so you can manage your campaigns with full visibility.",
  },
  {
    icon: Gauge,
    title: "High Delivery Rate",
    description:
      "Get a high deliverability rate backed by SMTPblast's powerful, purpose-built SMTP servers.",
  },
  {
    icon: MapPinned,
    title: "Dedicated IP",
    description:
      "Get a dedicated IP on SMTPblast's server and manage your own sender reputation, without interference from any other sender.",
  },
  {
    icon: BadgeCheck,
    title: "100% White-Label Servers",
    description:
      "Every server is fully white-labeled — your brand, end to end, with nothing that points back to us.",
  },
  {
    icon: Headphones,
    title: "24/7 Multilingual Support",
    description:
      "We're ready to help at any time, in the language you send in — over call, email, or Skype.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeaturesPage() {
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

          <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 text-center sm:pt-20">
            <Reveal>
              <nav aria-label="Breadcrumb" className="text-small text-slate-400">
                <Link href="/" className="hover:text-ink-950">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-ink-950">Features</span>
              </nav>
            </Reveal>

            <Reveal delay={0.05} className="mt-6 flex flex-col items-center gap-5">
              <SectionEyebrow>What we offer</SectionEyebrow>
              <h1 className="max-w-2xl text-balance text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                What we offer to our clients.
              </h1>
              <p className="max-w-xl text-balance text-body-lg leading-relaxed text-slate-600">
                Dedicated SMTP infrastructure, bulk sending, campaign strategy, and
                AI-enabled email marketing — with the same set of deliverability
                features included on every single plan.
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
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-8 text-[0.95rem] font-medium text-ink-800 outline-none transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-accent-500/40"
                >
                  View pricing
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= What we offer ================= */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>Our services</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                Four ways teams send with us.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OFFERS.map((offer, i) => {
                const Icon = offer.icon;
                return (
                  <Reveal key={offer.title} delay={i * 0.05}>
                    <Link
                      href={offer.href}
                      className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <h3 className="mt-4 text-h4 font-semibold text-ink-950">{offer.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {offer.description}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent-600">
                        Read more
                        <ArrowRight
                          aria-hidden
                          className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                        />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= Great features with every package ================= */}
        <section className="bg-surface-50/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>Every plan includes</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                Great features with every package.
              </h2>
              <p className="max-w-2xl text-body-lg leading-relaxed text-slate-600">
                No tiered feature-gating — the deliverability essentials below ship
                on every plan, from the trial to the largest dedicated cluster.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PACKAGE_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} delay={i * 0.04}>
                    <div className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent-500/30 bg-accent-50 text-accent-600">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-950">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

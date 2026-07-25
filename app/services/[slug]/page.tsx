import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Quote,
  ArrowRight,
  Server,
  Mail,
  Megaphone,
  Users,
  Sparkles,
  ShieldCheck,
  Gauge,
  Rocket,
  Headphones,
  Plug,
  LineChart,
  ClipboardList,
  TrendingUp,
  Link2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import Script from "next/script";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Reveal } from "@/components/marketing/Reveal";
import { SectionEyebrow } from "@/components/marketing/SectionEyebrow";
import { ServiceFlowVisual } from "@/components/marketing/ServiceFlowVisual";
import { ServiceHeroCollage } from "@/components/marketing/ServiceHeroCollage";
import { getServiceBySlug, listServices } from "@/lib/services-content";
import { getSolutionsSettingsDoc, applyServiceNameTemplate } from "@/lib/solutions-content";
import { honestLimitation } from "@/components/marketing/HowItWorks";
import { createCollectionCrud } from "@/lib/collection-crud";
import { getSiteSettings } from "@/lib/site-settings-content";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/schema";

/** Internal vs external is inferred from the URL, same rule the blog editor uses. */
function toInternalPath(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?smtpblast\.com/i, "") || "/";
}
function isInternalLink(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#") || /smtpblast\.com/i.test(url);
}

interface FaqDoc {
  question: string;
  answer: string;
}

interface StepDoc {
  title: string;
  description: string;
}

interface TestimonialDoc {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  date: string;
  source: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Server,
  Mail,
  Megaphone,
  Users,
  Sparkles,
  ShieldCheck,
  Gauge,
  Rocket,
  Headphones,
  Plug,
  LineChart,
  ClipboardList,
  TrendingUp,
};

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

// Same reasoning as app/blog/[slug]/page.tsx: these are statically
// generated at build time from the slugs above, so without a revalidate
// window an admin's edit to a service's content never reaches the live
// page until the next deploy.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const HeroIcon = ICON_MAP[service.icon] ?? Server;
  const [allFaqs, howItWorksSteps, testimonials, allServices, siteSettings, solutions] = await Promise.all([
    createCollectionCrud<FaqDoc>("faqItems").list(),
    createCollectionCrud<StepDoc>("howItWorksSteps").list(),
    createCollectionCrud<TestimonialDoc>("testimonials").list(),
    listServices(),
    getSiteSettings(),
    getSolutionsSettingsDoc(),
  ]);
  // Prefer this service's own curated FAQ; fall back to the first few
  // site-wide FAQs for services that haven't had one added yet.
  const serviceFaqs = service.faq.length > 0 ? service.faq : allFaqs.slice(0, 4);
  const otherServices = allServices.filter((s) => s.slug !== service.slug).slice(0, 4);

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 bg-white">
        {/* ================= Hero ================= */}
        <section className="relative overflow-hidden">
          {/* dot-grid texture, faded toward the edges */}
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
          {/* warm accent glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(247,148,29,0.12),transparent_70%)]"
          />
          {/* oversized watermark of the service's own icon */}
          <HeroIcon
            aria-hidden
            strokeWidth={0.6}
            className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 text-slate-900/[0.05] sm:-right-16 sm:-top-20 sm:h-[26rem] sm:w-[26rem]"
          />
          {/* page-margin hairlines, matching the homepage hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-5 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:left-8 lg:left-12 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-5 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:right-8 lg:right-12 lg:block"
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pt-20">
            <Reveal>
              <nav aria-label="Breadcrumb" className="text-small text-slate-400">
                <Link href="/" className="hover:text-ink-950">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link href={solutions.breadcrumbHref} className="hover:text-ink-950">
                  {solutions.breadcrumbLabel}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-ink-950">{service.name}</span>
              </nav>
            </Reveal>

            <div className="mt-6 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
              <Reveal
                delay={0.05}
                className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left"
              >
                <span className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/80 py-1.5 pl-2 pr-4 text-[0.8rem] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-600 text-white">
                    <HeroIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  {service.name}
                </span>

                <h1 className="max-w-xl text-balance text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                  {service.heading}
                </h1>
                <p className="max-w-xl text-balance text-body-lg leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <p className="max-w-lg text-sm font-medium text-accent-600">{service.useCase}</p>

                <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <a
                    href={solutions.heroCtaPrimaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-slate-900 px-8 text-[0.95rem] font-medium text-white outline-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_16px_32px_-14px_rgba(15,23,42,0.5)] focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
                    />
                    <span className="relative">{solutions.heroCtaPrimaryLabel}</span>
                    <ArrowRight
                      aria-hidden
                      className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </a>
                  <Link
                    href={solutions.heroCtaSecondaryHref}
                    className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-8 text-[0.95rem] font-medium text-ink-800 outline-none transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-accent-500/40"
                  >
                    {solutions.heroCtaSecondaryLabel}
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <ServiceHeroCollage
                  primary={service.primaryImage}
                  primaryAlt={service.primaryImageAlt}
                  secondary={service.secondaryImage}
                  secondaryAlt={service.secondaryImageAlt}
                  badgeLabel={service.heroBadgeLabel}
                  badgeIcon={ICON_MAP[service.heroBadgeIcon] ?? ShieldCheck}
                />
              </Reveal>
            </div>

            {/* ================= Flow visual ================= */}
            <Reveal delay={0.1} className="mt-14 sm:mt-16">
              <ServiceFlowVisual
                nodes={service.flow}
                windowLabel={`smtpblast.io/${service.slug}`}
                caption={honestLimitation}
              />
            </Reveal>
          </div>
        </section>

        {/* ================= What's included ================= */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.includedEyebrow}</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {applyServiceNameTemplate(solutions.includedHeadingTemplate, service.name)}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.included.map((item, i) => {
                const Icon = ICON_MAP[item.icon] ?? ShieldCheck;
                return (
                  <Reveal key={item.title} delay={i * 0.05}>
                    <div className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <h3 className="mt-4 text-h4 font-semibold text-ink-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= Shared vs dedicated ================= */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="flex flex-col items-start gap-4">
            <SectionEyebrow>{solutions.sharedVsDedicatedEyebrow}</SectionEyebrow>
            <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
              {solutions.sharedVsDedicatedHeading}
            </h2>
          </Reveal>

          <Reveal
            delay={0.05}
            className="mt-10 overflow-hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_24px_64px_-32px_rgba(15,23,42,0.25)]"
          >
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-surface-50">
                  <th className="py-4 pl-6 pr-4 text-small font-medium text-slate-400">&nbsp;</th>
                  <th className="py-4 pr-4 text-small font-medium text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-danger-600" strokeWidth={1.5} />
                      {solutions.sharedVsDedicatedSharedColumnLabel}
                    </span>
                  </th>
                  <th className="py-4 pr-6 text-small font-medium text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success-600" strokeWidth={1.5} />
                      {solutions.sharedVsDedicatedDedicatedColumnLabel}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {solutions.sharedVsDedicatedRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pl-6 pr-4 text-sm font-medium text-ink-950">
                      {row.label}
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-600">{row.shared}</td>
                    <td className="py-4 pr-6 text-sm text-ink-950">{row.dedicated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <p className="mt-4 text-small text-slate-400">{solutions.sharedVsDedicatedFootnote}</p>
        </section>

        {/* ================= How it goes live ================= */}
        <section className="border-y border-slate-200 bg-surface-50/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.howItWorksEyebrow}</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {solutions.howItWorksHeading}
              </h2>
            </Reveal>

            <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
              <span
                aria-hidden
                className="pointer-events-none absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block"
              />
              {howItWorksSteps.map((step, i) => (
                <Reveal key={step.id} delay={i * 0.08}>
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 font-numeric text-sm font-semibold text-white ring-4 ring-surface-50">
                      {i + 1}
                    </div>
                    <h3 className="mt-4 text-h4 font-semibold text-ink-950">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Testimonials ================= */}
        {testimonials.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.testimonialsEyebrow}</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {applyServiceNameTemplate(solutions.testimonialsHeadingTemplate, service.name.toLowerCase())}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.06}>
                  <figure className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    <Quote
                      className="h-6 w-6 text-accent-500"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <blockquote className="mt-4 text-body-lg leading-relaxed text-ink-950">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 text-sm font-medium text-slate-500">
                      {t.name}
                      {t.role || t.company ? (
                        <span className="text-slate-400">
                          {" "}
                          — {[t.role, t.company].filter(Boolean).join(", ")}
                        </span>
                      ) : null}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ================= FAQ ================= */}
        {serviceFaqs.length > 0 && (
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.faqEyebrow}</SectionEyebrow>
              <h2 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {applyServiceNameTemplate(solutions.faqHeadingTemplate, service.name.toLowerCase())}
              </h2>
            </Reveal>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              {serviceFaqs.map((item, i) => (
                <Reveal key={i} delay={i * 0.03}>
                  <details className="group border-b border-slate-100 px-6 py-5 last:border-0 open:bg-surface-50/60">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ink-950 marker:content-none focus-visible:outline-2 focus-visible:outline-accent-600">
                      <span className="text-sm font-medium sm:text-base">{item.question}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-open:bg-accent-600 group-open:text-white">
                        <ChevronDown
                          className="h-4 w-4 transition-transform duration-300 ease-out group-open:rotate-180"
                          strokeWidth={1.5}
                        />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ================= Related links ================= */}
        {service.links.length > 0 && (
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.relatedLinksEyebrow}</SectionEyebrow>
              <h2 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {applyServiceNameTemplate(solutions.relatedLinksHeadingTemplate, service.name.toLowerCase())}
              </h2>
            </Reveal>

            <ul className="mt-8 flex flex-wrap gap-3">
              {service.links.map((link, i) => {
                const internal = isInternalLink(link.url);
                const LinkIcon = internal ? Link2 : ExternalLink;
                const className =
                  "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-800 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50";
                return (
                  <li key={i}>
                    {internal ? (
                      <Link
                        href={toInternalPath(link.url)}
                        rel={link.nofollow ? "nofollow" : undefined}
                        className={className}
                      >
                        <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                        {link.text}
                      </Link>
                    ) : link.nofollow ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={className}
                      >
                        <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                        {link.text}
                      </a>
                    ) : (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
                        <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                        {link.text}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ================= Related solutions ================= */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="flex flex-col items-start gap-4">
              <SectionEyebrow>{solutions.relatedServicesEyebrow}</SectionEyebrow>
              <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {solutions.relatedServicesHeading}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherServices.map((s, i) => {
                const Icon = ICON_MAP[s.icon] ?? Server;
                return (
                  <Reveal key={s.slug} delay={i * 0.05}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-ink-950">{s.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.summary}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent-600">
                        {solutions.relatedServiceCardCtaLabel}
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

        <CtaBand imageSrc={service.secondaryImage} imageAlt="" />
      </main>
      <Footer />
      <Script
        id="service-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: service.name, url: `/services/${service.slug}` },
            ])
          ),
        }}
      />
      <Script
        id="service-service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd(siteSettings.companyName, service)),
        }}
      />
      {serviceFaqs.length > 0 && (
        <Script
          id="service-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(serviceFaqs)) }}
        />
      )}
    </>
  );
}

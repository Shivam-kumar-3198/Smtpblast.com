import { Globe, TrendingUp } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { LogoMarquee } from "./LogoMarquee";
import { SectionEyebrow } from "./SectionEyebrow";

/**
 * SocialProof — editorial testimonial layout
 *
 * Why this converts better than three equal cards:
 *
 *  FEATURED VOICE — The first testimonial becomes a large editorial
 *  pull-quote spanning two columns and two rows, with display-size type
 *  and its metric promoted to a stat. One strong voice is more
 *  persuasive than three competing whispers; the supporting cards
 *  corroborate it.
 *
 *  GHOST QUOTE MARK — Each card carries an oversized, ultra-faint
 *  serif quotation mark in the corner — the same "watermark" language
 *  as the services and bento cards, so the whole site stays one system.
 *
 *  PROOF DETAILS — The unused `source` field now renders as a small
 *  attribution chip ("via G2", "via X") and metrics get a trend icon.
 *  Specific, attributable, dated feedback is what visitors actually
 *  trust — the design surfaces every credibility signal the data has.
 *
 * Degrades gracefully: 1 testimonial → single featured card;
 * 2 → featured + one supporting; 3 → featured + two stacked.
 * Fully responsive down to one column.
 */

interface TestimonialDoc {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  date: string;
  source: string;
  /** Optional: ISO country name or emoji flag, e.g. "Germany" or "🇩🇪 Germany" */
  country?: string;
}

/** No CMS module for client logos or aggregate review scores yet — the
 * live site doesn't have either to show, so these stay empty/absent
 * rather than a Firestore collection with nothing in it. */
const clientLogos: { name: string; src: string; href?: string }[] = [];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-small";
  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-600 to-accent-600/70 font-semibold text-white ring-2 ring-white shadow-[0_4px_12px_-4px] shadow-accent-600/40`}
    >
      {initials(name)}
    </span>
  );
}

function SourceChip({ source }: { source: string }) {
  if (!source) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-surface-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-900/[0.06]">
      via {source}
    </span>
  );
}

function MetricChip({ metric, featured = false }: { metric: string; featured?: boolean }) {
  if (!metric) return null;
  if (featured) {
    return (
      <p className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-950 sm:text-xl">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-600/10 text-accent-600">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
        </span>
        {metric}
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-1.5 text-small font-medium text-accent-600">
      <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
      {metric}
    </p>
  );
}

/** Oversized, ultra-faint serif quote mark — the section's watermark. */
function GhostQuote({ featured = false }: { featured?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute select-none font-serif leading-none text-accent-600/[0.07] ${
        featured ? "-top-6 right-2 text-[11rem]" : "-top-3 right-3 text-[6.5rem]"
      }`}
    >
      &rdquo;
    </span>
  );
}

export async function SocialProof() {
  const testimonials = await createCollectionCrud<TestimonialDoc>("testimonials").list();
  const hasLogos = clientLogos.length > 0;
  const hasTestimonials = testimonials.length > 0;

  if (!hasLogos && !hasTestimonials) {
    return null;
  }

  const [featured, ...rest] = testimonials.slice(0, 9);
  const supporting = rest.slice(0, 2);
  const moreVoices = rest.slice(2);
  const featuredCaption = featured
    ? [featured.role, featured.company, featured.country].filter(Boolean).join(" · ")
    : "";

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {hasTestimonials && (
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <SectionEyebrow>What senders say</SectionEyebrow>
            <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
              Real feedback from people running mail through us.
            </h2>
            <p className="max-w-lg text-balance text-sm text-slate-500 sm:text-base">
              Every quote below is attributed, dated, and sourced — no anonymous
              blurbs, no five-star stock photos.
            </p>
          </Reveal>
        )}

        {hasLogos && (
          <Reveal className={hasTestimonials ? "mt-10" : ""}>
            <LogoMarquee logos={clientLogos} />
          </Reveal>
        )}

        {hasTestimonials && (
          <div
            className={`mt-10 grid gap-4 sm:gap-5 ${
              supporting.length > 0 ? "lg:grid-cols-3 lg:grid-rows-2" : ""
            }`}
          >
            {/* ——— Featured voice ——— */}
            <Reveal
              className={
                supporting.length > 0 ? "h-full lg:col-span-2 lg:row-span-2" : "h-full"
              }
            >
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface-50 p-7 ring-1 ring-slate-900/[0.06] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)] sm:p-10">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-600/[0.06] blur-3xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-accent-600/[0.04] blur-3xl"
                />

                <GhostQuote featured />

                <blockquote className="relative max-w-2xl text-lg font-medium leading-relaxed tracking-tight text-ink-950 sm:text-xl">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>

                {featured.metric && (
                  <div className="relative mt-6 inline-flex w-fit rounded-xl bg-accent-600/[0.07] px-4 py-2.5 ring-1 ring-accent-600/[0.08]">
                    <MetricChip metric={featured.metric} featured />
                  </div>
                )}

                <figcaption className="relative mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-slate-900/[0.06] pt-6">
                  <span className="flex items-center gap-3">
                    <Avatar name={featured.name} size="lg" />
                    <span>
                      <span className="block text-sm font-semibold text-ink-950">
                        {featured.name}
                      </span>
                      {(featuredCaption || featured.date) && (
                        <span className="block text-small text-slate-500">
                          {[featuredCaption, featured.date].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="ml-auto">
                    <SourceChip source={featured.source} />
                  </span>
                </figcaption>
              </figure>
            </Reveal>

            {/* ——— Supporting voices ——— */}
            {supporting.map((testimonial, i) => {
              const caption = [testimonial.role, testimonial.company, testimonial.country]
                .filter(Boolean)
                .join(" · ");
              const isOnlySupporting = supporting.length === 1;
              return (
                <Reveal
                  key={testimonial.id}
                  delay={(i + 1) * 0.06}
                  className={isOnlySupporting ? "h-full lg:row-span-2" : "h-full"}
                >
                  <figure
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] ${
                      isOnlySupporting ? "p-7 sm:p-8" : "p-6"
                    }`}
                  >
                    <GhostQuote featured={isOnlySupporting} />

                    <blockquote
                      className={`relative leading-relaxed text-ink-950 ${
                        isOnlySupporting ? "text-base font-medium tracking-tight sm:text-lg" : "text-sm"
                      }`}
                    >
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {testimonial.metric && (
                      <div
                        className={
                          isOnlySupporting
                            ? "relative mt-5 inline-flex w-fit rounded-xl bg-accent-600/[0.07] px-4 py-2.5 ring-1 ring-accent-600/[0.08]"
                            : "relative mt-3"
                        }
                      >
                        <MetricChip metric={testimonial.metric} featured={isOnlySupporting} />
                      </div>
                    )}

                    <figcaption
                      className={`relative mt-auto flex items-center gap-3 border-t border-slate-100 ${
                        isOnlySupporting ? "flex-wrap gap-y-3 pt-6" : "pt-4"
                      }`}
                    >
                      <Avatar name={testimonial.name} size={isOnlySupporting ? "lg" : "md"} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-950">
                          {testimonial.name}
                        </span>
                        {(caption || testimonial.date) && (
                          <span className="block truncate text-small text-slate-500">
                            {[caption, testimonial.date].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <span className="ml-auto shrink-0">
                        <SourceChip source={testimonial.source} />
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* ——— More voices, worldwide: compact cards for testimonials 4–9 ——— */}
        {moreVoices.length > 0 && (
          <>
            <Reveal className="mt-12 flex items-center gap-4">
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200"
              />
              <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200/90 bg-white py-1.5 pl-2 pr-4 text-small font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-600/10 text-accent-600">
                  <Globe className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                Trusted by senders worldwide
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200"
              />
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreVoices.map((testimonial, i) => {
                const caption = [testimonial.role, testimonial.company]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <Reveal key={testimonial.id} delay={i * 0.05} className="h-full">
                    <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface-50/70 p-5 ring-1 ring-slate-900/[0.05] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)]">
                      <blockquote className="relative text-sm leading-relaxed text-slate-700">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>

                      <figcaption className="relative mt-auto flex items-center gap-2.5 pt-4">
                        <Avatar name={testimonial.name} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink-950">
                            {testimonial.name}
                            {testimonial.country && (
                              <span className="ml-1.5 font-normal text-slate-500">
                                · {testimonial.country}
                              </span>
                            )}
                          </span>
                          {caption && (
                            <span className="block truncate text-small text-slate-500">
                              {caption}
                            </span>
                          )}
                        </span>
                        <span className="ml-auto shrink-0">
                          <SourceChip source={testimonial.source} />
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
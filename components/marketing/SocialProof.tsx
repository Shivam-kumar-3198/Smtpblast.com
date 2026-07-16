import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { LogoMarquee } from "./LogoMarquee";
import { SectionEyebrow } from "./SectionEyebrow";

interface TestimonialDoc {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  date: string;
  source: string;
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

export async function SocialProof() {
  const testimonials = await createCollectionCrud<TestimonialDoc>("testimonials").list();
  const hasLogos = clientLogos.length > 0;
  const hasTestimonials = testimonials.length > 0;

  if (!hasLogos && !hasTestimonials) {
    return null;
  }

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {hasTestimonials && (
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <SectionEyebrow>What senders say</SectionEyebrow>
            <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
              Real feedback from people running mail through us.
            </h2>
          </Reveal>
        )}

        {hasLogos && (
          <Reveal className={hasTestimonials ? "mt-10" : ""}>
            <LogoMarquee logos={clientLogos} />
          </Reveal>
        )}

        {hasTestimonials && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, i) => {
              const caption = [testimonial.role, testimonial.company].filter(Boolean).join(", ");
              return (
                <Reveal key={testimonial.id} delay={i * 0.06}>
                  <figure className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.08] shadow-[0_20px_44px_-24px_rgba(15,23,42,0.25)]">
                    <blockquote className="text-sm leading-relaxed text-ink-950">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    {testimonial.metric && (
                      <p className="mt-3 text-small font-medium text-accent-600">
                        {testimonial.metric}
                      </p>
                    )}
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-small font-semibold text-white">
                        {initials(testimonial.name)}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-ink-950">
                          {testimonial.name}
                        </span>
                        {(caption || testimonial.date) && (
                          <span className="block text-small text-slate-600">
                            {[caption, testimonial.date].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

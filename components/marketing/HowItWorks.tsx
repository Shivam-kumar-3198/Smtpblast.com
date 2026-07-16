import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

interface StepDoc {
  title: string;
  description: string;
}

export const honestLimitation =
  "Warm-up takes 2-3 weeks on new IPs — we don't skip it, because skipping it is why mail lands in spam.";

export async function HowItWorks() {
  const steps = await createCollectionCrud<StepDoc>("howItWorksSteps").list();
  if (steps.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            How a dedicated SMTP server for email marketing goes live.
          </h2>
        </Reveal>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.08}>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 font-numeric text-sm font-semibold text-white ring-4 ring-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-h4 font-semibold text-ink-950">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <p className="mt-12 rounded-2xl bg-surface-50 px-5 py-4 text-sm text-slate-600 ring-1 ring-slate-900/[0.06]">
            {honestLimitation}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

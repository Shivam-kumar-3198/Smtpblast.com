import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";
import { FaqAccordion } from "./FaqAccordion";

interface FaqDoc {
  question: string;
  answer: string;
}

export async function Faq() {
  const faqItems = await createCollectionCrud<FaqDoc>("faqItems").list();
  if (faqItems.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-500/[0.05] blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            Questions about dedicated SMTP servers and deliverability.
          </h2>
          <p className="max-w-lg text-sm text-slate-500 sm:text-base">
            Answered directly, by the team that runs the infrastructure — not a
            support script.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <FaqAccordion items={faqItems} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

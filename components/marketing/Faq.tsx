import { ChevronDown } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

interface FaqDoc {
  question: string;
  answer: string;
}

export async function Faq() {
  const faqItems = await createCollectionCrud<FaqDoc>("faqItems").list();
  if (faqItems.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <Reveal className="flex flex-col items-start gap-4">
        <SectionEyebrow>FAQ</SectionEyebrow>
        <h2 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
          Questions about dedicated SMTP servers and deliverability.
        </h2>
      </Reveal>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {faqItems.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.03}>
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
  );
}

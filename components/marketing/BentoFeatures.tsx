import Link from "next/link";
import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

interface FeatureDoc {
  icon: string;
  title: string;
  description: string;
  metric: string;
  href: string;
}

const FALLBACK_ICON: LucideIcon = Icons.Sparkles;

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? FALLBACK_ICON;
}

export async function BentoFeatures() {
  const bentoFeatures = await createCollectionCrud<FeatureDoc>("bentoFeatures").list();
  if (bentoFeatures.length === 0) return null;

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="flex flex-col items-start gap-4">
        <SectionEyebrow>What&apos;s included</SectionEyebrow>
        <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
          Built for teams sending real volume.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {bentoFeatures.map((feature, i) => {
          const Icon = resolveIcon(feature.icon);
          const content = (
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.08] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white transition-transform duration-300 ease-out group-hover:scale-105">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 text-h4 font-semibold text-ink-950">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              {feature.metric && (
                <span className="mt-auto pt-4 text-small font-medium text-accent-600">
                  {feature.metric}
                </span>
              )}
            </div>
          );

          return (
            <Reveal key={feature.id} delay={i * 0.05}>
              {feature.href ? (
                <Link href={feature.href} className="block h-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

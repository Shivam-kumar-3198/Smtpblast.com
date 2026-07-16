import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { listServices } from "@/lib/services-content";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

const FALLBACK_ICON: LucideIcon = Sparkles;

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? FALLBACK_ICON;
}

export async function ServicesOverview() {
  const services = await listServices();
  if (services.length === 0) return null;

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>What we offer</SectionEyebrow>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            Everything you need to reach the inbox, under one account.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = resolveIcon(service.icon);
            return (
              <Reveal key={service.slug} delay={i * 0.05}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white transition-transform duration-300 ease-out group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 text-h4 font-semibold text-ink-950">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent-600">
                    Learn more
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
  );
}

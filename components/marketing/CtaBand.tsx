import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings-content";
import { Reveal } from "./Reveal";

export async function CtaBand({
  imageSrc,
  imageAlt,
}: {
  imageSrc?: string;
  imageAlt?: string;
} = {}) {
  const siteSettings = await getSiteSettings();

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {imageSrc && (
        <Image
          aria-hidden
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          sizes="100vw"
          className="object-cover opacity-25 grayscale"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-950/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(247,148,29,0.16),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3.5 pr-4 text-[0.8rem] font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            Live in 24 hours
          </span>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-white sm:text-h2">
            Move your sending to a dedicated IP.
          </h2>
          <p className="max-w-md text-body-lg text-slate-400">
            Setup in 24 hours · Support included on every plan
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/get-started"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-white px-8 text-[0.95rem] font-medium text-ink-950 outline-none transition-shadow duration-300 ease-out hover:shadow-[0_16px_32px_-14px_rgba(255,255,255,0.25)] focus-visible:ring-2 focus-visible:ring-accent-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
              />
              <span className="relative transition-colors duration-300 group-hover:text-white">
                Get started
              </span>
              <ArrowRight
                aria-hidden
                className="relative h-4 w-4 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-white"
                strokeWidth={1.75}
              />
            </Link>
            {siteSettings.whatsapp ? (
              <Link
                href={siteSettings.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-8 text-[0.95rem] font-medium text-white outline-none transition-colors duration-200 ease-out hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent-400/50"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                Message us on WhatsApp
              </Link>
            ) : (
              <a
                href="https://wa.link/zf6mav"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-8 text-[0.95rem] font-medium text-white outline-none transition-colors duration-200 ease-out hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent-400/50"
              >
                Talk to a deliverability engineer
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

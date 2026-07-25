import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, MessageCircle, Mail, PhoneCall } from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your request has been received.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

const NEXT_STEPS = [
  {
    title: "We review your setup",
    detail: "A deliverability engineer looks at what you send and where it's landing today.",
  },
  {
    title: "We reach out",
    detail: "Usually within a few hours, by email or phone — whichever you gave us.",
  },
  {
    title: "We map your warm-up plan",
    detail: "A concrete IP and authentication setup sized to your actual sending volume.",
  },
];

function getIntro(source?: string) {
  if (source === "popup") {
    return {
      Icon: PhoneCall,
      text: "A deliverability engineer will call you back shortly. Keep your phone nearby.",
    };
  }
  return {
    Icon: Mail,
    text: "A deliverability engineer will reply to your work email shortly — usually within a few hours.",
  };
}

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { source?: string };
}) {
  const { Icon, text } = getIntro(searchParams.source);

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 bg-surface-50">
        <section className="mx-auto max-w-lg px-6 py-20 sm:py-28">
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.14),0_64px_128px_-48px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/8 sm:p-12">
            {/* Hairline brand accent along the top edge */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600/40"
            />

            <div className="text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-success-50 opacity-75 [animation-iteration-count:1] motion-reduce:animate-none"
                />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-50 ring-1 ring-success-600/15">
                  <Check className="h-7 w-7 text-success-600" strokeWidth={2.25} aria-hidden />
                </span>
              </div>

              <h1 className="mt-6 text-h4 font-semibold tracking-tight text-ink-950 sm:text-h3">
                Request received.
              </h1>
              <p className="mx-auto mt-3 flex max-w-sm items-start justify-center gap-2 text-body leading-relaxed text-slate-600">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
                <span>{text}</span>
              </p>
            </div>

            <div className="mt-10 divide-y divide-slate-100 border-y border-slate-100">
              {NEXT_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-950">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink-950 px-8 text-[0.95rem] font-medium text-white transition-colors duration-200 ease-out hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/20 sm:w-auto"
              >
                Back to homepage
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Link>
              <a
                href="https://wa.link/zf6mav"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-8 text-[0.95rem] font-medium text-ink-800 transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/20 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Message us on WhatsApp
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need something sooner? Reach us directly on WhatsApp above.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

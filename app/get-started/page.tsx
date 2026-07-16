import type { Metadata } from "next";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { LeadForm } from "@/components/marketing/LeadForm";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Start sending from a dedicated SMTP server. Tell us your sending volume and we'll set up authentication and warm-up.",
  alternates: { canonical: "/get-started" },
};

const STEPS = [
  {
    step: "01",
    title: "A deliverability engineer replies",
    body: "A real engineer — not a queue — reviews your volume and use case, usually within a few hours.",
  },
  {
    step: "02",
    title: "Your domain gets authenticated",
    body: "We issue your SPF, DKIM and DMARC records and verify them together before a single email leaves.",
  },
  {
    step: "03",
    title: "Your dedicated IP starts warming",
    body: "A gradual ramp-up schedule builds sender reputation with Gmail, Outlook and Yahoo from day one.",
  },
];

const AUTH_ROWS = [
  { record: "SPF", value: "v=spf1 include:_spf.smtpblast.io ~all" },
  { record: "DKIM", value: "k=rsa; p=MIGfMA0GCSqGSIb3…" },
  { record: "DMARC", value: "v=DMARC1; p=quarantine; rua=…" },
];

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <>
      <Nav />

      <main id="main-content" className="flex-1 bg-[#FAFAF7]">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl lg:grid-cols-[1.05fr_1fr]">
          {/* ————— Left: the briefing panel ————— */}
          <aside className="relative overflow-hidden bg-[#0C231E] px-6 py-14 text-[#E8F2EC] sm:px-10 lg:px-14 lg:py-20">
            {/* Ambient grid, purely decorative */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(#8FD9B6 1px, transparent 1px), linear-gradient(90deg, #8FD9B6 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />

            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8FD9B6]">
                smtpblast · get started
              </p>

              <h1 className="mt-6 max-w-md text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
                Your emails belong in the inbox.
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-[#B9CFC4]">
                Tell us your sending volume and we&apos;ll handle the rest — a
                dedicated IP, full domain authentication and a warm-up schedule
                built by people who do this every day.
              </p>

              {/* Signature element: live-style authentication check */}
              <div className="mt-10 max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8FD9B6]">
                    domain authentication
                  </p>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#8FD9B6]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8FD9B6] opacity-60 motion-reduce:hidden" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8FD9B6]" />
                    </span>
                    live
                  </span>
                </div>

                <ul className="mt-4 space-y-3">
                  {AUTH_ROWS.map(({ record, value }) => (
                    <li
                      key={record}
                      className="font-numeric flex items-center gap-3 text-xs"
                    >
                      <span className="w-14 shrink-0 text-[#8FD9B6]">
                        {record}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[#7E9A8D]">
                        {value}
                      </span>
                      <span className="shrink-0 rounded-full border border-[#8FD9B6]/30 bg-[#8FD9B6]/10 px-2 py-0.5 text-[10px] font-medium text-[#8FD9B6]">
                        PASS
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sequence — genuinely ordered, so numbering carries meaning */}
              <ol className="mt-12 max-w-md space-y-8">
                {STEPS.map(({ step, title, body }) => (
                  <li key={step} className="flex gap-5">
                    <span className="font-numeric mt-0.5 text-xs font-medium text-[#8FD9B6]">
                      {step}
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#9DB8AB]">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* ————— Right: the form ————— */}
          <div className="flex items-start justify-center px-6 py-14 sm:px-10 lg:items-center lg:px-14 lg:py-20">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight text-[#101512]">
                Talk to a deliverability engineer
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5B6B62]">
                No sales scripts. Just tell us what you send and how much —
                we&apos;ll reply with a concrete setup plan.
              </p>

              <div className="mt-8">
                <LeadForm source="get-started" defaultPlan={plan} />
              </div>

              <p className="mt-6 text-center text-xs leading-relaxed text-[#8A968F]">
                We only use your details to reply to this request. No mailing
                lists, no cold calls.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
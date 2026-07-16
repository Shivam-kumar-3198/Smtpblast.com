import type { Metadata } from "next";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { LeadForm } from "@/components/marketing/LeadForm";

export const metadata: Metadata = {
  title: "Talk to a Deliverability Engineer",
  description:
    "Discuss dedicated IP setup, warm-up, and migration with a deliverability engineer before you commit to a plan.",
  alternates: { canonical: "/talk-to-sales" },
};

export default function TalkToSalesPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            Talk to a deliverability engineer.
          </h1>
          <p className="mt-3 text-body-lg text-slate-600">
            Walk through your current sending setup, migration timeline, or a volume that
            doesn&apos;t fit the standard tiers, before you commit to a plan.
          </p>
          <div className="mt-10">
            <LeadForm source="talk-to-sales" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

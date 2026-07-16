import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Anti-Spam Policy",
  description: "Consent, content, and complaint-handling rules that apply to every account sending through SMTPblast.",
  alternates: { canonical: "/legal/anti-spam-policy" },
};

export default function AntiSpamPolicyPage() {
  return (
    <LegalLayout title="Anti-Spam Policy" lastUpdated="July 6, 2026">
      <section>
        <h2>Our commitment</h2>
        <p>
          Dedicated IP reputation is the thing this service exists to protect. Every account
          sending through SMTPblast is expected to follow the rules below, and violations
          are treated as a reputation risk to that account&apos;s own IP.
        </p>
      </section>

      <section>
        <h2>Consent requirements</h2>
        <ul>
          <li>Recipients must have opted in to receive mail from you.</li>
          <li>Purchased, rented, harvested, or scraped recipient lists are not allowed.</li>
          <li>Co-registration or third-party lists without direct opt-in are not allowed.</li>
        </ul>
      </section>

      <section>
        <h2>Message content requirements</h2>
        <ul>
          <li>Every message includes a working, one-click unsubscribe mechanism.</li>
          <li>Sender identity and subject lines accurately reflect the message content.</li>
          <li>Unsubscribe requests are honored promptly.</li>
        </ul>
      </section>

      <section>
        <h2>Complaint and bounce handling</h2>
        <p>
          Accounts are monitored for spam complaint rate and hard bounce rate. Accounts that
          exceed reasonable thresholds may have sending throttled, paused, or suspended
          while the cause is investigated.
        </p>
      </section>

      <section>
        <h2>Reporting abuse</h2>
        <p>
          To report suspected abuse of this policy, contact us through the{" "}
          <Link href="/talk-to-sales" className="text-accent-600 hover:underline">
            talk to sales
          </Link>{" "}
          form.
        </p>
      </section>
    </LegalLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of SMTPblast's dedicated SMTP and bulk email services.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="July 6, 2026">
      <section>
        <h2>Description of service</h2>
        <p>
          SMTPblast provides dedicated SMTP servers, IP addresses, domain authentication
          setup, IP warm-up, and deliverability monitoring for email sending. Plan limits
          (sending rate, IP count, support SLA) are as listed on the pricing page at the
          time of purchase.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          You may only send email to recipients who have consented to receive it. Sending to
          purchased, rented, harvested, or otherwise non-consenting recipient lists is
          prohibited and is covered in detail in our{" "}
          <Link href="/legal/anti-spam-policy" className="text-accent-600 hover:underline">
            Anti-Spam Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Warm-up compliance</h2>
        <p>
          New dedicated IPs go through a managed warm-up schedule. Sending volume that
          exceeds the agreed warm-up schedule may be throttled or delayed to protect IP
          reputation.
        </p>
      </section>

      <section>
        <h2>Suspension</h2>
        <p>
          We may suspend or terminate an account that violates the acceptable use terms
          above or the Anti-Spam Policy, including for high complaint or bounce rates.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          The service is provided on an as-available basis. To the extent permitted by
          applicable law, SMTPblast is not liable for indirect or consequential damages
          arising from use of the service.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          If these terms change, the &quot;last updated&quot; date above will change with
          them. Continued use of the service after a change constitutes acceptance of the
          updated terms.
        </p>
      </section>
    </LegalLayout>
  );
}

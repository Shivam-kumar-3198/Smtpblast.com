import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What SMTPblast collects through this site, how it's used, and how to request changes to it.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="July 6, 2026">
      <section>
        <h2>Information we collect</h2>
        <p>
          When you submit the get-started or talk-to-sales form on this site, we collect the
          fields you enter: name, email address, and any phone number, company name, plan
          interest, or message you provide. Phone, company, and message are optional.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use this information only to respond to your inquiry, set up your account if
          you sign up, and provide the deliverability service itself. We do not sell this
          information to third parties.
        </p>
      </section>

      <section>
        <h2>Cookies and tracking</h2>
        <p>
          This site does not currently set analytics or advertising cookies. If that
          changes, this policy will be updated to describe what is added.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          Inquiry and account data is retained for as long as needed to respond to your
          request, provide the service, or meet reasonable business record-keeping needs.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          To request access to, correction of, or deletion of your data, contact us through
          the{" "}
          <Link href="/talk-to-sales" className="text-accent-600 hover:underline">
            talk to sales
          </Link>{" "}
          form.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, the &quot;last updated&quot; date above will change with
          it.
        </p>
      </section>
    </LegalLayout>
  );
}

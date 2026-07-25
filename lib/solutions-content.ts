import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const SETTINGS_DOC = "solutionsSettings/main";

/**
 * Section-level copy for the Solutions/Services feature — the headings,
 * intros, and CTA labels that wrap around the per-service data in the
 * `services` collection (lib/services-content.ts), which this does not
 * touch. Same singleton-doc pattern as lib/site-settings-content.ts.
 */
export interface SolutionsSettingsDoc {
  // Homepage "What we offer" overview block (ServicesOverview.tsx)
  overviewEyebrow: string;
  overviewHeading: string;
  overviewCardCtaLabel: string;
  overviewCalloutHeading: string;
  overviewCalloutBody: string;
  overviewCalloutCtaLabel: string;
  overviewCalloutCtaHref: string;

  // Service detail page section labels (app/services/[slug]/page.tsx) —
  // shared across every service; per-service content itself (heading,
  // description, included cards, flow, FAQ, links) already lives on the
  // ServiceRecord and is untouched by this doc.
  breadcrumbLabel: string;
  breadcrumbHref: string;
  heroCtaPrimaryLabel: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryHref: string;
  includedEyebrow: string;
  includedHeadingTemplate: string;
  howItWorksEyebrow: string;
  howItWorksHeading: string;
  testimonialsEyebrow: string;
  testimonialsHeadingTemplate: string;
  faqEyebrow: string;
  faqHeadingTemplate: string;
  relatedLinksEyebrow: string;
  relatedLinksHeadingTemplate: string;
  relatedServicesEyebrow: string;
  relatedServicesHeading: string;
  relatedServiceCardCtaLabel: string;

  // "Shared vs. dedicated" comparison — the eyebrow/heading are specific
  // to the service detail page, but the table rows and footnote are also
  // reused by the homepage's ProofStrip component (components/marketing/
  // ProofStrip.tsx), which has its own separate eyebrow/heading/intro.
  sharedVsDedicatedEyebrow: string;
  sharedVsDedicatedHeading: string;
  sharedVsDedicatedSharedColumnLabel: string;
  sharedVsDedicatedDedicatedColumnLabel: string;
  sharedVsDedicatedRows: ComparisonRow[];
  sharedVsDedicatedFootnote: string;
}

export interface ComparisonRow {
  label: string;
  shared: string;
  dedicated: string;
}

/**
 * Seeded with this section's exact previous hardcoded copy, so converting
 * it to Firestore-backed content changes nothing on the live site until
 * someone actually edits a field from the admin panel.
 */
export const DEFAULT_SOLUTIONS_SETTINGS: SolutionsSettingsDoc = {
  overviewEyebrow: "What we offer",
  overviewHeading: "Everything you need to reach the inbox, under one account.",
  overviewCardCtaLabel: "Learn more",
  overviewCalloutHeading: "Need something tailored?",
  overviewCalloutBody:
    "Every sender's setup is different. Tell us where your email stands today and we'll map the fastest route to the inbox.",
  overviewCalloutCtaLabel: "Talk to a specialist",
  overviewCalloutCtaHref: "/get-started",

  breadcrumbLabel: "Solutions",
  breadcrumbHref: "/#features",
  heroCtaPrimaryLabel: "Get started",
  heroCtaPrimaryHref: "https://wa.link/zf6mav",
  heroCtaSecondaryLabel: "View pricing",
  heroCtaSecondaryHref: "/pricing",
  includedEyebrow: "What's included",
  includedHeadingTemplate: "What's included with {name}.",
  howItWorksEyebrow: "How it works",
  howItWorksHeading: "From signup to inbox.",
  testimonialsEyebrow: "From customers",
  testimonialsHeadingTemplate: "What senders on {name} say.",
  faqEyebrow: "FAQ",
  faqHeadingTemplate: "Questions about {name}.",
  relatedLinksEyebrow: "Related links",
  relatedLinksHeadingTemplate: "Learn more about {name}.",
  relatedServicesEyebrow: "Related solutions",
  relatedServicesHeading: "Other ways teams send with us.",
  relatedServiceCardCtaLabel: "Learn more",

  sharedVsDedicatedEyebrow: "Shared vs. dedicated",
  sharedVsDedicatedHeading: "Why this runs on dedicated infrastructure, not a shared pool.",
  sharedVsDedicatedSharedColumnLabel: "Shared IP",
  sharedVsDedicatedDedicatedColumnLabel: "Dedicated IP",
  sharedVsDedicatedRows: [
    {
      label: "Reputation",
      shared: "Pooled with every other sender on the IP",
      dedicated: "Tied only to your own sending history",
    },
    {
      label: "Throughput",
      shared: "Throttled by provider limits set for the whole pool",
      dedicated: "Rate limits set for your volume alone",
    },
    {
      label: "Blocklist risk",
      shared: "One sender's spam complaints can blocklist the pool",
      dedicated: "Only your own sending behavior affects the IP",
    },
  ],
  sharedVsDedicatedFootnote:
    "Structural differences between shared and dedicated IP infrastructure, not a measured inbox-rate comparison.",
};

/**
 * Fails soft to the seeded defaults (not a broken page) if the doc hasn't
 * been created yet or Firestore is unreachable — same rationale as
 * getSiteSettingsDoc(). Used by both the admin form and the public pages.
 */
export async function getSolutionsSettingsDoc(): Promise<SolutionsSettingsDoc> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_DOC));
    if (!snap.exists()) return DEFAULT_SOLUTIONS_SETTINGS;
    return { ...DEFAULT_SOLUTIONS_SETTINGS, ...(snap.data() as Partial<SolutionsSettingsDoc>) };
  } catch (err) {
    console.error("getSolutionsSettingsDoc failed:", err);
    return DEFAULT_SOLUTIONS_SETTINGS;
  }
}

/**
 * Fills the "{name}" placeholder in an admin-editable heading template
 * with a specific service's name — used for the per-service section
 * headings on /services/[slug] that combine static copy with the name
 * (e.g. "Questions about {name}." -> "Questions about dedicated smtp.").
 */
export function applyServiceNameTemplate(template: string, name: string): string {
  return template.replace(/\{name\}/g, name);
}

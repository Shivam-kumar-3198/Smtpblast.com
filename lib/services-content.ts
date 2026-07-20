import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";

export interface ServiceIncludedItem {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceFlowNode {
  icon: string;
  label: string;
  sublabel: string;
}

export interface ServiceLink {
  text: string;
  url: string;
  nofollow: boolean;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceRecord {
  id: string;
  slug: string;
  name: string;
  icon: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  description: string;
  useCase: string;
  included: ServiceIncludedItem[];
  flow: ServiceFlowNode[];
  primaryImage: string;
  primaryImageAlt: string;
  secondaryImage: string;
  secondaryImageAlt: string;
  heroBadgeIcon: string;
  heroBadgeLabel: string;
  links: ServiceLink[];
  faq: ServiceFaqItem[];
}

const SERVICES_COLLECTION = "services";

/**
 * Static copy of scripts/seed-content.mjs's `services` array — the same
 * content Firestore gets seeded with. Used only when the live read fails
 * or the collection comes back empty (e.g. Firestore rules misconfigured,
 * offline, or not seeded yet), so the Solutions pages never hard-404 just
 * because the CMS is unreachable.
 */
const FALLBACK_SERVICES: ServiceRecord[] = [
  {
    id: "fallback-dedicated-smtp",
    slug: "dedicated-smtp",
    name: "SMTP Server Provider",
    icon: "Server",
    summary:
      "A dedicated SMTP server and private IP for your domain, live in 24 hours with SPF/DKIM/DMARC configured.",
    metaTitle: "Dedicated SMTP Server for Email Marketing",
    metaDescription:
      "A dedicated SMTP server and private IP for your domain, with SPF, DKIM, and DMARC configured before your first send.",
    heading: "A dedicated SMTP server for email marketing and transactional mail.",
    description:
      "Cloud-based SMTP servers with a private IP for your domain, built to send unlimited marketing and transactional email. Reputation, rate limits, and blocklist exposure stay entirely within your own sending history, not a pool shared with other senders.",
    useCase:
      "Best for teams sending marketing and transactional email who need their sending reputation isolated from every other sender.",
    included: [
      { icon: "ShieldCheck", title: "Authenticated before go-live", description: "SPF, DKIM, and DMARC configured and verified before your first send." },
      { icon: "Gauge", title: "Your own sending rate", description: "Rate limits set for your volume alone, not throttled by a shared pool." },
      { icon: "Server", title: "Dedicated IP + rotation", description: "Dedicated IP options with smart rotation, on 100% white-label servers." },
      { icon: "Rocket", title: "Live in 24 hours", description: "Activation within minutes of signup, full setup complete in 24 hours." },
      { icon: "Headphones", title: "24/7 multilingual support", description: "Support available around the clock, in the language you send in." },
    ],
    flow: [
      { icon: "Server", label: "Your domain", sublabel: "Dedicated IP" },
      { icon: "ShieldCheck", label: "SPF · DKIM · DMARC", sublabel: "Verified" },
      { icon: "Send", label: "Managed warm-up", sublabel: "2-3 weeks" },
      { icon: "Inbox", label: "Inbox", sublabel: "Isolated reputation" },
    ],
    primaryImage: "/images/services/server-rack.jpg",
    primaryImageAlt: "A rack of dedicated servers with active network connections",
    secondaryImage: "/images/services/server-cables.jpg",
    secondaryImageAlt: "Close-up of network cabling running into a server switch",
    heroBadgeIcon: "Rocket",
    heroBadgeLabel: "Live in 24 hours",
    links: [],
    faq: [],
  },
  {
    id: "fallback-bulk-email",
    slug: "bulk-email",
    name: "Bulk Email Services",
    icon: "Mail",
    summary:
      "Modular, scalable bulk sending over SMTP or API, compatible with the tools you already use.",
    metaTitle: "Bulk Email Service Provider for High-Volume Senders",
    metaDescription:
      "Send marketing and transactional email at scale over SMTP or API, compatible with Outlook, Mailwizz, Interspire, and Turbo Mailer.",
    heading: "Bulk email sending built for marketing and transactional volume.",
    description:
      "Modular, scalable, and reasonably priced bulk email solutions focused on delivery and deliverability. Connect the sending tool you already use to a dedicated SMTP server or API endpoint, and send campaigns or transactional mail at the rate your plan allows.",
    useCase:
      "Best for teams who already use a sending tool and need dedicated infrastructure behind it, not another platform to switch to.",
    included: [
      { icon: "Plug", title: "Works with your existing tool", description: "Compatible with Outlook, Mailwizz, Interspire, Turbo Mailer, and custom apps." },
      { icon: "LineChart", title: "Real-time analytics", description: "Opens, bounces, and complaints tracked as they happen, not in a next-day report." },
      { icon: "ShieldCheck", title: "Bounce & spam management", description: "Ongoing suppression handling aimed at keeping delivery rates high." },
      { icon: "Server", title: "Modular infrastructure", description: "Scalable, reasonably priced plans focused on delivery, not just volume." },
    ],
    flow: [
      { icon: "Plug", label: "Your sending tool", sublabel: "Outlook · Mailwizz · Interspire" },
      { icon: "Server", label: "SMTP or API", sublabel: "Dedicated endpoint" },
      { icon: "LineChart", label: "Delivery tracked", sublabel: "Opens · bounces · complaints" },
      { icon: "Inbox", label: "Inbox", sublabel: "At your plan's rate" },
    ],
    primaryImage: "/images/services/inbox-screen.jpg",
    primaryImageAlt: "An email inbox open on a desktop monitor",
    secondaryImage: "/images/services/macbook-gmail.jpg",
    secondaryImageAlt: "A laptop showing an email client on a desk",
    heroBadgeIcon: "Plug",
    heroBadgeLabel: "SMTP + API ready",
    links: [],
    faq: [],
  },
  {
    id: "fallback-email-campaigns",
    slug: "email-campaigns",
    name: "Email Campaign Services",
    icon: "Megaphone",
    summary:
      "A requirements review and sending setup matched to your campaign before the first send.",
    metaTitle: "Email Campaign Services for Marketing Teams",
    metaDescription:
      "A full range of email campaign services, from strategy and list guidance to sending on dedicated infrastructure.",
    heading: "Email campaign services built around your sending goals.",
    description:
      "We review your campaign requirements and guide you toward the sending setup that fits — dedicated IP, shared IP, or a managed rotation — before your first campaign goes out.",
    useCase:
      "Best for marketing teams who want their sending setup reviewed before a campaign goes out, not diagnosed after it underperforms.",
    included: [
      { icon: "ClipboardList", title: "Requirements reviewed first", description: "We review your campaign requirements before recommending a sending setup." },
      { icon: "Server", title: "Setup matched to the campaign", description: "Dedicated IP, shared IP, or a managed rotation — whichever fits your volume." },
      { icon: "LineChart", title: "Opens and click-throughs tracked", description: "Campaign analytics available from the first send onward." },
      { icon: "ShieldCheck", title: "Authentication handled by default", description: "SPF, DKIM, and DMARC set up as part of every campaign, not an add-on." },
    ],
    flow: [
      { icon: "MessageCircle", label: "Requirements review", sublabel: "" },
      { icon: "Server", label: "Sending setup chosen", sublabel: "Dedicated · shared · rotation" },
      { icon: "Send", label: "Campaign sent", sublabel: "" },
      { icon: "LineChart", label: "Opens & clicks tracked", sublabel: "" },
    ],
    primaryImage: "/images/services/whiteboard-team.jpg",
    primaryImageAlt: "A team planning a campaign around a whiteboard",
    secondaryImage: "/images/services/brainstorm-team.jpg",
    secondaryImageAlt: "A marketing team reviewing campaign requirements together",
    heroBadgeIcon: "ClipboardList",
    heroBadgeLabel: "Reviewed before you send",
    links: [],
    faq: [],
  },
  {
    id: "fallback-email-marketing-reseller",
    slug: "email-marketing-reseller",
    name: "Email Marketing Reseller Service",
    icon: "Users",
    summary:
      "White-label servers you can resell under your own brand, with infrastructure handled on our end.",
    metaTitle: "Email Marketing Reseller Program",
    metaDescription:
      "Resell dedicated SMTP and bulk email infrastructure under your own brand with white-label servers.",
    heading: "Resell email infrastructure under your own brand.",
    description:
      "100% white-label servers let you offer dedicated SMTP and bulk email sending to your own clients, with the underlying infrastructure, support, and deliverability management handled on our end.",
    useCase:
      "Best for agencies and platforms who want to offer dedicated SMTP and bulk sending to their own clients without building the infrastructure themselves.",
    included: [
      { icon: "Users", title: "White-label, end to end", description: "100% white-label servers — your brand at every touchpoint, not ours." },
      { icon: "Server", title: "Per-client dedicated IPs", description: "Multiple dedicated IPs available for routing client traffic separately." },
      { icon: "Headphones", title: "Support for you and your clients", description: "24/7 support that covers both your team and the clients you resell to." },
      { icon: "ShieldCheck", title: "Infrastructure handled on our end", description: "Provisioning, deliverability, and monitoring stay behind the scenes." },
    ],
    flow: [
      { icon: "Users", label: "Your brand", sublabel: "" },
      { icon: "Server", label: "White-label servers", sublabel: "Infrastructure handled by us" },
      { icon: "Server", label: "Dedicated IPs per client", sublabel: "" },
      { icon: "Inbox", label: "Your clients' inboxes", sublabel: "" },
    ],
    primaryImage: "/images/services/handshake.jpg",
    primaryImageAlt: "Two business partners shaking hands over a signed agreement",
    secondaryImage: "/images/services/whiteboard-meeting.jpg",
    secondaryImageAlt: "A reseller and client team reviewing a plan together",
    heroBadgeIcon: "Users",
    heroBadgeLabel: "100% white-label",
    links: [],
    faq: [],
  },
  {
    id: "fallback-email-marketing",
    slug: "email-marketing",
    name: "Email Marketing Services",
    icon: "Sparkles",
    summary:
      "AI-enabled setup, warm-up, and deliverability management from your first send onward.",
    metaTitle: "AI-Enabled Email Marketing Services",
    metaDescription:
      "AI-enabled email marketing services covering setup, warm-up, and deliverability for marketing sends.",
    heading: "AI-enabled email marketing services, from setup to inbox.",
    description:
      "A trusted email marketing services provider for businesses sending to clients across multiple countries, pairing dedicated sending infrastructure with ongoing deliverability management.",
    useCase:
      "Best for businesses sending to clients across multiple countries who need setup, warm-up, and deliverability managed together.",
    included: [
      { icon: "Rocket", title: "Fast, authenticated setup", description: "SPF and DKIM records authenticated as part of onboarding." },
      { icon: "TrendingUp", title: "Managed IP warm-up", description: "Every new dedicated IP is warmed up over 2-3 weeks before full volume." },
      { icon: "ShieldCheck", title: "Bounce & spam management", description: "Ongoing management aimed at keeping delivery rates high." },
      { icon: "Sparkles", title: "AI-enabled deliverability", description: "Deliverability management that continues past the first send." },
    ],
    flow: [
      { icon: "Rocket", label: "Fast setup", sublabel: "SPF · DKIM authenticated" },
      { icon: "TrendingUp", label: "Managed warm-up", sublabel: "2-3 weeks" },
      { icon: "ShieldCheck", label: "Deliverability managed", sublabel: "Bounce & spam handling" },
      { icon: "Inbox", label: "Inbox", sublabel: "High delivery rates" },
    ],
    primaryImage: "/images/services/earth-night.jpg",
    primaryImageAlt: "Earth at night showing city lights across continents",
    secondaryImage: "/images/services/laptop-group.jpg",
    secondaryImageAlt: "A team collaborating on a laptop",
    heroBadgeIcon: "TrendingUp",
    heroBadgeLabel: "2-3 week warm-up",
    links: [],
    faq: [],
  },
];

function fromDoc(id: string, data: Record<string, unknown>): ServiceRecord {
  return {
    id,
    slug: String(data.slug ?? ""),
    name: String(data.name ?? ""),
    icon: String(data.icon ?? ""),
    summary: String(data.summary ?? ""),
    metaTitle: String(data.metaTitle ?? ""),
    metaDescription: String(data.metaDescription ?? ""),
    heading: String(data.heading ?? ""),
    description: String(data.description ?? ""),
    useCase: String(data.useCase ?? ""),
    included: Array.isArray(data.included) ? (data.included as ServiceIncludedItem[]) : [],
    flow: Array.isArray(data.flow) ? (data.flow as ServiceFlowNode[]) : [],
    primaryImage: String(data.primaryImage ?? ""),
    primaryImageAlt: String(data.primaryImageAlt ?? ""),
    secondaryImage: String(data.secondaryImage ?? ""),
    secondaryImageAlt: String(data.secondaryImageAlt ?? ""),
    heroBadgeIcon: String(data.heroBadgeIcon ?? ""),
    heroBadgeLabel: String(data.heroBadgeLabel ?? ""),
    links: Array.isArray(data.links) ? (data.links as ServiceLink[]) : [],
    faq: Array.isArray(data.faq) ? (data.faq as ServiceFaqItem[]) : [],
  };
}

/**
 * Public frontend — fail-soft, same rationale as lib/blog.ts's reads.
 * Falls back to FALLBACK_SERVICES whenever the live read errors out or
 * the collection is empty, so the Solutions pages stay up even if
 * Firestore rules, connectivity, or seeding are broken.
 */
export async function listServices(): Promise<ServiceRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, SERVICES_COLLECTION), orderBy("order")));
    if (snap.empty) return FALLBACK_SERVICES;
    return snap.docs.map((d) => fromDoc(d.id, d.data()));
  } catch (err) {
    console.error("listServices failed, using fallback content:", err);
    return FALLBACK_SERVICES;
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceRecord | null> {
  try {
    const q = query(collection(db, SERVICES_COLLECTION), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return FALLBACK_SERVICES.find((s) => s.slug === slug) ?? null;
    return fromDoc(snap.docs[0].id, snap.docs[0].data());
  } catch (err) {
    console.error("getServiceBySlug failed, using fallback content:", err);
    return FALLBACK_SERVICES.find((s) => s.slug === slug) ?? null;
  }
}

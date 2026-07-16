#!/usr/bin/env node
/**
 * One-time migration: writes the site's original content (the copy that
 * used to live in content/*.ts before the CMS) into Firestore, so the
 * live site isn't blank the moment the admin panel goes live. Safe to
 * re-run — it skips any collection that already has documents, so it
 * won't duplicate content an admin has since edited.
 *
 * Usage:
 *   node scripts/seed-content.mjs <admin-email> <admin-password>
 *
 * Requires .env.local to be filled in (NEXT_PUBLIC_FIREBASE_*), Email/
 * Password auth enabled, that admin user created, and their UID already
 * added to the admins collection — see README's "Admin panel setup".
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) {
    console.error(".env.local not found. Copy .env.example and fill in your Firebase config first.");
    process.exit(1);
  }
  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/seed-content.mjs <admin-email> <admin-password>");
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

async function seedCollection(name, docs) {
  const existing = await getDocs(collection(db, name));
  if (!existing.empty) {
    console.log(`  skip ${name} (already has ${existing.size} document${existing.size === 1 ? "" : "s"})`);
    return;
  }
  for (let i = 0; i < docs.length; i++) {
    await addDoc(collection(db, name), { ...docs[i], order: i });
  }
  console.log(`  seeded ${name}: ${docs.length} document${docs.length === 1 ? "" : "s"}`);
}

const pricingTiers = [
  {
    name: "Basic",
    tagline: "A 7-day trial to test sending before committing to a plan.",
    isContact: false,
    priceUSD: 55,
    priceINR: 4640,
    priceEUR: 51,
    priceUnit: "/ 7 days",
    highlighted: false,
    limits: [
      { label: "Sending rate", value: "500 emails/hour" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Shared, whitelisted" },
      { label: "Support", value: "Basic support" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: false },
      { label: "Blacklist monitoring", included: false },
      { label: "Mail tester report", included: false },
      { label: "RDNS", included: false },
      { label: "IP management", included: false },
    ],
    ctaLabel: "Start the trial",
    ctaHref: "/get-started?plan=basic",
  },
  {
    name: "Standard",
    tagline: "For a single product sending steady transactional volume.",
    isContact: false,
    priceUSD: 99,
    priceINR: 8285,
    priceEUR: 124,
    priceUnit: "/mo",
    highlighted: false,
    limits: [
      { label: "Sending rate", value: "1,000 emails/hour" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Shared" },
      { label: "Support", value: "Best support" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: true },
      { label: "RDNS", included: true },
      { label: "Mail tester report", included: true },
      { label: "Blacklist monitoring", included: false },
      { label: "IP management", included: false },
    ],
    ctaLabel: "Start with Standard",
    ctaHref: "/get-started?plan=standard",
  },
  {
    name: "Premium",
    tagline: "For marketing teams running frequent campaigns at volume.",
    isContact: false,
    priceUSD: 155,
    priceINR: 12973,
    priceEUR: 158,
    priceUnit: "/mo",
    highlighted: true,
    limits: [
      { label: "Sending rate", value: "2,000 emails/hour" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Dedicated" },
      { label: "Support", value: "24×7 best support" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: true },
      { label: "RDNS", included: true },
      { label: "Mail tester report", included: true },
      { label: "Blacklist monitoring", included: true },
      { label: "IP management", included: true },
    ],
    ctaLabel: "Start with Premium",
    ctaHref: "/get-started?plan=premium",
  },
  {
    name: "Enterprise",
    tagline: "For senders needing dedicated infrastructure and SLAs.",
    isContact: false,
    priceUSD: 245,
    priceINR: 20504,
    priceEUR: 191,
    priceUnit: "/mo",
    highlighted: false,
    limits: [
      { label: "Sending rate", value: "3,000 emails/hour" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Dedicated" },
      { label: "Support", value: "24×7 best support" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: true },
      { label: "RDNS", included: true },
      { label: "Mail tester report", included: true },
      { label: "Blacklist monitoring", included: true },
      { label: "IP management", included: true },
    ],
    ctaLabel: "Contact us",
    ctaHref: "/get-started?plan=enterprise",
  },
  {
    name: "Cluster",
    tagline: "For platforms reselling or routing very high daily volume.",
    isContact: false,
    priceUSD: 345,
    priceINR: 28869,
    priceEUR: 299,
    priceUnit: "/mo",
    highlighted: false,
    limits: [
      { label: "Sending rate", value: "10,000 emails/hour" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Multiple dedicated IPs" },
      { label: "Support", value: "24×7 best support" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: true },
      { label: "RDNS", included: true },
      { label: "Mail tester report", included: true },
      { label: "Blacklist monitoring", included: true },
      { label: "IP management", included: true },
    ],
    ctaLabel: "Talk to sales",
    ctaHref: "/get-started?plan=cluster",
  },
  {
    name: "Custom",
    tagline: "For senders whose volume or routing needs don't fit a fixed tier.",
    isContact: true,
    priceUSD: 0,
    priceINR: 0,
    priceEUR: 0,
    priceUnit: "",
    highlighted: false,
    limits: [
      { label: "Sending rate", value: "By consultation" },
      { label: "Subscribers", value: "Unlimited" },
      { label: "IP type", value: "Custom" },
      { label: "Support", value: "24×7 dedicated" },
    ],
    features: [
      { label: "Whitelist IP", included: true },
      { label: "SPF / DKIM / DMARC", included: true },
      { label: "RDNS", included: true },
      { label: "Mail tester report", included: true },
      { label: "Blacklist monitoring", included: true },
      { label: "IP management", included: true },
    ],
    ctaLabel: "Talk to sales",
    ctaHref: "/get-started?plan=custom",
  },
];

const testimonials = [
  {
    name: "Susan",
    role: "",
    company: "",
    quote: "Fast and Reliable Services With Excellent Customer support.",
    metric: "",
    date: "",
    source: "smtpblast.com",
  },
  {
    name: "Nikita Singh",
    role: "",
    company: "",
    quote:
      "Fast and Cost Efficient Services With Very Good Customer Support. Providing Premium SMTP services.",
    metric: "",
    date: "",
    source: "smtpblast.com",
  },
];

const faqItems = [
  {
    question: "What is a dedicated SMTP server?",
    answer:
      "A dedicated SMTP server sends mail from an IP address used only by you, instead of a pool shared with other senders. Your sending reputation is your own — it isn't affected by another customer's spam complaints or blocklist hits.",
  },
  {
    question: "How does IP warm-up work?",
    answer:
      "New IPs have no sending history, so mailbox providers throttle or spam-folder unfamiliar volume. Warm-up sends a gradually increasing daily volume over 2-3 weeks so providers can build a trust profile for the IP before you send at full scale.",
  },
  {
    question: "What does bulk email pricing look like in India?",
    answer:
      "Pricing is based on emails sent per hour, number of dedicated IPs, and whether managed warm-up and support SLAs are included, not a flat per-recipient fee. Our pricing table lists exact limits per tier, with INR, USD, and EUR rates.",
  },
  {
    question: "How is this different from a regular email marketing tool?",
    answer:
      "Most email marketing tools send through their own shared servers. We provide the SMTP server and dedicated IP itself, which you can connect to the marketing or transactional tool you already use over standard SMTP or API.",
  },
  {
    question: "Which sending tools are compatible?",
    answer:
      "Any client or platform that supports standard SMTP or API sending works, including Outlook, Mailwizz, Interspire, and Turbo Mailer, along with custom applications sending through our API.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Domain authentication (SPF, DKIM, DMARC) and server provisioning are completed within 24 hours of signup. Full-volume sending follows the 2-3 week warm-up period on new IPs.",
  },
];

const bentoFeatures = [
  {
    icon: "Rocket",
    title: "24-hour setup",
    description: "SPF, DKIM, and DMARC configured and verified before your first send.",
    metric: "Live in 24h",
    href: "/services/dedicated-smtp",
  },
  {
    icon: "Server",
    title: "White-label servers",
    description: "Your domain and IP end to end — nothing routes through shared infrastructure.",
    metric: "100% white-label",
    href: "/services/dedicated-smtp",
  },
  {
    icon: "ShieldCheck",
    title: "Dedicated IPs + rotation",
    description: "Isolated reputation per client, with smart rotation across pools when you scale.",
    metric: "",
    href: "/services/dedicated-smtp",
  },
  {
    icon: "FilterX",
    title: "AI spam & bounce management",
    description: "Automatic suppression list handling and content risk scoring before send.",
    metric: "",
    href: "/services/email-marketing",
  },
  {
    icon: "LineChart",
    title: "Real-time analytics",
    description: "Inbox placement, opens, bounces, and complaints as they happen.",
    metric: "",
    href: "/services/email-marketing",
  },
  {
    icon: "Plug",
    title: "SMTP + API compatibility",
    description: "Drop-in with Outlook, Mailwizz, Interspire, Turbo Mailer, and any SMTP client.",
    metric: "",
    href: "/services/bulk-email",
  },
];

const howItWorksSteps = [
  {
    title: "Authenticate",
    description:
      "We configure SPF, DKIM, and DMARC for your sending domain and verify each record before go-live.",
  },
  {
    title: "Warm up",
    description:
      "Your new IP ramps over 2-3 weeks on a managed volume schedule so mailbox providers learn to trust it.",
  },
  {
    title: "Send & monitor",
    description:
      "Once warm-up completes, you send at full volume with a live reputation and inbox-placement dashboard.",
  },
];

const services = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

// ---- Blog posts (dummy/starter content — real posts belong in
// /admin/blog, but these fill the blog index so it isn't empty and give
// a working example of the strict schema every real post has to pass). ----

function para(text) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}
function heading(text) {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] };
}
function doc(...blocks) {
  return { type: "doc", content: blocks };
}

const AUTHOR = "SMTPblast Team";

const blogPosts = [
  {
    title: "SPF, DKIM, and DMARC: What Each Record Checks",
    slug: "spf-dkim-dmarc-explained",
    seo: {
      metaTitle: "SPF, DKIM, and DMARC: What Each Record Checks",
      metaDescription:
        "Three acronyms, three different jobs. Here's what SPF, DKIM, and DMARC each verify, and why mailbox providers want all three before they trust your domain.",
      focusKeywords: ["SPF", "DKIM", "DMARC", "email authentication"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/auth-cables.jpg",
      width: 1200,
      height: 673,
      altText: "Close-up of network cabling running into a server switch",
    },
    content: doc(
      para(
        "SPF, DKIM, and DMARC get talked about as a single setup step, but each one checks something different, and mailbox providers weight them differently when deciding whether your mail is trustworthy."
      ),
      heading("SPF: who's allowed to send"),
      para(
        "SPF (Sender Policy Framework) is a DNS record that lists which mail servers are allowed to send on behalf of your domain. When a receiving server gets a message, it checks the sending IP against that list. It's the easiest of the three to set up, and also the easiest to get wrong — one missing IP after you switch providers, and legitimate mail starts failing the check."
      ),
      heading("DKIM: proving the message wasn't altered"),
      para(
        "DKIM (DomainKeys Identified Mail) attaches a cryptographic signature to each outgoing message, generated from a private key only your sending server holds. The receiving server looks up your public key in DNS and verifies the signature matches. Unlike SPF, DKIM survives forwarding — the signature travels with the message rather than depending on which server relayed it."
      ),
      heading("DMARC: making the other two enforceable"),
      para(
        "DMARC (Domain-based Message Authentication, Reporting and Conformance) doesn't check the message itself — it tells receiving servers what to do when SPF or DKIM fail, and asks for a report when that happens. A DMARC policy of 'reject' is what actually stops someone from spoofing your domain; without it, SPF and DKIM are just informational."
      ),
      para(
        "In practice: SPF alone stops naive spoofing, DKIM proves the message wasn't altered in transit, and DMARC is what makes both of them enforceable instead of advisory. All three configured and passing is table stakes for inbox placement on Gmail, Outlook, and Yahoo today."
      )
    ),
  },
  {
    title: "Why New IPs Get Throttled, and How Warm-Up Fixes It",
    slug: "why-new-ips-get-throttled",
    seo: {
      metaTitle: "Why New IPs Get Throttled, and How Warm-Up Fixes It",
      metaDescription:
        "A brand-new IP has no sending history, and mailbox providers treat that as a reason for suspicion. Here's what a managed warm-up schedule actually changes.",
      focusKeywords: ["IP warm-up", "sender reputation", "email deliverability"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/warmup-rack.jpg",
      width: 1200,
      height: 800,
      altText: "A rack of dedicated servers with active network connections",
    },
    content: doc(
      para(
        "Mailbox providers don't know anything about a new IP address, and in email, unknown doesn't default to neutral — it defaults to suspicious. An IP that suddenly starts sending tens of thousands of messages a day, with zero prior history, looks identical to a spam operation spinning up fresh infrastructure to dodge a blocklist."
      ),
      heading("What warm-up actually does"),
      para(
        "Warm-up addresses this by sending a small, steadily increasing volume from the new IP over a period of time — typically two to three weeks — so mailbox providers can build a reputation profile before you ever reach full volume. Each day's sending confirms the previous day wasn't a fluke: low complaint rates, low bounce rates, and recipients actually opening what you send."
      ),
      heading("What skipping it costs you"),
      para(
        "Skipping this step doesn't just risk the spam folder for that day's send — a new IP pushed straight to full volume can pick up a poor reputation quickly, and reputation is far easier to build correctly the first time than to repair afterward."
      ),
      para(
        "The schedule matters as much as the ramp itself: sending inconsistently (a burst one day, silence for a week, another burst) reads as unpredictable, and unpredictable sending patterns are one of the signals reputation systems weight most heavily. A managed warm-up schedule keeps the ramp both steady and complete."
      )
    ),
  },
  {
    title: "Dedicated vs. Shared IPs: When the Switch Pays Off",
    slug: "dedicated-vs-shared-ip",
    seo: {
      metaTitle: "Dedicated vs. Shared IPs: When the Switch Pays Off",
      metaDescription:
        "Shared IPs are not automatically worse than dedicated ones. Here is how to tell which one actually fits your current sending volume and pattern.",
      focusKeywords: ["dedicated IP", "shared IP", "email infrastructure"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/infra-switch.jpg",
      width: 1200,
      height: 675,
      altText: "A close-up of a network switch with cables connected",
    },
    content: doc(
      para(
        "A shared IP pools your sending reputation with every other sender on that IP. If everyone on the pool sends clean mail, that's fine — you benefit from an IP with an established history you didn't have to build yourself. The risk is that you don't control who else is on that pool, or what they send."
      ),
      heading("What you give up, and what you gain"),
      para(
        "A dedicated IP ties reputation entirely to your own sending behavior. Nobody else's complaint rate or blocklist hit affects you, but you also don't inherit any pre-built trust — a dedicated IP starts cold and has to go through warm-up before it can send at volume."
      ),
      heading("The volume threshold that actually matters"),
      para(
        "The volume threshold matters more than most advice suggests. At low, inconsistent volume, a dedicated IP can actually hurt you: mailbox providers want to see steady sending patterns to build a reputation profile, and a dedicated IP that sends a few hundred messages one week and nothing the next never accumulates enough history to be trusted."
      ),
      para(
        "As a rough guide, a dedicated IP starts to make sense once you're sending consistent volume — enough that a managed warm-up schedule can ramp it properly, and enough that your own sending behavior is what determines your reputation rather than noise. Below that, a shared IP with a good existing reputation is often the safer choice."
      )
    ),
  },
  {
    title: "Reading Inbox Placement Data Without Guessing",
    slug: "reading-inbox-placement-data",
    seo: {
      metaTitle: "Reading Inbox Placement Data Without Guessing",
      metaDescription:
        "Opens, bounces, and complaints tell you different things. Here is how to tell a deliverability problem from a content problem from a list problem.",
      focusKeywords: ["inbox placement", "email analytics", "bounce rate"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/inbox-placement.jpg",
      width: 1200,
      height: 675,
      altText: "An email inbox open on a desktop monitor",
    },
    content: doc(
      para(
        "It's tempting to treat every deliverability metric as one signal — 'engagement is down, something's wrong' — but bounces, complaints, and opens each point at a different part of the pipeline, and mixing them up leads to fixing the wrong thing."
      ),
      heading("Bounces: a list problem, not a deliverability problem"),
      para(
        "Hard bounces mean the address doesn't exist. A rising hard bounce rate is a list hygiene problem, not a deliverability problem — it means addresses have gone stale since they were collected, and continuing to send to them is what actually damages sender reputation over time."
      ),
      heading("Complaints: the metric that matters most"),
      para(
        "Complaint rate (recipients hitting 'mark as spam') is the metric mailbox providers weight most heavily, and it's a content and expectation problem more than an infrastructure one. People rarely complain about mail they expected to receive, even if they don't open it — they complain about mail that feels unexpected, too frequent, or irrelevant."
      ),
      para(
        "Open rate is the noisiest of the three. Privacy-focused mail clients now prefetch images for many messages regardless of whether a human opened them, which inflates opens without reflecting real engagement. It's still useful directionally, over time, on your own sends — just not as an absolute number to compare across campaigns."
      ),
      para(
        "The pipeline order that actually helps: check bounces first (list problem), then complaints (content or targeting problem), then use engagement trends as a slower-moving confirmation rather than a daily read."
      )
    ),
  },
  {
    title: "Sending Bulk Campaigns Without Tripping Spam Filters",
    slug: "bulk-campaigns-without-tripping-filters",
    seo: {
      metaTitle: "Sending Bulk Campaigns Without Tripping Spam Filters",
      metaDescription:
        "Volume alone does not trigger spam filters, patterns do. Here is what actually gets bulk sends flagged, and what does not, at real sending scale.",
      focusKeywords: ["bulk email", "spam filters", "list hygiene"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/bulk-sending.jpg",
      width: 1200,
      height: 972,
      altText: "A laptop showing an email client on a desk",
    },
    content: doc(
      para(
        "Sending to a large list isn't itself a red flag — mailbox providers handle legitimate high-volume senders every day. What gets bulk sends flagged is usually a mismatch between the sending pattern and what the recipient actually expects, not the raw number of messages."
      ),
      heading("The pattern spam filters are tuned to catch"),
      para(
        "Sending the exact same message, at the exact same second, to tens of thousands of addresses with no variation is a pattern spam filters are specifically tuned to catch, because it's also the signature of automated abuse. Staggering sends and avoiding identical boilerplate across every recipient reduces that overlap."
      ),
      heading("List quality compounds at volume"),
      para(
        "List quality compounds at volume in a way it doesn't at small scale. A 2% hard-bounce rate on a list of 500 is 10 bad addresses; on a list of 500,000 it's 10,000 — enough to visibly damage sender reputation within a single campaign. Cleaning a list before a bulk send matters more as volume goes up, not less."
      ),
      para(
        "The other lever that's easy to overlook: sending infrastructure that matches the volume. A dedicated IP or IP pool with proper rotation, sized for the campaign, keeps any single IP from absorbing a spike in complaints that a smaller setup would concentrate onto one reputation."
      )
    ),
  },
  {
    title: "Running White-Label SMTP Infrastructure for Clients",
    slug: "running-white-label-smtp",
    seo: {
      metaTitle: "Running White-Label SMTP Infrastructure for Clients",
      metaDescription:
        "Reselling email infrastructure means your clients' sending reputation is downstream of decisions you make. Here's what to get right early on.",
      focusKeywords: ["white-label SMTP", "email reseller", "client IPs"],
      canonicalUrl: "",
    },
    featuredImage: {
      url: "/images/blog/reseller-handshake.jpg",
      width: 1200,
      height: 800,
      altText: "Two business partners shaking hands over a signed agreement",
    },
    content: doc(
      para(
        "When you resell dedicated SMTP infrastructure under your own brand, every client's inbox placement is downstream of setup decisions made before they ever send their first campaign — authentication records, IP assignment, and warm-up scheduling all happen at your layer, not theirs."
      ),
      heading("Isolating clients matters more than in a single-company setup"),
      para(
        "Isolating clients onto separate IPs (or IP pools) matters more in a reseller setup than a single-company one, precisely because you don't control what each client sends. One client with poor list hygiene shouldn't be able to affect another client's reputation, and that separation has to be designed in from the start rather than added after a problem shows up."
      ),
      heading("Warm-up scheduling at scale"),
      para(
        "Warm-up scheduling gets harder to manage at scale, not easier — every new client sending real volume needs their own ramp period, and running several warm-up schedules in parallel across a client base takes more deliberate tracking than a single company managing its own IP."
      ),
      para(
        "The clients who ask about authentication setup and warm-up timelines before their first send are, in practice, the ones who have the fewest deliverability problems later. Setting that expectation early — that inbox placement is a setup process, not a switch you flip — saves a lot of after-the-fact troubleshooting."
      )
    ),
  },
];

async function seedPosts() {
  const existing = await getDocs(collection(db, "posts"));
  if (!existing.empty) {
    console.log(`  skip posts (already has ${existing.size} document${existing.size === 1 ? "" : "s"})`);
    return;
  }
  for (const post of blogPosts) {
    const now = serverTimestamp();
    await addDoc(collection(db, "posts"), {
      title: post.title,
      slug: post.slug,
      content: post.content,
      seo: post.seo,
      featuredImage: post.featuredImage,
      status: "published",
      author: AUTHOR,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });
  }
  console.log(`  seeded posts: ${blogPosts.length} documents`);
}

async function main() {
  console.log(`Signing in as ${email}...`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("Signed in. Seeding collections (skipping any that already have data)...\n");

  await seedCollection("pricingTiers", pricingTiers);
  await seedCollection("testimonials", testimonials);
  await seedCollection("faqItems", faqItems);
  await seedCollection("bentoFeatures", bentoFeatures);
  await seedCollection("howItWorksSteps", howItWorksSteps);
  await seedCollection("services", services);
  await seedPosts();

  console.log("\nDone. Site settings aren't seeded — fill those in at /admin/settings.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});

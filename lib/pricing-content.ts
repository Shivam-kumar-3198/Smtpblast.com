import { createCollectionCrud } from "./collection-crud";

export interface PricingLimit {
  label: string;
  value: string;
}

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingTierDoc {
  name: string;
  tagline: string;
  isContact: boolean;
  priceUSD: number;
  priceINR: number;
  priceEUR: number;
  priceUnit: string;
  highlighted: boolean;
  limits: PricingLimit[];
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
}

export type PricingTier = PricingTierDoc & { id: string };

/**
 * World currencies a visitor can view pricing in. USD, INR, and EUR are
 * the only currencies the business has set exact prices for (see
 * PricingTierDoc.priceUSD/INR/EUR) — those three are never converted.
 * Every other currency here is calculated from priceUSD using the
 * indicative `rateFromUSD` below, purely so a visitor anywhere in the
 * world sees a realistic estimate in their own currency. These rates are
 * static and approximate, not a live feed — see the disclaimer rendered
 * next to the currency switcher.
 */
export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  /** units of this currency per 1 USD. Ignored for USD/INR/EUR, which use the exact stored price. */
  rateFromUSD: number;
}

export const EXACT_CURRENCIES = ["USD", "INR", "EUR"] as const;

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rateFromUSD: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rateFromUSD: 0.92 },
  { code: "GBP", symbol: "£", label: "British Pound", rateFromUSD: 0.79 },
  { code: "INR", symbol: "₹", label: "Indian Rupee", rateFromUSD: 83.5 },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", rateFromUSD: 1.52 },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", rateFromUSD: 1.36 },
  { code: "AED", symbol: "AED", label: "UAE Dirham", rateFromUSD: 3.67 },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", rateFromUSD: 1.34 },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", rateFromUSD: 149 },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", rateFromUSD: 7.24 },
  { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar", rateFromUSD: 7.81 },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", rateFromUSD: 0.88 },
  { code: "SEK", symbol: "kr", label: "Swedish Krona", rateFromUSD: 10.4 },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar", rateFromUSD: 1.64 },
  { code: "ZAR", symbol: "R", label: "South African Rand", rateFromUSD: 18.3 },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", rateFromUSD: 5.15 },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", rateFromUSD: 17.0 },
  { code: "ARS", symbol: "AR$", label: "Argentine Peso", rateFromUSD: 900 },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira", rateFromUSD: 1550 },
  { code: "EGP", symbol: "E£", label: "Egyptian Pound", rateFromUSD: 48.5 },
  { code: "SAR", symbol: "SAR", label: "Saudi Riyal", rateFromUSD: 3.75 },
  { code: "TRY", symbol: "₺", label: "Turkish Lira", rateFromUSD: 32.5 },
  { code: "RUB", symbol: "₽", label: "Russian Ruble", rateFromUSD: 92 },
  { code: "PLN", symbol: "zł", label: "Polish Złoty", rateFromUSD: 3.95 },
  { code: "PKR", symbol: "Rs", label: "Pakistani Rupee", rateFromUSD: 278 },
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka", rateFromUSD: 118 },
  { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah", rateFromUSD: 15750 },
  { code: "PHP", symbol: "₱", label: "Philippine Peso", rateFromUSD: 56.5 },
  { code: "VND", symbol: "₫", label: "Vietnamese Dong", rateFromUSD: 24500 },
  { code: "KRW", symbol: "₩", label: "South Korean Won", rateFromUSD: 1330 },
  { code: "THB", symbol: "฿", label: "Thai Baht", rateFromUSD: 35.8 },
];

/** Converts a tier's price into the given currency. USD/INR/EUR return the
 * exact business-set price; every other currency is an approximation. */
export function priceInCurrency(
  tier: Pick<PricingTierDoc, "priceUSD" | "priceINR" | "priceEUR">,
  currencyCode: string
): { amount: number; isExact: boolean } {
  if (currencyCode === "USD") return { amount: tier.priceUSD, isExact: true };
  if (currencyCode === "INR") return { amount: tier.priceINR, isExact: true };
  if (currencyCode === "EUR") return { amount: tier.priceEUR, isExact: true };

  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const rate = currency?.rateFromUSD ?? 1;
  return { amount: Math.round(tier.priceUSD * rate), isExact: false };
}

const PRICING_COLLECTION = "pricingTiers";

/**
 * Static copy of scripts/seed-content.mjs's `pricingTiers` array — the
 * same content Firestore gets seeded with. Used only when the live read
 * fails or the collection comes back empty (e.g. Firestore rules
 * misconfigured, offline, or not seeded yet), so the pricing page never
 * renders blank just because the CMS is unreachable.
 */
const FALLBACK_PRICING_TIERS: PricingTier[] = [
  {
    id: "fallback-basic",
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
    id: "fallback-standard",
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
    id: "fallback-premium",
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
    id: "fallback-enterprise",
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
    id: "fallback-cluster",
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
    id: "fallback-custom",
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

/**
 * Public frontend — fail-soft, same rationale as lib/services-content.ts
 * and lib/blog.ts. createCollectionCrud().list() already swallows read
 * errors and resolves to [], so both a misconfigured/unreachable
 * Firestore and a genuinely empty collection land here as an empty
 * array — either way, fall back to FALLBACK_PRICING_TIERS.
 */
export async function listPricingTiers(): Promise<PricingTier[]> {
  const tiers = await createCollectionCrud<PricingTierDoc>(PRICING_COLLECTION).list();
  return tiers.length > 0 ? tiers : FALLBACK_PRICING_TIERS;
}

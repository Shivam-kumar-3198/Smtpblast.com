/// <reference types="react/canary" />
import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { estimateReadMinutes } from "./blog-content";
import {
  FALLBACK_POSTS,
  POSTS_COLLECTION,
  postFromSnapshot,
  type PostRecord,
} from "./blog";
import { FALLBACK_PRICING_TIERS, type PricingTier } from "./pricing-content";
import { FALLBACK_SERVICES, serviceFromDoc, type ServiceRecord } from "./services-content";
import {
  EMPTY_SITE_SETTINGS_DOC,
  toSiteSettings,
  type SiteSettingsDoc,
} from "./site-settings-content";
import { DEFAULT_SOLUTIONS_SETTINGS, type SolutionsSettingsDoc } from "./solutions-content";
import type { SiteSettings } from "@/content/types";

/**
 * Server-only, cached readers for every PUBLIC Firestore read.
 *
 * Why this exists: the public pages used to hit Firestore on every ISR
 * regeneration from many components at once (the homepage alone read
 * siteSettings 5x and services 2x), and the Nav/Pricing client components
 * opened a live listener per visitor. Everything public now goes through
 * here:
 *
 *   React cache()            -> one lookup per request (generateMetadata,
 *                               the page and nested components share it)
 *   unstable_cache (300s)    -> one Firestore read per collection per
 *                               window per instance, shared across pages
 *
 * Error handling contract:
 *   - The cached functions are STRICT: they throw on any Firestore error,
 *     and unstable_cache never stores a thrown error, so a failure can
 *     never be cached as an empty result.
 *   - At runtime the error propagates. For ISR that means the last good
 *     page keeps serving and regeneration is retried on the next request.
 *   - Only during `next build` do we fall back to empty/seed data, so a
 *     flaky build can't block a deploy. That catch sits OUTSIDE the cached
 *     function so the fallback is never written to the data cache.
 *
 * Admin screens keep their own live reads (lib/collection-crud.ts etc.).
 */

const REVALIDATE_SECONDS = 300;

/** Plain-collection content ordered by the admin-controlled `order` field. */
export type OrderedCollection =
  | "faqItems"
  | "pricingTiers"
  | "testimonials"
  | "bentoFeatures"
  | "howItWorksSteps";

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}

/** Runtime: rethrow. Build only: log and use the fallback. */
async function orBuildFallback<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (err) {
    if (isProductionBuild()) {
      console.error(`[public-data] ${label} failed during build, using fallback:`, err);
      return fallback;
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Strict Firestore helpers (throw on error, never swallow)           */
/* ------------------------------------------------------------------ */

async function strictOrderedList(name: string): Promise<(Record<string, unknown> & { id: string })[]> {
  const snap = await getDocs(query(collection(db, name), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function strictDoc(path: string): Promise<Record<string, unknown> | null> {
  const [col, id] = path.split("/");
  const snap = await getDoc(doc(db, col, id));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

/* ------------------------------------------------------------------ */
/*  Cached strict readers (tag per collection)                         */
/* ------------------------------------------------------------------ */

function cachedOrderedList(name: OrderedCollection) {
  return unstable_cache(() => strictOrderedList(name), ["public-data", "list", name], {
    revalidate: REVALIDATE_SECONDS,
    tags: [name],
  });
}

const orderedListReaders: Record<OrderedCollection, ReturnType<typeof cachedOrderedList>> = {
  faqItems: cachedOrderedList("faqItems"),
  pricingTiers: cachedOrderedList("pricingTiers"),
  testimonials: cachedOrderedList("testimonials"),
  bentoFeatures: cachedOrderedList("bentoFeatures"),
  howItWorksSteps: cachedOrderedList("howItWorksSteps"),
};

const cachedSiteSettingsRaw = unstable_cache(() => strictDoc("siteSettings/main"), ["public-data", "doc", "siteSettings"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["siteSettings"],
});

const cachedSolutionsRaw = unstable_cache(
  () => strictDoc("solutionsSettings/main"),
  ["public-data", "doc", "solutionsSettings"],
  { revalidate: REVALIDATE_SECONDS, tags: ["solutionsSettings"] }
);

/** Live services only (possibly empty) — fallback seed data is applied outside the cache. */
const cachedServices = unstable_cache(
  async (): Promise<ServiceRecord[]> => {
    const snap = await getDocs(query(collection(db, "services"), orderBy("order")));
    return snap.docs.map((d) => serviceFromDoc(d.id, d.data()));
  },
  ["public-data", "list", "services"],
  { revalidate: REVALIDATE_SECONDS, tags: ["services"] }
);

/* ---- posts ---- */

/**
 * What the blog list, "more posts" and sitemap need — deliberately WITHOUT
 * the Tiptap body, links and FAQ, which are the heavy fields. The reading
 * time is precomputed from the body before it is dropped.
 */
export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  author: string;
  seo: PostRecord["seo"];
  featuredImage: PostRecord["featuredImage"];
  publishedAt: Date | null;
  readingMinutes: number;
}

/** unstable_cache stores JSON, so Dates cross the cache boundary as ISO strings. */
type PostSummaryWire = Omit<PostSummary, "publishedAt"> & { publishedAt: string | null };
type PostWire = Omit<PostRecord, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const fromIso = (s: string | null) => (s ? new Date(s) : null);

function summarize(p: PostRecord): PostSummaryWire {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    author: p.author,
    seo: p.seo,
    featuredImage: p.featuredImage,
    publishedAt: iso(p.publishedAt),
    readingMinutes: estimateReadMinutes(p.content),
  };
}

function reviveSummary(w: PostSummaryWire): PostSummary {
  return { ...w, publishedAt: fromIso(w.publishedAt) };
}

function postToWire(p: PostRecord): PostWire {
  return {
    ...p,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
    publishedAt: iso(p.publishedAt),
  };
}

function postFromWire(w: PostWire): PostRecord {
  return {
    ...w,
    createdAt: fromIso(w.createdAt),
    updatedAt: fromIso(w.updatedAt),
    publishedAt: fromIso(w.publishedAt),
  };
}

const cachedPublishedPostSummaries = unstable_cache(
  async (): Promise<PostSummaryWire[]> => {
    const snap = await getDocs(
      query(
        collection(db, POSTS_COLLECTION),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc")
      )
    );
    return snap.docs.map((d) => summarize(postFromSnapshot(d.id, d.data())));
  },
  ["public-data", "list", "posts-summary"],
  { revalidate: REVALIDATE_SECONDS, tags: ["posts"] }
);

const cachedPublishedPostBySlug = unstable_cache(
  async (slug: string): Promise<PostWire | null> => {
    // Fast path: resolve the real document ID from the cached post list
    // (0 extra reads) and fetch by ID — a single-document get, no query.
    // Documents here use auto-generated IDs, so the slug can't be used as
    // the ID directly; and a getDoc on a missing or unpublished ID is
    // *denied* by firestore.rules (resource.data is null), not "not found",
    // which is why a blind slug-as-ID attempt is not safe.
    const known = (await cachedPublishedPostSummaries()).find((p) => p.slug === slug);
    if (known) {
      try {
        const snap = await getDoc(doc(db, POSTS_COLLECTION, known.id));
        if (snap.exists()) {
          const data = snap.data();
          if (data.slug === slug && data.status === "published") {
            return postToWire(postFromSnapshot(snap.id, data));
          }
        }
      } catch (err) {
        // Unpublished since the list was cached: rules deny the get. Fall
        // through to the query, which resolves it to "not found". Anything
        // else is a real failure and must propagate (never cached).
        if ((err as { code?: string })?.code !== "permission-denied") throw err;
      }
    }
    // Fallback: a post newer than the cached list (or an unknown slug).
    const snap = await getDocs(
      query(
        collection(db, POSTS_COLLECTION),
        where("slug", "==", slug),
        where("status", "==", "published"),
        limit(1)
      )
    );
    if (snap.empty) return null;
    return postToWire(postFromSnapshot(snap.docs[0].id, snap.docs[0].data()));
  },
  ["public-data", "post-by-slug"],
  { revalidate: REVALIDATE_SECONDS, tags: ["posts"] }
);

/* ------------------------------------------------------------------ */
/*  Public API (each wrapped in React cache() = once per request)      */
/* ------------------------------------------------------------------ */

const readOrderedCollection = cache(async (name: OrderedCollection) =>
  orBuildFallback(name, () => orderedListReaders[name](), [])
);

/** Ordered list for a plain content collection. Throws at runtime on failure. */
export async function getOrderedCollection<T extends object>(
  name: OrderedCollection
): Promise<(T & { id: string })[]> {
  return (await readOrderedCollection(name)) as unknown as (T & { id: string })[];
}

/** Pricing tiers, falling back to the seed tiers when the collection is empty (as before). */
export const getPricingTiers = cache(async (): Promise<PricingTier[]> => {
  const tiers = await getOrderedCollection<PricingTier>("pricingTiers");
  return tiers.length > 0 ? tiers : FALLBACK_PRICING_TIERS;
});

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const raw = await orBuildFallback("siteSettings", () => cachedSiteSettingsRaw(), null);
  const merged: SiteSettingsDoc = { ...EMPTY_SITE_SETTINGS_DOC, ...(raw as Partial<SiteSettingsDoc> | null) };
  return toSiteSettings(merged);
});

export const getSolutionsSettings = cache(async (): Promise<SolutionsSettingsDoc> => {
  const raw = await orBuildFallback("solutionsSettings", () => cachedSolutionsRaw(), null);
  return { ...DEFAULT_SOLUTIONS_SETTINGS, ...(raw as Partial<SolutionsSettingsDoc> | null) };
});

/** Seed services when the live collection is empty, same as before. */
export const getServices = cache(async (): Promise<ServiceRecord[]> => {
  const live = await orBuildFallback("services", () => cachedServices(), FALLBACK_SERVICES);
  return live.length > 0 ? live : FALLBACK_SERVICES;
});

/**
 * Looked up in the already-cached services list instead of a per-slug query:
 * the list is needed by Nav/Footer/overview anyway, so this costs 0 extra reads.
 */
export const getServiceBySlug = cache(async (slug: string): Promise<ServiceRecord | null> => {
  const services = await getServices();
  return (
    services.find((s) => s.slug === slug) ?? FALLBACK_SERVICES.find((s) => s.slug === slug) ?? null
  );
});

/** Published posts (live + seed fallbacks, newest first) WITHOUT bodies. */
export const getPublishedPostSummaries = cache(async (): Promise<PostSummary[]> => {
  const fallbackSummaries = FALLBACK_POSTS.map(summarize);
  const live = await orBuildFallback("posts", () => cachedPublishedPostSummaries(), fallbackSummaries);
  // Live posts override seed posts with the same ID, matching the previous behavior.
  const byId = new Map(fallbackSummaries.map((p) => [p.id, p]));
  live.forEach((p) => byId.set(p.id, p));
  return Array.from(byId.values())
    .map(reviveSummary)
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
});

/** One full published post (with body) for the post page and its metadata. */
export const getPublishedPostBySlug = cache(async (slug: string): Promise<PostRecord | null> => {
  const live = await orBuildFallback("post", () => cachedPublishedPostBySlug(slug), null);
  if (live) return postFromWire(live);
  return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
});

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { sanitizeLinks, type TiptapDoc, type TiptapNode } from "./blog-content";
import type { BlogDraftInput } from "./blog-schema";

export type PostStatus = "draft" | "published";

export interface PostLink {
  text: string;
  url: string;
  nofollow: boolean;
}

export interface PostFaqItem {
  question: string;
  answer: string;
}

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  content: TiptapDoc;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string[];
    canonicalUrl: string;
  };
  featuredImage: {
    url: string;
    width: number;
    height: number;
    altText: string;
  };
  links: PostLink[];
  faq: PostFaqItem[];
  status: PostStatus;
  author: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}

const POSTS_COLLECTION = "posts";

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function fromSnapshot(id: string, data: Record<string, unknown>): PostRecord {
  const seoData = (data.seo as Record<string, unknown>) || {};
  const imgData = (data.featuredImage as Record<string, unknown>) || {};

  return {
    id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    content: (data.content as TiptapDoc) ?? { type: "doc", content: [] },
    seo: {
      metaTitle: String(seoData.metaTitle ?? ""),
      metaDescription: String(seoData.metaDescription ?? ""),
      focusKeywords: Array.isArray(seoData.focusKeywords)
        ? (seoData.focusKeywords as string[])
        : [],
      canonicalUrl: String(seoData.canonicalUrl ?? ""),
    },
    featuredImage: {
      url: String(imgData.url ?? ""),
      width: Number(imgData.width ?? 0),
      height: Number(imgData.height ?? 0),
      altText: String(imgData.altText ?? ""),
    },
    links: Array.isArray(data.links) ? (data.links as PostLink[]) : [],
    faq: Array.isArray(data.faq) ? (data.faq as PostFaqItem[]) : [],
    status: (data.status as PostStatus) ?? "draft",
    author: String(data.author ?? ""),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    publishedAt: toDate(data.publishedAt),
  };
}

function para(text: string): TiptapNode {
  return { type: "paragraph", content: [{ type: "text", text }] };
}
function heading(text: string): TiptapNode {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] };
}
function tiptapDoc(...blocks: TiptapNode[]): TiptapDoc {
  return { type: "doc", content: blocks };
}

const FALLBACK_AUTHOR = "SMTPblast Team";

const FALLBACK_POSTS: PostRecord[] = [
  {
    id: "fallback-spf-dkim-dmarc-explained",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
    publishedAt: new Date("2026-01-05"),
  },
  {
    id: "fallback-why-new-ips-get-throttled",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-08"),
    updatedAt: new Date("2026-01-08"),
    publishedAt: new Date("2026-01-08"),
  },
  {
    id: "fallback-dedicated-vs-shared-ip",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-01-12"),
    publishedAt: new Date("2026-01-12"),
  },
  {
    id: "fallback-reading-inbox-placement-data",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    publishedAt: new Date("2026-01-15"),
  },
  {
    id: "fallback-bulk-campaigns-without-tripping-filters",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-19"),
    updatedAt: new Date("2026-01-19"),
    publishedAt: new Date("2026-01-19"),
  },
  {
    id: "fallback-running-white-label-smtp",
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
    content: tiptapDoc(
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
    links: [],
    faq: [],
    status: "published",
    author: FALLBACK_AUTHOR,
    createdAt: new Date("2026-01-22"),
    updatedAt: new Date("2026-01-22"),
    publishedAt: new Date("2026-01-22"),
  },
];

function toFirestorePayload(input: BlogDraftInput) {
  return {
    title: input.title,
    slug: input.slug,
    content: sanitizeLinks(input.content as unknown as TiptapDoc),
    seo: input.seo,
    featuredImage: input.featuredImage,
    links: input.links,
    faq: input.faq,
    status: input.status,
    author: input.author,
  };
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db, POSTS_COLLECTION), where("slug", "==", slug), limit(2));
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== excludeId);
}

export async function createPost(input: BlogDraftInput): Promise<string> {
  const now = serverTimestamp();
  const isPublished = input.status === "published";

  const ref = await addDoc(collection(db, POSTS_COLLECTION), {
    ...toFirestorePayload(input),
    createdAt: now,
    updatedAt: now,
    // Guarantee that published posts get an immediate timestamp for ordering
    publishedAt: isPublished ? now : null,
  });
  return ref.id;
}

export async function updatePost(
  id: string,
  input: BlogDraftInput,
  wasPublished: boolean
): Promise<void> {
  const isNowPublished = input.status === "published";
  const justPublished = isNowPublished && !wasPublished;

  const updatePayload: Record<string, unknown> = {
    ...toFirestorePayload(input),
    updatedAt: serverTimestamp(),
  };

  // Precisely handle transitions so sorting timestamps remain intact
  if (justPublished) {
    updatePayload.publishedAt = serverTimestamp();
  } else if (!isNowPublished) {
    // Reverting to draft must strip the timestamp so it drops out of public lists
    updatePayload.publishedAt = null;
  }

  await setDoc(doc(db, POSTS_COLLECTION, id), updatePayload, { merge: true });
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return fromSnapshot(snap.id, snap.data());
}

export async function getPublishedPostBySlug(slug: string): Promise<PostRecord | null> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      console.warn(`[Firestore Info] No published post found for slug "${slug}". Returning fallback content.`);
      return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
    }
    return fromSnapshot(snap.docs[0].id, snap.docs[0].data());
  } catch (err) {
    console.error("[Firestore Error] getPublishedPostBySlug failed:", err);
    return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function listPublishedPosts(): Promise<PostRecord[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc")
    );
    const snap = await getDocs(q);
    const firebasePosts = snap.docs.map((d) => fromSnapshot(d.id, d.data()));
    
    if (snap.empty) {
      console.warn("[Firestore Info] No published posts found. Returning combined list with fallbacks.");
    }

    // Combine Firebase posts with fallback posts, ensuring no duplicates.
    // The Map constructor ensures that any post from Firebase with the same ID as a fallback post will overwrite the fallback version.
    const postMap = new Map(FALLBACK_POSTS.map((p) => [p.id, p]));
    firebasePosts.forEach((p) => postMap.set(p.id, p));
    const allPosts = Array.from(postMap.values());

    // Sort all posts by publication date, newest first.
    return allPosts.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  } catch (err) {
    console.error(
      "[Firestore Error] listPublishedPosts failed. If this mentions a missing index, click the generated link in your browser console to create it automatically:",
      err
    );
    return FALLBACK_POSTS;
  }
}

export function subscribeToAllPosts(
  onData: (posts: PostRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, POSTS_COLLECTION), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => fromSnapshot(d.id, d.data()))),
    (err) => {
      console.error("[Firestore Subscription Error]:", err);
      if (onError) onError(err);
    }
  );
}
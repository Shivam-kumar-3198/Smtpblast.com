# SMTPblast marketing site

Next.js 16 (App Router, React Server Components, TypeScript strict) marketing
site for SMTPblast, with a full Firebase-backed CMS + admin panel at
`/admin` — leads, blog (rich-text editor with enforced SEO), pricing,
testimonials, FAQ, features, how-it-works steps, services/solutions pages,
and site settings are all admin-editable, backed by Firestore + Firebase
Auth. See "Admin panel setup" below for the one-time Firebase console steps
required before any of it works.

## Stack

- Next.js 16 / React 19, Tailwind CSS v4 (CSS-based `@theme` tokens in
  [app/globals.css](app/globals.css) — no `tailwind.config.ts`)
- Firebase: Firestore (content + leads), Firebase Auth (admin sign-in),
  Firebase Storage (blog/service images), Firebase Analytics
- TipTap for the blog rich-text editor
- Framer Motion for the hero pipeline animation and scroll reveals
- Lucide React for icons

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type check
```

Copy `.env.example` to `.env.local` and fill in the Firebase values from
Firebase console > Project settings > Your apps (see
[lib/firebase.ts](lib/firebase.ts)). These are client-side config, not
secrets — access is governed by Firebase Security Rules, not by keeping
`NEXT_PUBLIC_FIREBASE_*` hidden. The site *renders* without them, but every
content section and lead form fails soft to empty/uninitialized — see
"Admin panel setup" for the console steps that make it actually work.

## Routes

| Route | Purpose |
|---|---|
| `/` | The marketing homepage — every section (hero trust line, bento features, how-it-works, testimonials, pricing, FAQ) reads from Firestore |
| `/get-started`, `/talk-to-sales` | Lead capture form (`components/marketing/LeadForm.tsx`), writes to Firestore |
| `/services/[slug]` | Firestore-backed service/solution pages, dynamically generated per document in the `services` collection |
| `/company` | Short about page |
| `/blog`, `/blog/[slug]` | Firestore-backed blog — see "Blog CMS" below |
| `/legal/privacy`, `/legal/terms`, `/legal/anti-spam-policy` | Generic, mechanism-based policy pages (see caveat below) |
| `/admin` | Leads dashboard — Firebase Auth-gated, `noindex` |
| `/admin/login` | Admin sign-in |
| `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]/edit` | Blog post list/create/edit |
| `/admin/pricing`, `/admin/testimonials`, `/admin/faq`, `/admin/features`, `/admin/how-it-works`, `/admin/services` | Content CRUD for each collection |
| `/admin/settings` | Site settings (contact info, social links, trust stat) |

### Lead capture: Firestore, client-side writes

Every lead source — `LeadForm` (`/get-started`, `/talk-to-sales`) and the
site-wide `LeadPopup` (fires 20s after load, and again 20s after each close,
until someone submits or already has) — writes straight to Firestore via
[lib/leads.ts](lib/leads.ts)'s `submitLead()`, validated with Zod
([lib/lead-schema.ts](lib/lead-schema.ts)), plus a honeypot field. Firestore
Security Rules ([firestore.rules](firestore.rules)) are the actual
enforcement boundary: anyone can *create* a lead document (shape/size/status
validated server-side by the rules), but only signed-in admins can read,
update, or delete one.

That trade-off is worth naming: this design has no IP-based rate limiting,
just a 30-second per-browser cooldown (trivially bypassable). If spam
becomes a real problem, the next step is Firebase App Check — the
data-privacy boundary (who can *read* leads) is unaffected either way, since
that's enforced by the rules regardless of how a write arrived.

## Blog CMS

`/admin/blog/new` and `/admin/blog/[id]/edit` — a two-column editor:

- **Left: TipTap rich-text editor** ([components/admin/TiptapEditor.tsx](components/admin/TiptapEditor.tsx)),
  storing structured JSON (ProseMirror doc), not raw HTML. H1 is removed
  from the toolbar entirely — the post title is the page's only `<h1>`.
  Inline images require alt text before they can be inserted, uploaded to
  Firebase Storage.
- **Right: SEO panel** — real-time character counters for meta title
  (40–60) and meta description (130–160) with red/amber/green states, a
  featured-image uploader that blocks publish without alt text, and a
  **Publish** button disabled until the strict Zod schema
  ([lib/blog-schema.ts](lib/blog-schema.ts)) passes. **Save draft** has no
  such gate — only title, slug, and content are required, so a post can be
  saved mid-write.

On save, [lib/blog-content.tsx](lib/blog-content.tsx)'s `sanitizeLinks()`
appends `target="_blank" rel="noopener noreferrer"` to external links and
rewrites internal (smtpblast.com) links to relative paths, before the
document is persisted.

The public `/blog/[slug]` page ([app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx)):
generates dynamic metadata (title/description/canonical/OpenGraph/Twitter)
from the saved SEO fields, injects a `BlogPosting` JSON-LD script
(headline, dates, author, image dimensions, publisher logo — see
`blogPostingJsonLd` in [lib/schema.ts](lib/schema.ts)), auto-builds a table
of contents from H2/H3 headings with generated anchor ids
(`buildToc` in lib/blog-content.tsx), and renders every image — featured and
inline — through `next/image` with explicit width/height for zero CLS.

## Admin panel setup

None of this is automatable from the repo — it requires access to *your*
Firebase project:

1. **Enable Email/Password sign-in** — Firebase console > Authentication >
   Sign-in method > enable "Email/Password".
2. **Create your admin user** — Authentication > Users > Add user (your email
   + a password). Copy the generated UID.
3. **Add that UID to the admin allowlist** — Firestore Database > Start
   collection `admins` > create a document with **Document ID = that UID**
   (any field inside it, e.g. `role: "admin"`, is fine — the rules only check
   that the document exists).
4. **Deploy the security rules** — paste the contents of
   [firestore.rules](firestore.rules) into Firestore Database > Rules, and
   [storage.rules](storage.rules) into Storage > Rules, in the console (or
   `firebase deploy --only firestore:rules,storage` with the CLI;
   [firebase.json](firebase.json) is already wired for both). Nothing will
   load correctly until this is done — before rules are deployed, whatever
   default rules the project has apply instead, and every read/write fails
   with `permission-denied`.
5. **Enable Firestore Database and Storage** in the console if you haven't
   already (Build > Firestore Database > Create database; Build > Storage >
   Get started).

After that, sign in at `/admin/login` with the account from step 2.

### Seeding the original content

The copy that used to live in `content/*.ts` (pricing tiers, testimonials,
FAQ, features, how-it-works steps, and the 5 service pages) now lives in
Firestore, which starts **empty** — those sections of the live site will be
blank until it's populated. Rather than requiring it be retyped by hand
through the admin forms, run:

```bash
node scripts/seed-content.mjs <admin-email> <admin-password>
```

This signs in as your admin user and writes the original content into each
collection — but only if that collection is still empty, so it's safe to
re-run and won't clobber anything an admin has since edited. It does **not**
seed blog posts or site settings (contact info, social links, trust stat) —
those have no prior CMS-shaped source data, so add them directly at
`/admin/blog` and `/admin/settings`.

### Legal pages need a real review

`/legal/privacy`, `/legal/terms`, and `/legal/anti-spam-policy` are genuinely
useful, non-placeholder pages — every claim in them describes what this
codebase actually does today. They deliberately avoid anything requiring
business/legal authority I don't have — no named jurisdiction, no claimed
compliance certifications (GDPR/CCPA), no specific data-retention window, no
named DPO. **Have an actual lawyer review these before they carry real legal
weight** — that caveat is for you, not on the page itself.

## Content model

Two kinds of content now:

**Code-level (still in `content/*.ts`)** — things tied to infrastructure or
that rarely change and don't need an admin form:

| File | Drives |
|---|---|
| `content/site-settings.ts` | just `domain` — DNS/hosting, not editable content |
| `content/proof-strip.ts` | shared vs. dedicated IP comparison table |
| `content/nav.ts` | nav links and the Solutions dropdown |
| `content/types.ts` | shared TS interfaces (`SiteSettings`, nav types, etc.) |

**Firestore-backed (admin-editable at `/admin/*`)** — everything else:
blog posts (`posts`), pricing tiers (`pricingTiers`), testimonials
(`testimonials`), FAQ (`faqItems`), bento features (`bentoFeatures`),
how-it-works steps (`howItWorksSteps`), services/solutions pages
(`services`), and site settings (`siteSettings/main`). Each has a
`lib/*.ts` read/write module — `lib/blog.ts`, `lib/collection-crud.ts`
(the shared factory used by pricing/testimonials/FAQ/features/how-it-works),
`lib/services-content.ts`, `lib/site-settings-content.ts` — and every public
page reads live via those modules rather than importing static data.

All Firestore reads on public pages fail soft (empty array / `null` /
section renders nothing) rather than throwing, so a misconfigured project or
a transient Firestore hiccup degrades the page instead of crashing it — see
the `try/catch` in each `list*`/`get*` function.

**Client logos and review-aggregate ratings** don't have a CMS module yet
(the live site has neither to show) — `SocialProof.tsx` keeps an empty
static `clientLogos` array, and `getSiteSettings()` always returns
`reviewAggregate: null`. Both are straightforward follow-ups if real data
shows up, using the same `collection-crud`/flattened-doc pattern as
everything else here.

**Payment logos were intentionally omitted** from the footer — showing
specific payment-processor marks without confirming which processors are
actually integrated would itself be a placeholder/false claim.

## The signature hero element

`components/marketing/PipelineDashboard.tsx` is a from-scratch React/SVG/
Framer Motion component (no images) showing chips travelling through SPF →
DKIM → DMARC checkpoints into an "Inbox" node, plus a circular gauge that
settles at 99.1% and a fluctuating sends/min counter. It renders a fully
static end-state (all checks filled, gauge at 99.1%, one chip resting in
Inbox) when `prefers-reduced-motion` is set, and the numeric readouts are
never blank or zero — see `useReducedMotion` usage in that file.

## SEO / schema

- Metadata, OpenGraph, and Twitter cards are set in [app/layout.tsx](app/layout.tsx)
  and, per blog post, in `generateMetadata` in `app/blog/[slug]/page.tsx`.
- `app/sitemap.ts` and `app/robots.ts` are wired, and the sitemap pulls
  published blog posts and services live from Firestore.
- JSON-LD: Organization + SoftwareApplication in the root layout (built from
  live site settings + pricing), FAQPage on the homepage and each service
  page, BlogPosting on each post — all built from `lib/schema.ts`.
  LocalBusiness/AggregateRating are omitted until office address / review
  aggregate data exists (see "Content model" above).
- An `/og-image.png` file needs to be generated and dropped in `public/` —
  it's referenced in metadata but not yet created.

## Security model summary

- **Public content** (posts, pricing, testimonials, FAQ, features,
  how-it-works, services, site settings): anyone can *read*; only
  authenticated admins (checked against the `admins/{uid}` allowlist) can
  *write*. Draft blog posts are the one exception — `allow read: if
  resource.data.status == 'published' || isAdmin()`.
- **Leads**: the inverse — anyone can *create*; only admins can read,
  update, or delete.
- **Admin allowlist** (`admins/{uid}`): a user can read their own doc (so
  the client can check "am I an admin"), but `allow write: if false`
  unconditionally — no client, including a signed-in admin, can grant
  access through the app's own code path. It's managed by hand in the
  Firebase console only.
- **Storage** (`uploads/**`): public read, admin-only write, capped at 5MB
  and image content-types only, cross-referencing the same `admins/{uid}`
  allowlist via Storage Rules v2's `firestore.exists()`.

Full rules: [firestore.rules](firestore.rules), [storage.rules](storage.rules).

## What's not built yet

The original brief's Auth.js + Prisma + SQLite admin stack was replaced
end-to-end with Firebase (Firestore/Auth/Storage) per a later request — this
is a deliberate architecture change, not a partial migration. Not built:

- **Client logos and review-aggregate ratings** (no CMS module — see
  "Content model").
- **`/og-image.png`** generation.
- **Stronger anti-spam** (Firebase App Check) for the public lead-write path.
- Per-service FAQ curation was simplified: service pages show the first 4
  site-wide FAQ items rather than a hand-picked subset per service, since
  Firestore's auto-generated doc ids don't support the old stable-string-id
  cross-referencing content/services.ts used to do.

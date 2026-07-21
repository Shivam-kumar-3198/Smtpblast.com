#!/usr/bin/env node
/**
 * Adds the placeholder "worldwide" testimonials to Firestore even though
 * the `testimonials` collection already has documents in it (Susan,
 * Nikita Singh) — scripts/seed-content.mjs skips any collection that
 * isn't empty, which is why those new entries never showed up on the
 * live site. This script is additive and safe to re-run: it skips any
 * entry whose `quote` already exists in the collection, so re-running it
 * won't create duplicates.
 *
 * The added entries use "[Customer name]" / "[Company]" placeholders —
 * replace them with real quotes via /admin/testimonials before relying
 * on them. Publishing invented reviews as genuine is against FTC
 * endorsement guidelines (and EU/UK/India equivalents).
 *
 * Usage:
 *   node scripts/add-testimonials.mjs <admin-email> <admin-password>
 *
 * Requires .env.local to be filled in (NEXT_PUBLIC_FIREBASE_*), and that
 * admin user's UID already added to the admins collection.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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
  console.error("Usage: node scripts/add-testimonials.mjs <admin-email> <admin-password>");
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

const newTestimonials = [
  {
    name: "[Customer name]",
    role: "Email Marketing Lead",
    company: "[Company]",
    quote: "[Replace with a real quote about a specific outcome — deliverability, warmup, support.]",
    metric: "",
    date: "",
    source: "G2",
    country: "🇩🇪 Germany",
  },
  {
    name: "[Customer name]",
    role: "Founder",
    company: "[Company]",
    quote: "[Replace with a real quote — short ones work well here.]",
    metric: "",
    date: "",
    source: "X",
    country: "🇮🇳 India",
  },
  {
    name: "[Customer name]",
    role: "CRM Manager",
    company: "[Company]",
    quote: "[Replace with a real quote.]",
    metric: "",
    date: "",
    source: "G2",
    country: "🇧🇷 Brazil",
  },
  {
    name: "[Customer name]",
    role: "Deliverability Consultant",
    company: "[Company]",
    quote: "[Replace with a real quote.]",
    metric: "",
    date: "",
    source: "LinkedIn",
    country: "🇬🇧 United Kingdom",
  },
  {
    name: "[Customer name]",
    role: "Lifecycle Marketer",
    company: "[Company]",
    quote: "[Replace with a real quote.]",
    metric: "",
    date: "",
    source: "Trustpilot",
    country: "🇦🇺 Australia",
  },
  {
    name: "[Customer name]",
    role: "Agency Owner",
    company: "[Company]",
    quote: "[Replace with a real quote.]",
    metric: "",
    date: "",
    source: "Clutch",
    country: "🇳🇬 Nigeria",
  },
  {
    name: "[Customer name]",
    role: "Demand Gen Manager",
    company: "[Company]",
    quote: "[Replace with a real quote.]",
    metric: "",
    date: "",
    source: "X",
    country: "🇨🇦 Canada",
  },
];

async function main() {
  console.log(`Signing in as ${email}...`);
  await signInWithEmailAndPassword(auth, email, password);

  const col = collection(db, "testimonials");
  const existing = await getDocs(col);
  const existingQuotes = new Set(existing.docs.map((d) => d.data().quote));
  const maxOrder = existing.docs.reduce(
    (max, d) => Math.max(max, typeof d.data().order === "number" ? d.data().order : -1),
    -1
  );

  let added = 0;
  for (const doc of newTestimonials) {
    if (existingQuotes.has(doc.quote)) {
      console.log(`  skip (already present): ${doc.quote.slice(0, 40)}...`);
      continue;
    }
    await addDoc(col, { ...doc, order: maxOrder + 1 + added });
    added++;
  }

  console.log(`\nDone. Added ${added} of ${newTestimonials.length} testimonials.`);
  console.log(
    "These use [Customer name] / [Company] placeholders — replace with real quotes at /admin/testimonials before launch."
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFailed:", err.message ?? err);
  process.exit(1);
});

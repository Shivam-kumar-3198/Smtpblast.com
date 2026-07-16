import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { leadSchema, type LeadInput } from "./lead-schema";

export type LeadStatus = "new" | "contacted" | "closed";

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  planInterest?: string;
  message?: string;
  source: string;
  status: LeadStatus;
  createdAt: Date | null;
}

const LEADS_COLLECTION = "leads";
const SUBMIT_COOLDOWN_MS = 30_000;
const LAST_SUBMIT_KEY = "smtpblast_last_lead_submit";

type SubmitResult = { ok: true } | { ok: false; error: string };

function isRateLimited(): boolean {
  if (typeof window === "undefined") return false;
  const last = Number(window.localStorage.getItem(LAST_SUBMIT_KEY) ?? 0);
  return Date.now() - last < SUBMIT_COOLDOWN_MS;
}

function markSubmitted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
}

/**
 * Client-side lead submission — writes directly to Firestore rather than
 * through a server route. Firestore Security Rules (see firestore.rules)
 * are the real enforcement boundary: they validate shape/size/status
 * server-side regardless of what this function does, so a bad actor
 * bypassing the app entirely still can't write malformed data. This
 * function's job is UX (Zod error messages, honeypot, a soft per-browser
 * cooldown against accidental double-submits) — not the security boundary.
 */
export async function submitLead(input: LeadInput): Promise<SubmitResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Honeypot tripped: report success without persisting anything.
  if (parsed.data.company_website) {
    return { ok: true };
  }

  if (isRateLimited()) {
    return { ok: false, error: "Please wait a moment before submitting again." };
  }

  const { name, email, phone, company, planInterest, message, source } = parsed.data;

  try {
    await addDoc(collection(db, LEADS_COLLECTION), {
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(company ? { company } : {}),
      ...(planInterest ? { planInterest } : {}),
      ...(message ? { message } : {}),
      source,
      status: "new" as const,
      createdAt: serverTimestamp(),
    });
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }

  markSubmitted();
  return { ok: true };
}

/**
 * Live-subscribes the admin dashboard to the leads collection. Only
 * resolves for authenticated admins — Firestore Security Rules reject the
 * read otherwise, and onSnapshot's error callback fires in that case.
 */
export function subscribeToLeads(
  onData: (leads: LeadRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, LEADS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const leads = snapshot.docs.map((docSnap): LeadRecord => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          company: data.company || undefined,
          planInterest: data.planInterest || undefined,
          message: data.message || undefined,
          source: data.source,
          status: (data.status as LeadStatus) ?? "new",
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        };
      });
      onData(leads);
    },
    onError
  );
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  return updateDoc(doc(db, LEADS_COLLECTION, id), { status });
}

export function deleteLead(id: string) {
  return deleteDoc(doc(db, LEADS_COLLECTION, id));
}

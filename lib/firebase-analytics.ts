import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { firebaseApp } from "./firebase";

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Analytics needs the browser (IndexedDB, cookies) and isn't available in
 * every environment (SSR, some browsers/privacy modes) — isSupported()
 * checks that before touching getAnalytics(), which throws otherwise.
 * Also guards against missing NEXT_PUBLIC_FIREBASE_* env vars (e.g. a
 * fresh clone without .env.local) so a misconfigured/absent project never
 * breaks the page — Analytics is additive, not load-bearing.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return Promise.resolve(null);

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }

  return analyticsPromise;
}

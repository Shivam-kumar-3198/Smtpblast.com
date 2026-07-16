import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * getApps().length guard avoids "Firebase App already exists" during
 * Next.js hot reload, where this module can be re-evaluated without a
 * full page reload.
 */
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firestore and Auth are safe to initialize eagerly (unlike Analytics,
 * they don't require the browser-only isSupported() check) — but every
 * call site still only runs in client components, since this file has no
 * server-only APIs to guard against.
 */
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export function signInAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutAdmin() {
  return signOut(auth);
}

/**
 * Admin status is an allowlist doc at admins/{uid}, not a role on the
 * user object — Firebase Auth alone only proves *who* signed in, not that
 * they're authorized for the dashboard. The doc's existence is also what
 * firestore.rules checks server-side, so this client check and the real
 * security boundary can never drift out of sync.
 */
export async function checkIsAdmin(user: User): Promise<boolean> {
  const snap = await getDoc(doc(db, "admins", user.uid));
  return snap.exists();
}

/**
 * Combines Firebase Auth state with the admin-allowlist check into one
 * subscription for the admin layout guard.
 */
export function subscribeToAdminAuth(callback: (state: AdminAuthState) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, isAdmin: false, loading: false });
      return;
    }
    try {
      const isAdmin = await checkIsAdmin(user);
      callback({ user, isAdmin, loading: false });
    } catch {
      callback({ user, isAdmin: false, loading: false });
    }
  });
}

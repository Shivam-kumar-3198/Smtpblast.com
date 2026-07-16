import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Shared Firestore CRUD for the "simple list of structured records"
 * content types (pricing, testimonials, FAQ, features, how-it-works
 * steps) — all public-read/admin-write collections ordered by a numeric
 * `order` field the admin controls. Blog posts and services have more
 * complex, type-specific shapes and use their own lib/*.ts files instead.
 */
export function createCollectionCrud<T extends object>(collectionName: string) {
  const col = () => collection(db, collectionName);

  return {
    subscribe(onData: (items: (T & { id: string })[]) => void, onError?: (error: Error) => void) {
      const q = query(col(), orderBy("order"));
      return onSnapshot(
        q,
        (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))),
        onError
      );
    },

    async list(): Promise<(T & { id: string })[]> {
      try {
        const snap = await getDocs(query(col(), orderBy("order")));
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
      } catch (err) {
        console.error(`${collectionName} list() failed:`, err);
        return [];
      }
    },

    async create(data: T): Promise<string> {
      const ref = await addDoc(col(), data);
      return ref.id;
    },

    async update(id: string, data: Partial<T>): Promise<void> {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    },

    async remove(id: string): Promise<void> {
      await deleteDoc(doc(db, collectionName, id));
    },
  };
}

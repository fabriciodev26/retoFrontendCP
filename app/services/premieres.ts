import { collection, doc, getDoc, getDocs, query, limit, startAfter, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { Premiere } from "@/types";

export const PREMIERE_PAGE_SIZE = 4;

export interface PremierePage {
  items: Premiere[];
  nextCursor: QueryDocumentSnapshot | null;
}

export async function getPremieres(cursor: QueryDocumentSnapshot | null = null): Promise<PremierePage> {
  const q = cursor
    ? query(collection(db, "premieres"), limit(PREMIERE_PAGE_SIZE), startAfter(cursor))
    : query(collection(db, "premieres"), limit(PREMIERE_PAGE_SIZE));

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Premiere));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    items,
    nextCursor: snapshot.docs.length === PREMIERE_PAGE_SIZE ? lastDoc : null,
  };
}

export async function getPremiereById(id: string): Promise<Premiere | null> {
  const snap = await getDoc(doc(db, "premieres", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Premiere;
}

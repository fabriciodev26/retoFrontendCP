import { collection, getDocs, query, limit, startAfter, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { CandyProduct } from "@/types";

export const CANDY_PAGE_SIZE = 6;

export interface CandyPage {
  items: CandyProduct[];
  nextCursor: QueryDocumentSnapshot | null;
}

export async function getCandyStore(cursor: QueryDocumentSnapshot | null = null): Promise<CandyPage> {
  const q = cursor
    ? query(collection(db, "candystore"), limit(CANDY_PAGE_SIZE), startAfter(cursor))
    : query(collection(db, "candystore"), limit(CANDY_PAGE_SIZE));

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CandyProduct));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    items,
    nextCursor: snapshot.docs.length === CANDY_PAGE_SIZE ? lastDoc : null,
  };
}

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { CandyProduct } from "@/types";

export async function getCandyStore(): Promise<CandyProduct[]> {
  const snapshot = await getDocs(collection(db, "candystore"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CandyProduct));
}

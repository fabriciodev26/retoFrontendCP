import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { Premiere } from "@/types";

export async function getPremieres(): Promise<Premiere[]> {
  const snapshot = await getDocs(collection(db, "premieres"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Premiere));
}

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { Premiere } from "@/types";
import mockData from "@/mocks/premieres.json";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const MOCK_PREMIERES: Premiere[] = mockData.map((p) => ({ ...p, id: String(p.id) }));

export async function getPremieres(): Promise<Premiere[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_PREMIERES;
  }
  const snapshot = await getDocs(collection(db, "premieres"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Premiere));
}

export async function getPremiereById(id: string): Promise<Premiere | null> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PREMIERES.find((p) => p.id === id) ?? null;
  }
  const snap = await getDoc(doc(db, "premieres", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Premiere;
}

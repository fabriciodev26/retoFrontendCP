import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { CandyProduct } from "@/types";
import mockData from "@/mocks/candystore.json";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const MOCK_PRODUCTS: CandyProduct[] = mockData.map((p) => ({ ...p, id: String(p.id) }));

export async function getCandyStore(): Promise<CandyProduct[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_PRODUCTS;
  }
  const snapshot = await getDocs(collection(db, "candystore"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CandyProduct));
}

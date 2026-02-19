import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem, User, PayUResponse } from "@/types";

interface OrderPayload {
  user: User | null;
  items: CartItem[];
  total: number;
  payUResponse: PayUResponse;
}

export async function saveOrder(payload: OrderPayload): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

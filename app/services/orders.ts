import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { CartItem, User, PayUResponse, Order } from "@/types";

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

export async function getOrders(email: string): Promise<Order[]> {
  const q = query(collection(db, "orders"), where("user.email", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as Order;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

import { create } from "zustand";
import type { PayUResponse, CartItem } from "@/types";

interface PaymentState {
  payUResponse: PayUResponse | null;
  orderItems: CartItem[];
  orderTotal: number;
  setPayUResponse: (response: PayUResponse, items: CartItem[], total: number) => void;
  clearPayUResponse: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payUResponse: null,
  orderItems: [],
  orderTotal: 0,
  setPayUResponse: (response, items, total) =>
    set({ payUResponse: response, orderItems: items, orderTotal: total }),
  clearPayUResponse: () => set({ payUResponse: null, orderItems: [], orderTotal: 0 }),
}));

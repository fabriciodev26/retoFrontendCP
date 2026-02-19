import { create } from "zustand";
import type { PayUResponse } from "@/types";

interface PaymentState {
  payUResponse: PayUResponse | null;
  setPayUResponse: (response: PayUResponse) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payUResponse: null,
  setPayUResponse: (response) => set({ payUResponse: response }),
}));

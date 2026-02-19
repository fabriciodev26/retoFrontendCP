import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CandyProduct } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: CandyProduct) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const calcTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          const items = existing
            ? state.items.map((i) =>
                i.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i
              )
            : [...state.items, { ...product, cantidad: 1 }];
          return { items, total: calcTotal(items) };
        }),
      removeItem: (id) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (!existing) return state;
          const items =
            existing.cantidad === 1
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
                );
          return { items, total: calcTotal(items) };
        }),
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: "cineplanet-cart" }
  )
);

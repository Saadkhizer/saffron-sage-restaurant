import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  add: (item: MenuItem) => void;
  remove: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  clear: () => void;
  subtotalCents: () => number;
  count: () => number;
}

// Cart is persisted to localStorage so it survives reloads (requirement).
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(50, i.quantity + 1) } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id,
                name: item.name,
                priceCents: item.priceCents,
                image: item.image,
                quantity: 1,
              },
            ],
          };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: Math.min(50, quantity) } : i
                ),
        })),
      clear: () => set({ items: [] }),
      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'rs-cart' }
  )
);

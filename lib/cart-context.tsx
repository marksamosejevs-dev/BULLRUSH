"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { product } from "@/data/product";

export type PurchaseType = "one-time" | "subscription";

export interface CartLine {
  id: string;
  name: string;
  descriptor: string;
  purchaseType: PurchaseType;
  quantity: number;
  /** Unit price in the smallest documented currency unit. Null when pricing is not yet configured. */
  unitPrice: number | null;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  itemCount: number;
  subtotal: number | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bullrush.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* storage unavailable — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [lines, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback((line: Omit<CartLine, "id">) => {
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.name === line.name && l.purchaseType === line.purchaseType
      );
      if (existing) {
        return prev.map((l) =>
          l.id === existing.id ? { ...l, quantity: l.quantity + line.quantity } : l
        );
      }
      return [...prev, { ...line, id: `${line.name}-${line.purchaseType}-${prev.length}` }];
    });
    setIsOpen(true);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l))
    );
  }, []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const subtotal = useMemo(() => {
    if (lines.length === 0) return 0;
    if (lines.some((l) => l.unitPrice === null)) return null;
    return lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0);
  }, [lines]);

  const value: CartContextValue = {
    lines,
    isOpen,
    openCart,
    closeCart,
    addLine,
    removeLine,
    setQuantity,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function defaultProductLine(purchaseType: PurchaseType = "one-time"): Omit<CartLine, "id"> {
  return {
    name: product.name,
    descriptor: product.descriptor,
    purchaseType,
    quantity: 1,
    unitPrice: product.price?.amount ?? null,
  };
}

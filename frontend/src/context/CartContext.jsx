import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const KEY = 'fpc_cart';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (p, qty = 1) => {
    if (p.stock <= 0) return toast.error('Out of stock');
    setItems((prev) => {
      const ex = prev.find((i) => i._id === p._id);
      if (ex) return prev.map((i) => (i._id === p._id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i));
      return [...prev, { _id: p._id, name: p.name, slug: p.slug, price: p.price, mrp: p.mrp, image: p.images?.[0], stock: p.stock, qty }];
    });
    toast.success('Added to cart');
    setDrawerOpen(true);
  };
  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((a, i) => a + i.qty, 0);
    const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
    const savings = items.reduce((a, i) => a + i.qty * Math.max(0, (i.mrp || i.price) - i.price), 0);
    return { items, count, subtotal, savings, add, setQty, remove, clear, drawerOpen, setDrawerOpen };
  }, [items, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

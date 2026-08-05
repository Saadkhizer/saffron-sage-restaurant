import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../lib/format';
import { FoodImage } from '../ui/FoodImage';
import {imageUrl} from '../../api/client';

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const goToCheckout = () => {
    close();
    navigate(token ? '/checkout' : '/login', token ? undefined : { state: { from: '/checkout' } });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-stone-50 shadow-2xl dark:bg-stone-950"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag size={20} /> Your order
              </h2>
              <button onClick={close} className="btn-ghost h-9 w-9 !px-0" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-stone-200 text-2xl dark:bg-stone-800">
                  🛒
                </div>
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-sm text-stone-500">Add some delicious dishes to get started.</p>
                <button onClick={() => { close(); navigate('/menu'); }} className="btn-primary mt-2">
                  Browse menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
                    >
                  <FoodImage src={imageUrl(item.image)} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">{item.name}</p>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-stone-400 hover:text-red-500"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500">{formatPrice(item.priceCents)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700">
                            <button
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              className="grid h-7 w-7 place-items-center text-stone-600 hover:text-brand-600 dark:text-stone-300"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              className="grid h-7 w-7 place-items-center text-stone-600 hover:text-brand-600 dark:text-stone-300"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-bold">
                            {formatPrice(item.priceCents * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-stone-200 p-4 dark:border-stone-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <button onClick={goToCheckout} className="btn-primary w-full">
                    {token ? 'Checkout' : 'Sign in to checkout'}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

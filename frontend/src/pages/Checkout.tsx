import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, Store, CreditCard, Wallet, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { ordersApi } from '../api/endpoints';
import type { PlaceOrderInput } from '../api/endpoints';
import { ApiError, imageUrl } from '../api/client';
import { formatPrice } from '../lib/format';
import { FoodImage } from '../components/ui/FoodImage';
import { Spinner } from '../components/ui/Spinner';
import type { Fulfillment } from '../types';

export function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const deliveryFee = useConfigStore((s) => s.config?.deliveryFeeCents ?? 299);

  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<'card' | 'cash'>('card');
  const [card, setCard] = useState('');
  const [loading, setLoading] = useState(false);

  const fee = fulfillment === 'delivery' ? deliveryFee : 0;
  const total = subtotal + fee;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-stone-200 text-2xl dark:bg-stone-800">
          <ShoppingBag />
        </div>
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-stone-500">Add a few dishes before checking out.</p>
        <button onClick={() => navigate('/menu')} className="btn-primary">Browse menu</button>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const input: PlaceOrderInput = {
      items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      fulfillment,
      contact: { name: name.trim(), phone: phone.trim() },
      address: fulfillment === 'delivery' ? { line1: line1.trim(), city: city.trim() } : undefined,
      notes: notes.trim() || undefined,
      paymentMethod: payment,
    };
    try {
      const order = await ordersApi.place(input);
      clear();
      toast.success('Order placed! 🎉');
      navigate(`/order/${order.id}/confirmed`, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'input';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Fulfillment */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">How would you like it?</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'delivery', icon: Truck, label: 'Delivery', sub: '~35 min' },
                { key: 'pickup', icon: Store, label: 'Pickup', sub: '~20 min' },
              ] as const).map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setFulfillment(opt.key)}
                  className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition ${
                    fulfillment === opt.key
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <opt.icon size={20} className="text-brand-600" />
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-stone-500">{opt.sub}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">Name</label>
                <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium">Phone</label>
                <input id="c-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1 555 010 2030" />
              </div>
            </div>
          </section>

          {/* Address (delivery only) */}
          {fulfillment === 'delivery' && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card overflow-hidden p-5"
            >
              <h2 className="mb-3 font-semibold">Delivery address</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="a-line" className="mb-1.5 block text-sm font-medium">Street address</label>
                  <input id="a-line" required value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} placeholder="123 Garden Street, Apt 4" />
                </div>
                <div>
                  <label htmlFor="a-city" className="mb-1.5 block text-sm font-medium">City</label>
                  <input id="a-city" required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
                </div>
              </div>
            </motion.section>
          )}

          {/* Notes */}
          <section className="card p-5">
            <label htmlFor="notes" className="mb-1.5 block font-semibold">Order notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputCls}
              placeholder="Allergies, delivery instructions…"
            />
          </section>

          {/* Payment */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Payment</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'card', icon: CreditCard, label: 'Card' },
                { key: 'cash', icon: Wallet, label: fulfillment === 'pickup' ? 'Pay at store' : 'Cash on delivery' },
              ] as const).map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setPayment(opt.key)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition ${
                    payment === opt.key
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <opt.icon size={18} className="text-brand-600" /> {opt.label}
                </button>
              ))}
            </div>
            {payment === 'card' && (
              <div className="mt-4">
                <label htmlFor="card" className="mb-1.5 block text-sm font-medium">Card number</label>
                <input
                  id="card"
                  required
                  inputMode="numeric"
                  value={card}
                  onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
                  className={inputCls}
                  placeholder="4242 4242 4242 4242"
                />
                <p className="mt-1.5 text-xs text-stone-400">Demo only — no real charge is made.</p>
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold">Order summary</h2>
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <FoodImage src={imageUrl(i.image)} alt={i.name} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-stone-500">×{i.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(i.priceCents * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{fulfillment === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
                <span>{fee === 0 ? 'Free' : formatPrice(fee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? <Spinner /> : `Place order · ${formatPrice(total)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
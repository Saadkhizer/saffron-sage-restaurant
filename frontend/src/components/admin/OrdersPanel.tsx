import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, X, ArrowRight, Bike, Store, Clock, Phone, MapPin, Inbox } from 'lucide-react';
import type { AdminOrder, OrderAction, OrderStatus } from '../../types';
import { adminApi } from '../../api/endpoints';
import { formatPrice, formatDate } from '../../lib/format';
import { Spinner } from '../ui/Spinner';

const statusMeta: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  preparing: { label: 'Preparing', cls: 'bg-blue-100 text-blue-700' },
  on_the_way: { label: 'On the way', cls: 'bg-indigo-100 text-indigo-700' },
  ready: { label: 'Ready', cls: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-stone-200 text-stone-600' },
};

const filters: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'delivered', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

export function OrdersPanel({ onChange }: { onChange?: () => void }) {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState<number | null>(null);

  const load = (status: string) =>
    adminApi.orders(status).then(setOrders).catch(() => setOrders([]));

  useEffect(() => {
    load(filter);
    const timer = setInterval(() => load(filter), 7000); // live refresh
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const act = async (order: AdminOrder, action: OrderAction) => {
    if (action === 'reject' && !window.confirm(`Reject order #${order.id}?`)) return;
    setBusy(order.id);
    try {
      const updated = await adminApi.orderAction(order.id, action);
      setOrders((prev) => (prev ? prev.map((o) => (o.id === order.id ? updated : o)) : prev));
      toast.success(`Order #${order.id} → ${statusMeta[updated.status].label}`);
      onChange?.();
      // If the filter would now hide this order, refresh the list.
      if (filter !== 'all' && updated.status !== filter) load(filter);
    } catch {
      toast.error('Could not update the order');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders === null ? (
        <div className="grid place-items-center py-20"><Spinner className="h-7 w-7 text-brand-600" /></div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Inbox size={36} className="text-stone-400" />
          <p className="font-semibold">No orders here</p>
          <p className="text-sm text-stone-500">New orders will appear automatically.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="card flex flex-col p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Clock size={12} /> {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[order.status].cls}`}>
                    {statusMeta[order.status].label}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600 dark:text-stone-300">
                  <span className="flex items-center gap-1.5">
                    {order.fulfillment === 'delivery' ? <Bike size={14} /> : <Store size={14} />}
                    <span className="capitalize">{order.fulfillment}</span>
                  </span>
                  <span className="flex items-center gap-1.5"><Phone size={14} /> {order.contactName} · {order.contactPhone}</span>
                  {order.fulfillment === 'delivery' && (
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {order.addressLine1}, {order.addressCity}</span>
                  )}
                </div>

                <ul className="mt-3 space-y-1 rounded-xl bg-stone-50 p-3 text-sm dark:bg-stone-800/50">
                  {order.items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span><span className="font-semibold text-brand-700 dark:text-brand-400">{i.quantity}×</span> {i.name}</span>
                      <span>{formatPrice(i.priceCents * i.quantity)}</span>
                    </li>
                  ))}
                  {order.notes && <li className="pt-1 text-xs italic text-stone-500">“{order.notes}”</li>}
                </ul>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(order.totalCents)}</span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => act(order, 'reject')} disabled={busy === order.id}
                          className="btn-outline h-9 gap-1.5 !border-red-300 !text-red-600 hover:!bg-red-50">
                          <X size={15} /> Reject
                        </button>
                        <button onClick={() => act(order, 'accept')} disabled={busy === order.id}
                          className="btn-primary h-9 gap-1.5">
                          {busy === order.id ? <Spinner /> : <><Check size={15} /> Accept</>}
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => act(order, 'advance')} disabled={busy === order.id} className="btn-primary h-9 gap-1.5">
                        {busy === order.id ? <Spinner /> : <>{order.fulfillment === 'pickup' ? 'Mark ready' : 'Out for delivery'} <ArrowRight size={15} /></>}
                      </button>
                    )}
                    {(order.status === 'on_the_way' || order.status === 'ready') && (
                      <button onClick={() => act(order, 'advance')} disabled={busy === order.id} className="btn-primary h-9 gap-1.5">
                        {busy === order.id ? <Spinner /> : <><Check size={15} /> Mark delivered</>}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

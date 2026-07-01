import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Store } from 'lucide-react';
import type { Order } from '../types';
import { ordersApi } from '../api/endpoints';
import { formatPrice } from '../lib/format';
import { Spinner } from '../components/ui/Spinner';
import { FoodImage } from '../components/ui/FoodImage';

export function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi.get(id).then(setOrder).catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold">Order not found</h1>
        <Link to="/menu" className="btn-primary mt-4">Back to menu</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner className="h-8 w-8 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950"
      >
        <CheckCircle2 size={44} />
      </motion.div>

      <div className="mt-5 text-center">
        <h1 className="font-display text-3xl font-bold">Order placed!</h1>
        <p className="mt-2 text-stone-500">
          Thanks, {order.contactName.split(' ')[0]}. Order{' '}
          <span className="font-semibold text-stone-800 dark:text-stone-200">#{order.id}</span> has been sent to
          the kitchen — track it live as the restaurant confirms.
        </p>
      </div>

      <div className="card mt-8 p-5">
        <div className="flex flex-wrap items-center gap-4 border-b border-stone-200 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-2 text-sm">
            {order.fulfillment === 'delivery' ? <MapPin size={18} className="text-brand-600" /> : <Store size={18} className="text-brand-600" />}
            <div>
              <p className="font-semibold capitalize">{order.fulfillment}</p>
              <p className="text-stone-500">
                {order.fulfillment === 'delivery'
                  ? `${order.addressLine1}, ${order.addressCity}`
                  : 'Pick up at the counter'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={18} className="text-brand-600" />
            <div>
              <p className="font-semibold">Est. {order.etaMinutes} min</p>
              <p className="text-stone-500">Estimated {order.fulfillment === 'delivery' ? 'arrival' : 'ready'} time</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 py-4">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <FoodImage src={null} alt={i.name} className="hidden h-9 w-9 rounded-md sm:block" />
                <span className="font-medium">{i.name} <span className="text-stone-400">×{i.quantity}</span></span>
              </div>
              <span className="font-semibold">{formatPrice(i.priceCents * i.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span><span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>{order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</span>
            <span>{order.deliveryCents === 0 ? 'Free' : formatPrice(order.deliveryCents)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold">
            <span>Total</span><span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to={`/order/${order.id}`} className="btn-primary flex-1">Track this order</Link>
        <Link to="/menu" className="btn-outline flex-1">Order more</Link>
      </div>
    </div>
  );
}

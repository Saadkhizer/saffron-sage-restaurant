import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Phone, MapPin, XCircle } from 'lucide-react';
import type { Order } from '../types';
import { ordersApi } from '../api/endpoints';
import { formatPrice, formatDate } from '../lib/format';
import { Spinner } from '../components/ui/Spinner';
import { OrderStatusTracker } from '../components/order/OrderStatusTracker';

const statusCopy: Record<string, string> = {
  pending: 'Order placed! Waiting for the restaurant to confirm it.',
  preparing: 'Confirmed — our chefs are cooking your food fresh right now.',
  on_the_way: 'Your rider has picked up the order and is heading your way.',
  ready: 'Your order is ready for pickup at the counter.',
  delivered: 'Enjoy your meal! Thanks for ordering with us.',
  rejected: 'Sorry — the restaurant couldn’t accept this order. Any charge will be refunded.',
  cancelled: 'This order was cancelled.',
};

export function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const fetchOrder = () =>
      ordersApi.get(id).then((o) => active && setOrder(o)).catch(() => active && setError(true));
    fetchOrder();
    // Poll so the derived status advances live without a manual refresh.
    const timer = setInterval(fetchOrder, 8000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold">Order not found</h1>
        <Link to="/dashboard" className="btn-primary mt-4">My orders</Link>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-stone-500">Placed {formatDate(order.placedAt)}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold capitalize text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {order.status === 'rejected' || order.status === 'cancelled' ? (
        <div className="card mt-6 flex flex-col items-center gap-3 border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/40">
          <XCircle size={40} className="text-red-500" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{statusCopy[order.status]}</p>
        </div>
      ) : (
        <div className="card mt-6 p-6">
          <OrderStatusTracker order={order} />
          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
            {statusCopy[order.status]}
          </p>
          {order.status !== 'delivered' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-brand-600">
              <Clock size={16} /> Est. {order.etaMinutes} min total
            </div>
          )}
        </div>
      )}

      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-semibold">Details</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            {order.fulfillment === 'delivery' ? <MapPin size={16} className="mt-0.5 text-brand-600" /> : <MapPin size={16} className="mt-0.5 text-brand-600" />}
            <div>
              <p className="font-medium capitalize">{order.fulfillment}</p>
              <p className="text-stone-500">
                {order.fulfillment === 'delivery' ? `${order.addressLine1}, ${order.addressCity}` : 'Pickup at counter'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={16} className="mt-0.5 text-brand-600" />
            <div>
              <p className="font-medium">{order.contactName}</p>
              <p className="text-stone-500">{order.contactPhone}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 dark:border-stone-800">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span>{i.name} <span className="text-stone-400">×{i.quantity}</span></span>
              <span className="font-medium">{formatPrice(i.priceCents * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold dark:border-stone-800">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/dashboard" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Back to my orders
        </Link>
      </div>
    </div>
  );
}

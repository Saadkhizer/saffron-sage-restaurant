import { Check, ChefHat, Bike, PackageCheck, ClipboardCheck } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';

type Step = { key: OrderStatus; label: string; icon: typeof Check };

const deliverySteps: Step[] = [
  { key: 'pending', label: 'Placed', icon: ClipboardCheck },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'on_the_way', label: 'On the way', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const pickupSteps: Step[] = [
  { key: 'pending', label: 'Placed', icon: ClipboardCheck },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: PackageCheck },
  { key: 'delivered', label: 'Collected', icon: Check },
];

export function OrderStatusTracker({ order }: { order: Order }) {
  const steps = order.fulfillment === 'pickup' ? pickupSteps : deliverySteps;
  const currentIdx = Math.max(0, steps.findIndex((s) => s.key === order.status));

  return (
    <div className="flex items-center">
      {steps.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={`h-1 flex-1 rounded ${idx === 0 ? 'opacity-0' : done ? 'bg-brand-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition ${
                  done
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-stone-300 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-900'
                } ${active ? 'ring-4 ring-brand-200 dark:ring-brand-900' : ''}`}
              >
                {done && !active ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <div className={`h-1 flex-1 rounded ${idx === steps.length - 1 ? 'opacity-0' : idx < currentIdx ? 'bg-brand-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
            </div>
            <span className={`mt-2 text-center text-xs font-medium ${done ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

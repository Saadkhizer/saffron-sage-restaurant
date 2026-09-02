import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ClipboardList, UtensilsCrossed, BarChart3, ArrowRight } from 'lucide-react';
import { useConfigStore } from '../store/configStore';

const perks = [
  { icon: ClipboardList, title: 'Manage orders', text: 'Accept, reject, and advance incoming orders in real time.' },
  { icon: UtensilsCrossed, title: 'Edit your menu', text: 'Add dishes, change prices, and toggle availability.' },
  { icon: BarChart3, title: 'Track performance', text: 'See today’s orders and revenue at a glance.' },
];

// Standalone landing page for restaurant staff — keeps the owner-console entry
// point off the customer login/signup forms entirely.
export function OwnerPortal() {
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Crave It');

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg">
          <ShieldCheck size={30} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold">Owner Console</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">
          The back office for {name} — for restaurant staff only. Customers can order
          from the regular menu without an owner account.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
              <p.icon size={20} className="text-brand-600 dark:text-brand-400" />
              <p className="mt-2 text-sm font-semibold">{p.title}</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{p.text}</p>
            </div>
          ))}
        </div>

        <Link to="/admin/login" className="btn-primary mt-8 h-12 w-full text-base sm:w-auto sm:px-10">
          Sign in to the Owner Console <ArrowRight size={17} />
        </Link>
        <p className="mt-4 text-xs text-stone-400">
          Not the owner?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Go to customer sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

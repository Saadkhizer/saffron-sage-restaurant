import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

// Shown on the customer login/signup pages so a restaurant owner can jump to the
// separate owner console login.
export function OwnerLoginCallout() {
  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-white">
          <ShieldCheck size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Are you the restaurant owner?</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Manage your menu &amp; orders in the console.</p>
        </div>
      </div>
      <Link to="/admin/login" className="btn-outline mt-3 w-full">
        Owner Console login <ArrowRight size={15} />
      </Link>
    </div>
  );
}

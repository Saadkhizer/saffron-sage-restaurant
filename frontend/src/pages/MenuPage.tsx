import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import type { Category, MenuItem } from '../types';
import { menuApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { MenuCard } from '../components/menu/MenuCard';
import { CategoryFilter } from '../components/menu/CategoryFilter';
import { SearchBar } from '../components/menu/SearchBar';
import { MenuCardSkeleton } from '../components/ui/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useConfigStore } from '../store/configStore';

export function MenuPage() {
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Saffron & Sage');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    menuApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    menuApi
      .list(activeCat, debouncedSearch)
      .then((data) => !cancelled && setItems(data))
      .catch((err: ApiError) => {
        if (!cancelled) {
          setError(err.message);
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCat, debouncedSearch]);

  return (
    <div className="pb-16">
      {/* Full-width banner covering the top of the page.
          Light: warm deep-red. Dark: elegant charcoal with a soft red glow + gold. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 dark:from-stone-900 dark:via-stone-950 dark:to-black" />
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=60"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay dark:opacity-15"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <div className="absolute inset-0 bg-black/25 dark:bg-black/50" />
        <div className="pointer-events-none absolute -top-20 right-8 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl dark:bg-brand-700/30" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-7xl px-4 py-16 text-center text-white sm:py-20"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">{name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold drop-shadow-sm sm:text-5xl">Our Menu</h1>
          <span className="mx-auto mt-4 block h-0.5 w-16 rounded-full bg-gold-500" />
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Pick your favorites — every dish made fresh to order, from starters to dessert.
          </p>
        </motion.div>
      </section>

      {/* Listing body */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="sticky top-16 z-30 -mx-4 mb-8 space-y-3 bg-cream-50/90 px-4 py-4 backdrop-blur dark:bg-stone-950/90">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={categories} active={activeCat} onChange={setActiveCat} />
        </div>

        {error && (
          <div className="card mb-6 border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {items === null ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <SearchX size={40} className="text-stone-400" />
            <p className="text-lg font-semibold">No dishes found</p>
            <p className="text-sm text-stone-500">Try a different category or search term.</p>
          </div>
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Heart } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import type { MenuItem } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/format';
import { FoodImage } from '../ui/FoodImage';

const tagStyles: Record<string, string> = {
  spicy: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  vegetarian: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  vegan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

export const MenuCard = forwardRef<HTMLElement, { item: MenuItem }>(function MenuCard({ item }, ref) {
  const add = useCartStore((s) => s.add);
  const [liked, setLiked] = useState(false);

  const handleAdd = () => {
    add(item);
    toast.success(`${item.name} added to cart`, { icon: '🛒' });
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden">
        <FoodImage
          src={item.image}
          alt={item.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {item.popular && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
            <Flame size={12} /> Popular
          </span>
        )}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-stone-500 shadow backdrop-blur transition hover:text-red-500 dark:bg-stone-900/90"
          aria-label={liked ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
          aria-pressed={liked}
        >
          <Heart size={16} className={clsx(liked && 'fill-red-500 text-red-500')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-stone-500 dark:text-stone-400">
          {item.description}
        </p>

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                  tagStyles[tag] ?? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-700 dark:text-brand-400">
            {formatPrice(item.priceCents)}
          </span>
          <button
            onClick={handleAdd}
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 text-white shadow-sm transition hover:bg-brand-800 active:scale-95"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
});

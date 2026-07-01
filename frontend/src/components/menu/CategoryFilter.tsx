import type { Category } from '../../types';

export function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}) {
  const all = [{ id: 0, slug: 'all', name: 'All' }, ...categories];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Menu categories">
      {all.map((c) => {
        const isActive = active === c.slug;
        return (
          <button
            key={c.slug}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

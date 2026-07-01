import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Flame } from 'lucide-react';
import type { Category, MenuItem } from '../../types';
import { adminApi, menuApi } from '../../api/endpoints';
import type { MenuItemInput } from '../../api/endpoints';
import { formatPrice } from '../../lib/format';
import { FoodImage } from '../ui/FoodImage';
import { Spinner } from '../ui/Spinner';

export function MenuPanel({ onChange }: { onChange?: () => void }) {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null);

  const load = () => adminApi.menu().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    load();
    menuApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const toggle = async (item: MenuItem) => {
    try {
      const updated = await adminApi.setAvailability(item.id, !item.available);
      setItems((prev) => (prev ? prev.map((i) => (i.id === item.id ? updated : i)) : prev));
    } catch {
      toast.error('Could not update availability');
    }
  };

  const remove = async (item: MenuItem) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try {
      await adminApi.deleteItem(item.id);
      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : prev));
      toast.success('Item deleted');
      onChange?.();
    } catch {
      toast.error('Could not delete item');
    }
  };

  const onSaved = (saved: MenuItem) => {
    setItems((prev) => {
      if (!prev) return [saved];
      const exists = prev.some((i) => i.id === saved.id);
      return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
    });
    setEditing(null);
    onChange?.();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-stone-500">{items?.length ?? 0} items on the menu</p>
        <button onClick={() => setEditing('new')} className="btn-primary h-10">
          <Plus size={16} /> Add item
        </button>
      </div>

      {items === null ? (
        <div className="grid place-items-center py-20"><Spinner className="h-7 w-7 text-brand-600" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-3 p-3">
              <FoodImage src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                      {item.name}
                      {item.popular && <Flame size={13} className="shrink-0 text-gold-500" />}
                    </p>
                    <p className="text-xs text-stone-500">{item.categoryName}</p>
                  </div>
                  <span className="shrink-0 font-bold text-brand-700 dark:text-brand-400">{formatPrice(item.priceCents)}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-500">
                    <input type="checkbox" checked={item.available} onChange={() => toggle(item)} className="peer sr-only" />
                    <span className="relative h-5 w-9 rounded-full bg-stone-300 transition peer-checked:bg-green-500 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                    {item.available ? 'Available' : 'Hidden'}
                  </label>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(item)} className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-brand-600 dark:hover:bg-stone-800" aria-label={`Edit ${item.name}`}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(item)} className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ItemEditor
            item={editing === 'new' ? null : editing}
            categories={categories}
            onCategoryAdded={(c) => setCategories((prev) => [...prev, c])}
            onClose={() => setEditing(null)}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemEditor({
  item,
  categories,
  onCategoryAdded,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  categories: Category[];
  onCategoryAdded: (c: Category) => void;
  onClose: () => void;
  onSaved: (m: MenuItem) => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item ? (item.priceCents / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState<number>(item?.categoryId ?? categories[0]?.id ?? 0);
  const [image, setImage] = useState(item?.image ?? '');
  const [tags, setTags] = useState(item?.tags.join(', ') ?? '');
  const [popular, setPopular] = useState(item?.popular ?? false);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);

  const addCategory = async () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    try {
      const cat = await adminApi.createCategory(trimmed);
      onCategoryAdded(cat);
      setCategoryId(cat.id);
      setNewCat('');
      toast.success(`Added category “${cat.name}”`);
    } catch {
      toast.error('Could not add category');
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(price) * 100);
    if (!Number.isFinite(priceCents)) return toast.error('Enter a valid price');
    const input: MenuItemInput = {
      name,
      description,
      priceCents,
      categoryId,
      image: image.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      popular,
      available,
    };
    setSaving(true);
    try {
      const saved = item ? await adminApi.updateItem(item.id, input) : await adminApi.createItem(input);
      toast.success(item ? 'Item updated' : 'Item added');
      onSaved(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save item');
    } finally {
      setSaving(false);
    }
  };

  const field = 'input';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="fixed inset-x-4 top-[6vh] z-50 mx-auto max-h-[88vh] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900"
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">{item ? 'Edit item' : 'New item'}</h3>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !px-0" aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input className={field} required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea className={field} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Price</label>
              <input className={field} required inputMode="decimal" value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} placeholder="12.99" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select className={field} value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <input className={field} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="…or add a new category" />
            <button type="button" onClick={addCategory} className="btn-outline shrink-0">Add</button>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Image URL</label>
            <input className={field} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tags (comma separated)</label>
            <input className={field} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="spicy, vegetarian" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="h-4 w-4 rounded accent-brand-600" /> Popular
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4 rounded accent-brand-600" /> Available
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner /> : item ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

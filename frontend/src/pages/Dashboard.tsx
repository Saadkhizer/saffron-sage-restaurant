import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User as UserIcon, MapPin, Receipt, Trash2, Plus, Star } from 'lucide-react';
import type { Address, Order } from '../types';
import { addressApi, authApi, ordersApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { formatPrice, formatDate } from '../lib/format';
import { Spinner } from '../components/ui/Spinner';

type Tab = 'orders' | 'addresses' | 'profile';

const tabs: { key: Tab; label: string; icon: typeof UserIcon }[] = [
  { key: 'orders', label: 'Orders', icon: Receipt },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'profile', label: 'Profile', icon: UserIcon },
];

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('orders');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase() ?? 'U'
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
          <p className="text-sm text-stone-500">{user?.email}</p>
        </div>
      </header>

      <div className="mt-8 flex gap-2 border-b border-stone-200 dark:border-stone-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'orders' && <OrdersTab />}
        {tab === 'addresses' && <AddressesTab />}
        {tab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    ordersApi.list().then(setOrders).catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <div className="grid place-items-center py-20"><Spinner className="h-7 w-7 text-brand-600" /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <Receipt size={36} className="text-stone-400" />
        <p className="font-semibold">No orders yet</p>
        <p className="text-sm text-stone-500">When you place an order, it’ll show up here.</p>
        <Link to="/menu" className="btn-primary mt-2">Start an order</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to={`/order/${o.id}`}
            className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-brand-300"
          >
            <div>
              <p className="font-semibold">Order #{o.id}</p>
              <p className="text-sm text-stone-500">
                {formatDate(o.placedAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items · {o.fulfillment}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {o.status.replace(/_/g, ' ')}
              </span>
              <span className="font-bold">{formatPrice(o.totalCents)}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [form, setForm] = useState({ label: 'Home', line1: '', city: '', phone: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  const reload = () => addressApi.list().then(setAddresses).catch(() => setAddresses([]));
  useEffect(() => { reload(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addressApi.add(form);
      toast.success('Address saved');
      setForm({ label: 'Home', line1: '', city: '', phone: '', isDefault: false });
      reload();
    } catch {
      toast.error('Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await addressApi.remove(id);
    toast.success('Address removed');
    reload();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <h2 className="font-semibold">Saved addresses</h2>
        {addresses === null ? (
          <Spinner className="h-6 w-6 text-brand-600" />
        ) : addresses.length === 0 ? (
          <p className="text-sm text-stone-500">No saved addresses yet.</p>
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="card flex items-start justify-between gap-3 p-4">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {a.label}
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      <Star size={10} className="fill-current" /> Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-stone-500">{a.line1}, {a.city}</p>
                {a.phone && <p className="text-sm text-stone-500">{a.phone}</p>}
              </div>
              <button onClick={() => remove(a.id)} className="text-stone-400 hover:text-red-500" aria-label="Delete address">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={add} className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">Add address</h2>
        <input className="input" placeholder="Label (Home, Work…)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <input className="input" required placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        <input className="input" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
          Set as default
        </label>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner /> : <><Plus size={16} /> Save address</>}
        </button>
      </form>
    </div>
  );
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await authApi.updateProfile(name, phone);
      setUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card max-w-md space-y-4 p-6">
      <h2 className="font-semibold">Edit profile</h2>
      <div>
        <label htmlFor="p-name" className="mb-1.5 block text-sm font-medium">Full name</label>
        <input id="p-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="p-email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="p-email" className="input opacity-60" value={user?.email ?? ''} disabled />
      </div>
      <div>
        <label htmlFor="p-phone" className="mb-1.5 block text-sm font-medium">Phone</label>
        <input id="p-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 010 2030" />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <Spinner /> : 'Save changes'}
      </button>
    </form>
  );
}

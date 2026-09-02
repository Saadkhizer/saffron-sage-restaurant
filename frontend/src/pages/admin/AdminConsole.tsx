import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, LogOut, ExternalLink, ClipboardList, UtensilsCrossed, Bell, DollarSign, ListOrdered } from 'lucide-react';
import type { AdminStats } from '../../types';
import { adminApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { formatPrice } from '../../lib/format';
import { OrdersPanel } from '../../components/admin/OrdersPanel';
import { MenuPanel } from '../../components/admin/MenuPanel';

type Tab = 'orders' | 'menu';

export function AdminConsole() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Saffron & Sage');
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orders');
  const [stats, setStats] = useState<AdminStats | null>(null);

  const loadStats = useCallback(() => {
    adminApi.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 7000);
    return () => clearInterval(timer);
  }, [loadStats]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out of console');
    navigate('/admin/login');
  };

  const cards = [
    { label: 'New orders', value: stats?.pending ?? '—', icon: Bell, accent: 'text-amber-600 bg-amber-100' },
    { label: "Today's orders", value: stats?.todayOrders ?? '—', icon: ListOrdered, accent: 'text-blue-600 bg-blue-100' },
    { label: "Today's revenue", value: stats ? formatPrice(stats.todayRevenueCents) : '—', icon: DollarSign, accent: 'text-green-600 bg-green-100' },
    { label: 'Menu items', value: stats?.menuCount ?? '—', icon: UtensilsCrossed, accent: 'text-brand-600 bg-brand-100' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-stone-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><ShieldCheck size={18} /></span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold">Owner Console</p>
              <p className="text-xs text-stone-500">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost h-9 gap-1.5 text-sm"><ExternalLink size={15} /> <span className="hidden sm:inline">View site</span></Link>
            <span className="hidden text-sm text-stone-500 sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="btn-outline h-9 gap-1.5"><LogOut size={15} /> <span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="card flex items-center gap-4 p-5">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.accent}`}><c.icon size={20} /></span>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-stone-500">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 mb-6 flex gap-2 border-b border-stone-200 dark:border-stone-800">
          {([
            { key: 'orders', label: 'Orders', icon: ClipboardList },
            { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
          ] as const).map((t) => (
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

        {tab === 'orders' ? <OrdersPanel onChange={loadStats} /> : <MenuPanel onChange={loadStats} />}
      </main>
    </div>
  );
}

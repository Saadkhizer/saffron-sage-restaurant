import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useUiStore } from '../../store/uiStore';
import { useConfigStore } from '../../store/configStore';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu', end: false },
];

// The navbar is intentionally dark in BOTH light and dark mode — it acts as a
// consistent brand bar that sits cleanly over the dark hero and light pages alike.
const iconBtn =
  'grid h-10 w-10 place-items-center rounded-xl text-stone-300 transition hover:bg-white/10 hover:text-white';

export function Navbar() {
  const count = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const dark = useThemeStore((s) => s.dark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const openCart = useUiStore((s) => s.openCart);
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Crave It');
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-stone-950/85 text-white backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
            <UtensilsCrossed size={18} />
          </span>
          <span className="hidden sm:inline">{name}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-gold-400' : 'text-stone-300 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className={iconBtn}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={openCart} className={`relative ${iconBtn}`} aria-label={`Cart, ${count} items`}>
            <ShoppingBag size={18} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link to="/dashboard" className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-stone-200 hover:bg-white/10 hover:text-white">
                <UserIcon size={16} />
                <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className={iconBtn} aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <Link to="/menu" className="btn-primary hidden h-10 md:inline-flex">
            Order Now
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`${iconBtn} md:hidden`}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-200 hover:bg-white/10"
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-200 hover:bg-white/10"
                  >
                    My account
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gold-400 hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-1 w-full">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

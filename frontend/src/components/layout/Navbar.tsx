import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useUiStore } from "../../store/uiStore";
import { useConfigStore } from "../../store/configStore";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/menu", label: "Menu", end: false },
];

export function Navbar() {
  const count = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const dark = useThemeStore((s) => s.dark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const openCart = useUiStore((s) => s.openCart);
  const name = useConfigStore((s) => s.config?.restaurantName ?? "Smashed");
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream-50/85 backdrop-blur-md dark:border-stone-800/70 dark:bg-stone-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
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
                  isActive
                    ? "text-brand-700 dark:text-brand-400"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
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
            className="btn-ghost h-10 w-10 !px-0"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={openCart}
            className="btn-ghost relative h-10 w-10 !px-0"
            aria-label={`Cart, ${count} items`}
          >
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
              <Link to="/dashboard" className="btn-ghost h-10 gap-2">
                <UserIcon size={16} />
                <span className="max-w-24 truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-ghost h-10 w-10 !px-0"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-outline hidden h-10 md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <Link to="/menu" className="btn-primary hidden h-10 md:inline-flex">
            Order Now
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost h-10 w-10 !px-0 md:hidden"
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-200 md:hidden dark:border-stone-800"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    My account
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-700 hover:bg-stone-100 dark:text-brand-400 dark:hover:bg-stone-800"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-1 w-full"
                >
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

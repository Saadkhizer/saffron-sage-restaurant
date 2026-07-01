import { Link } from 'react-router-dom';
import { UtensilsCrossed, Facebook, Instagram, Twitter } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

export function Footer() {
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Saffron & Sage');
  return (
    <footer className="mt-20 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <UtensilsCrossed size={16} />
            </span>
            {name}
          </div>
          <p className="mt-3 max-w-xs text-sm text-stone-400">
            Chef-crafted dishes, delivered hot to your door or ready for pickup.
          </p>
          <div className="mt-4 flex gap-2">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="grid h-9 w-9 place-items-center rounded-full bg-stone-800 text-stone-300 transition hover:bg-brand-600 hover:text-white"
                aria-label="Social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li><Link to="/" className="hover:text-brand-400">Home</Link></li>
            <li><Link to="/menu" className="hover:text-brand-400">Menu</Link></li>
            <li><Link to="/dashboard" className="hover:text-brand-400">My orders</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Hours</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>Mon–Thu · 11am – 10pm</li>
            <li>Fri–Sat · 11am – 12am</li>
            <li>Sun · 12pm – 9pm</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>123 Garden Street</li>
            <li>hello@saffronsage.test</li>
            <li>+1 (555) 010-2030</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {name}. Demo project — not a real restaurant.
      </div>
    </footer>
  );
}

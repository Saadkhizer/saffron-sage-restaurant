import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Play, Leaf, ChefHat, Truck, ShieldCheck, Star, Quote } from 'lucide-react';
import type { MenuItem } from '../types';
import { menuApi } from '../api/endpoints';
import { MenuCard } from '../components/menu/MenuCard';
import { MenuCardSkeleton } from '../components/ui/Skeleton';
import { useConfigStore } from '../store/configStore';

const features = [
  { icon: Leaf, title: 'Fresh Ingredients', text: 'Sourced daily' },
  { icon: ChefHat, title: 'Expert Chefs', text: 'Passionate & skilled' },
  { icon: Truck, title: 'Fast Delivery', text: 'On time, every time' },
  { icon: ShieldCheck, title: '100% Quality', text: 'You can trust' },
];

const testimonials = [
  {
    quote:
      'The food is absolutely amazing! Every bite is full of flavor and freshness. Easily my favorite spot to order from.',
    name: 'Sophia Martinez',
    location: 'Los Angeles, CA',
  },
  {
    quote:
      'Great variety, excellent service, and super fast delivery. Saffron & Sage is my go-to for date nights in.',
    name: 'James Anderson',
    location: 'New York, NY',
  },
  {
    quote:
      'Fresh ingredients, perfect portions, and beautifully packed. You can taste the attention to detail.',
    name: 'Olivia Bennett',
    location: 'Chicago, IL',
  },
];

export function Home() {
  const name = useConfigStore((s) => s.config?.restaurantName ?? 'Saffron & Sage');
  const [popular, setPopular] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    menuApi
      .list()
      .then((items) => setPopular(items.filter((i) => i.popular).slice(0, 4)))
      .catch(() => setPopular([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/20" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Delicious. Fresh. Made for you.
            </p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
              Crave it.
              <br />
              Grab{' '}
              <span className="relative whitespace-nowrap text-brand-600">
                it.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-gold-500"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d="M2 9 Q 50 0 98 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-stone-600 dark:text-stone-300">
              Experience a delightful journey of flavors at {name} — made with fresh
              ingredients and a passion for perfection.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="btn-primary h-12 px-7 text-base">
                Explore Menu <ArrowRight size={18} />
              </Link>
              <a href="#dishes" className="btn-outline h-12 gap-2 px-6 text-base">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white">
                  <Play size={13} className="ml-0.5 fill-current" />
                </span>
                Watch Video
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="flex flex-col gap-1.5">
                  <f.icon size={22} className="text-brand-600" />
                  <p className="text-sm font-semibold leading-tight">{f.title}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{f.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto max-w-sm md:max-w-none"
          >
            <div className="aspect-square overflow-hidden rounded-full shadow-2xl ring-8 ring-white dark:ring-stone-900">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=70"
                alt="A fresh, beautifully plated dish"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement?.classList.add('bg-brand-100');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-2 left-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl dark:bg-stone-800 sm:left-0">
              <div className="flex -space-x-2">
                {['#fca5a5', '#fdba74', '#86efac', '#93c5fd'].map((c) => (
                  <span key={c} className="h-7 w-7 rounded-full border-2 border-white dark:border-stone-800" style={{ background: c }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm font-bold">
                  4.8k+
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-stone-500">Happy Customers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular dishes */}
      <section id="dishes" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Popular dishes</p>
            <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Our Most Loved Dishes</h2>
          </div>
          <Link to="/menu" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 sm:inline-flex">
            View Full Menu <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular === null
            ? Array.from({ length: 4 }).map((_, i) => <MenuCardSkeleton key={i} />)
            : popular.map((item) => <MenuCard key={item.id} item={item} />)}
        </div>
      </section>

      {/* Special offer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-10 text-white sm:px-12 sm:py-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-600/40 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Special offer</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Get 20% Off Your First Order!</h2>
              <p className="mt-2 max-w-md text-brand-100">
                Join {name} and enjoy delicious food at a special welcome price.
              </p>
              <Link to="/menu" className="btn-primary mt-6 bg-white !text-brand-700 hover:bg-cream-100">
                Order Now <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 border-dashed border-brand-400 font-display text-2xl font-bold sm:h-32 sm:w-32 sm:text-3xl">
              20% OFF
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">What our customers say</p>
        <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Loved By Thousands</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card flex flex-col p-6"
            >
              <Quote size={28} className="text-brand-300" />
              <blockquote className="mt-3 flex-1 text-sm text-stone-600 dark:text-stone-300">"{t.quote}"</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {t.name[0]}
                </span>
                <div>
                  <figcaption className="text-sm font-semibold">{t.name}</figcaption>
                  <p className="text-xs text-stone-500">{t.location}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="card flex flex-col items-center gap-5 bg-brand-50 p-8 text-center dark:bg-stone-900 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold">Stay Updated</h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Get special offers, new menu updates, and cooking tips in your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        toast.success('Subscribed! Check your inbox 🎉');
        setEmail('');
      }}
      className="flex w-full max-w-md gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="input flex-1"
        aria-label="Email address"
      />
      <button type="submit" className="btn-primary shrink-0">Subscribe</button>
    </form>
  );
}

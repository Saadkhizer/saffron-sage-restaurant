import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  Leaf,
  ChefHat,
  Truck,
  ShieldCheck,
  Star,
  Quote,
} from "lucide-react";
import type { MenuItem } from "../types";
import { menuApi } from "../api/endpoints";
import { MenuCard } from "../components/menu/MenuCard";
import { MenuCardSkeleton } from "../components/ui/Skeleton";
import { FoodImage } from "../components/ui/FoodImage";
import { formatPrice } from "../lib/format";
import { useConfigStore } from "../store/configStore";
import { imageUrl } from "../api/client";

const features = [
  { icon: Leaf, title: "Fresh Ingredients", text: "Sourced daily" },
  { icon: ChefHat, title: "Expert Chefs", text: "Passionate & skilled" },
  { icon: Truck, title: "Fast Delivery", text: "On time, every time" },
  { icon: ShieldCheck, title: "100% Quality", text: "You can trust" },
];

const testimonials = [
  {
    quote:
      "The food is absolutely amazing! Every bite is full of flavor and freshness. Easily my favorite spot to order from.",
    name: "Sophia Martinez",
    location: "Los Angeles, CA",
  },
  {
    quote:
      "Great variety, excellent service, and super fast delivery. Saffron & Sage is my go-to for date nights in.",
    name: "James Anderson",
    location: "New York, NY",
  },
  {
    quote:
      "Fresh ingredients, perfect portions, and beautifully packed. You can taste the attention to detail.",
    name: "Olivia Bennett",
    location: "Chicago, IL",
  },
];

export function Home() {
  const name = useConfigStore(
    (s) => s.config?.restaurantName ?? "Saffron & Sage",
  );
  const [popular, setPopular] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    menuApi
      .list()
      .then((items) => setPopular(items.filter((i) => i.popular).slice(0, 4)))
      .catch(() => setPopular([]));
  }, []);

  return (
    <div>
      {/* Hero — bold, dark, burger-forward */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
          <div className="absolute -right-10 top-1/3 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-semibold text-gold-400">
              <Flame size={14} /> Flame-grilled · Fresh · Bold
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.92] sm:text-6xl lg:text-7xl">
              Crave it.
              <br />
              Grab <span className="text-gold-400">it.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-stone-300">
              Juicy, stacked-to-order burgers and fast-food favorites at {name}{" "}
              — delivered hot and done your way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="btn-primary h-12 px-7 text-base">
                Order Now <ArrowRight size={18} />
              </Link>
              <a
                href="#dishes"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-base font-semibold text-white transition hover:bg-white/10"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-500 text-stone-900">
                  <ChevronDown size={16} />
                </span>
                See Popular Dishes
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="flex flex-col gap-1.5">
                  <f.icon size={22} className="text-gold-400" />
                  <p className="text-sm font-semibold leading-tight text-white">
                    {f.title}
                  </p>
                  <p className="text-xs text-stone-400">{f.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Burger + floating dish cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm md:max-w-none"
          >
            {/* glow behind the burger */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-600/50 to-gold-500/40 blur-3xl" />
            {/* burger displayed directly on the page — soft radial fade, no card frame */}
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85"
              alt="A juicy gourmet cheeseburger"
              className="relative aspect-square w-full scale-105 object-cover drop-shadow-2xl"
              style={{
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 47%, #000 55%, transparent 72%)",
                maskImage:
                  "radial-gradient(circle at 50% 47%, #000 55%, transparent 72%)",
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />

            {/* Delivery badge */}
            <div className="absolute right-0 top-6 rounded-2xl bg-white/10 px-4 py-2 text-center ring-1 ring-white/15 backdrop-blur">
              <p className="text-lg font-bold text-gold-400">30 Min</p>
              <p className="text-[11px] text-stone-300">Delivery</p>
            </div>

            {/* Floating popular items */}
            {popular?.slice(0, 2).map((it, i) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.15 }}
                className={`absolute flex items-center gap-2 rounded-2xl bg-white/10 p-2 pr-3 ring-1 ring-white/15 backdrop-blur ${
                  i === 0 ? "-left-2 bottom-16 sm:-left-6" : "bottom-2 right-2"
                }`}
              >
                <FoodImage
                  src={imageUrl(it.image)}
                  alt={it.name}
                  className="h-11 w-11 rounded-xl"
                />
                <div>
                  <p className="max-w-28 truncate text-xs font-semibold leading-tight text-white">
                    {it.name}
                  </p>
                  <p className="text-xs font-bold text-gold-400">
                    {formatPrice(it.priceCents)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular dishes */}
      <section
        id="dishes"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              <Flame size={15} /> Popular dishes
            </p>
            <h2 className="mt-1.5 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
              Our Most
              <br className="hidden sm:block" /> Loved Dishes
            </h2>
          </div>
          <Link
            to="/menu"
            className="hidden items-center gap-1 text-sm font-semibold text-gold-500 hover:gap-2 sm:inline-flex"
          >
            View Full Menu <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular === null
            ? Array.from({ length: 4 }).map((_, i) => (
                <MenuCardSkeleton key={i} />
              ))
            : popular.map((item) => <MenuCard key={item.id} item={item} />)}
        </div>
      </section>

      {/* Special offer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-10 text-white sm:px-12 sm:py-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-600/40 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">
                Special offer
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                Get 20% Off Your First Order!
              </h2>
              <p className="mt-2 max-w-md text-brand-100">
                Join {name} and enjoy delicious food at a special welcome price.
              </p>
              <Link
                to="/menu"
                className="btn-primary mt-6 bg-white !text-brand-700 hover:bg-cream-100"
              >
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
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          What our customers say
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          Loved By Thousands
        </h2>
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
              <blockquote className="mt-3 flex-1 text-sm text-stone-600 dark:text-stone-300">
                "{t.quote}"
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {t.name[0]}
                </span>
                <div>
                  <figcaption className="text-sm font-semibold">
                    {t.name}
                  </figcaption>
                  <p className="text-xs text-stone-500">{t.location}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="fill-amber-400 text-amber-400"
                    />
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
              Get special offers, new menu updates, and cooking tips in your
              inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        toast.success("Subscribed! Check your inbox 🎉");
        setEmail("");
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
      <button type="submit" className="btn-primary shrink-0">
        Subscribe
      </button>
    </form>
  );
}

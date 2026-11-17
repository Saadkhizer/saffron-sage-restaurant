import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  ArrowRight,
  ChevronDown,
  Clock,
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
      {/* ===== Hero ========================================================
          Light: warm porcelain "contemporary gourmet". Dark: warm obsidian
          "mood dining". The dish photo sits in an editorial rounded frame
          rather than a cut-out — the source image has a baked-in dark studio
          background, and masking it to a circle read as a flat sticker. Drop
          a transparent-background PNG into /public and the frame can become a
          free-floating cut-out without touching this layout.
      =================================================================== */}
      <section className="relative overflow-hidden bg-[#FAF8F5] text-neutral-900 transition-colors duration-300 dark:bg-[#0F0E0D] dark:text-neutral-100">
        {/* Ambient warmth: kitchen light pooling from above, a faint ember to
            the left, and a microscopic dot grid for texture. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-amber-100/60 via-transparent to-transparent dark:from-amber-500/[0.08]" />
          <div className="absolute -left-40 top-12 h-96 w-96 rounded-full bg-red-200/25 blur-3xl dark:bg-red-900/15" />
          <div
            className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 md:gap-10 md:py-24 lg:gap-16 lg:px-8">
          {/* ---------- Copy ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-red-700 shadow-sm shadow-neutral-900/5 backdrop-blur-md transition-colors duration-300 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:text-amber-400 dark:shadow-none">
                <Flame size={14} /> Flame-grilled · Fresh · Bold
              </span>
              {/* On phones the delivery promise rides here instead of floating
                  over the photo, so nothing covers the food. */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/90 px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm shadow-neutral-900/5 backdrop-blur-md transition-colors duration-300 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:text-neutral-200 dark:shadow-none md:hidden">
                <Clock size={14} className="text-red-700 dark:text-amber-400" />
                30 min delivery
              </span>
            </div>

            <h1 className="mt-6 font-display text-[2.75rem] font-bold uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
              Crave it.
              <br />
              Grab <span className="text-red-700 dark:text-amber-400">it.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600 transition-colors duration-300 dark:text-neutral-400 sm:text-lg">
              Juicy, stacked-to-order burgers and fast-food favorites at {name}{" "}
              — delivered hot and done your way.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-7 sm:w-auto text-base font-semibold text-white shadow-lg shadow-red-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-xl hover:shadow-red-700/30 active:translate-y-0"
              >
                Order Now <ArrowRight size={18} />
              </Link>
              <a
                href="#dishes"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-white/70 px-6 sm:w-auto text-base font-semibold text-neutral-800 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-neutral-900">
                  <ChevronDown size={16} />
                </span>
                See Popular Dishes
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="flex flex-col gap-1.5">
                  <f.icon size={22} className="text-red-700 dark:text-amber-400" />
                  <p className="text-sm font-semibold leading-tight">
                    {f.title}
                  </p>
                  <p className="text-xs text-neutral-600 transition-colors duration-300 dark:text-neutral-400">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ---------- Food ---------- */}
          <HeroVisual popular={popular} />
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

/* ---------------------------------------------------------------------------
   Hero visual: the framed dish photo, its ambient backlight and contact
   shadow, and the floating micro-cards.

   The gentle float runs through Framer Motion rather than CSS so it can stop
   when the hero scrolls out of view, and never starts at all for visitors who
   ask their OS to reduce motion.
--------------------------------------------------------------------------- */
function HeroVisual({ popular }: { popular: MenuItem[] | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const floating = inView && !reduceMotion;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative mx-auto w-full max-w-md md:max-w-none"
    >
      {/* Warm backlight, breathing slowly behind the plate */}
      <div aria-hidden className="pointer-events-none absolute -inset-8">
        <div className="hero-backlight absolute inset-0 animate-breathe" />
      </div>

      <motion.div
        animate={floating ? { y: [0, -14, 0] } : { y: 0 }}
        transition={
          floating
            ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4 }
        }
        className="relative"
      >
        {/* Organic contact shadow — grounds the frame instead of letting it
            hover in empty space. */}
        <div
          aria-hidden
          className="hero-contact-shadow pointer-events-none absolute -bottom-7 left-1/2 h-10 w-[72%] -translate-x-1/2"
        />

        <figure className="hero-frame group relative overflow-hidden rounded-[2.5rem] border border-neutral-200/60 bg-neutral-100 transition-colors duration-300 dark:border-neutral-800/60 dark:bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=90"
            alt="A flame-grilled smash burger stacked with melted cheddar, pickles and crisp lettuce"
            className="hero-photo aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] md:aspect-[4/5]"
          />
          {/* Depth: light pooling at the top, grounding at the bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 dark:from-black/50"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10"
          />
        </figure>

        {/* Delivery badge — floats at the frame's shoulder on desktop only;
            phones get the pill in the copy column instead. */}
        <div className="absolute -right-3 top-8 hidden rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-2.5 text-center shadow-lg shadow-neutral-900/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-2xl dark:shadow-black/40 md:block">
          <p className="text-lg font-bold leading-none text-red-700 dark:text-amber-400">
            30 Min
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Delivery
          </p>
        </div>

        {/* Dish chips float at the frame's corners on desktop */}
        {popular?.slice(0, 2).map((it, i) => (
          <DishChip
            key={it.id}
            item={it}
            delay={0.35 + i * 0.15}
            className={clsx(
              "absolute hidden max-w-[13rem] md:flex",
              i === 0 ? "-left-6 bottom-24" : "-right-5 bottom-6",
            )}
          />
        ))}
      </motion.div>

      {/* …and sit in a tidy row beneath it on phones, where overlapping would
          cover the food. */}
      <div className="mt-5 flex gap-3 md:hidden">
        {popular?.slice(0, 2).map((it, i) => (
          <DishChip
            key={it.id}
            item={it}
            delay={0.3 + i * 0.12}
            className="flex min-w-0 flex-1"
          />
        ))}
      </div>
    </motion.div>
  );
}

function DishChip({
  item,
  className,
  delay = 0,
}: {
  item: MenuItem;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={clsx(
        "items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/90 p-2 pr-4 shadow-lg shadow-neutral-900/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-2xl dark:shadow-black/40",
        className,
      )}
    >
      <FoodImage
        src={imageUrl(item.image)}
        alt={item.name}
        className="h-11 w-11 shrink-0 rounded-xl"
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-100">
          {item.name}
        </p>
        <p className="text-xs font-bold text-red-700 dark:text-amber-400">
          {formatPrice(item.priceCents)}
        </p>
      </div>
    </motion.div>
  );
}

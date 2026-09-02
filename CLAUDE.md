# CLAUDE.md — Crave It restaurant app

Full-stack restaurant ordering site used as a **client demo template** (current
prospect: Chicken Bureau, a late-night fast-food spot in Bahria Enclave, Islamabad —
pizzas, broast, wraps, wings; open till ~4 AM; WhatsApp 0339-6997733).

## Live + repo
- Live demo: https://saffron-sage-restaurant.onrender.com (Render Web Service,
  auto-deploys on every push to `main`)
- GitHub: `Saadkhizer/saffron-sage-restaurant` (private)

## Commands (run from THIS folder, the repo root)
- `npm run dev` — starts backend (:4500) **and** frontend (:5173) together
- `npm run seed` — reset + repopulate the SQLite DB (menu, categories, owner account)
- `npm run build` — seed + production build of the frontend
- `npm start` — production mode: Express serves API **and** built frontend on :4500
- Type-check: `cd frontend && npx tsc --noEmit`

## Architecture
- `backend/` — Express + **`node:sqlite`** (built-in; run with
  `--experimental-sqlite`; do NOT switch to better-sqlite3 — this machine has no
  native build toolchain). DB file: `backend/data/restaurant.db`. JWT auth
  (bcryptjs), Google ID-token verification, multer photo uploads to
  `backend/data/uploads/` served at `/uploads/`.
- `frontend/` — React 18 + TS + Vite, Tailwind v3, Zustand stores
  (`src/store/`), Framer Motion, react-hot-toast. Vite proxies `/api` and
  `/uploads` → :4500 in dev.

## Conventions (do not break)
- **All client-visible config comes from `GET /api/config` at runtime** (name,
  currency, delivery fee, Google client id) — sourced from `backend/.env`. Never
  hardcode these in the frontend or bake them in at build time.
- Prices are **integer cents** everywhere; format with `src/lib/format.ts`.
  Currency currently PKR / Rs.
- Order totals are **recomputed server-side** from DB prices — never trust client
  prices.
- Users have a `role` column: `customer` | `owner`. Owner-only API lives under
  `/api/admin/*` (requireAuth + requireRole('owner')).
- Order status is **owner-driven**: pending → preparing (accept) →
  on_the_way/ready → delivered, or rejected. No time-based auto-advance.
- Tailwind config changes (new palette keys) require a **dev-server restart**.

## Key routes
- Customer: `/`, `/menu`, `/login`, `/signup`, `/checkout`, `/order/:id`,
  `/dashboard`
- Owner: `/owner` (landing) → `/admin/login` (dark page) → `/admin` (console:
  stats, order accept/reject/advance, menu CRUD + photo upload)
- Owner login (seeded): `owner@saffronsage.test` / `owner123` — change before
  production.

## Design
Bold dark burger theme: near-black hero, uppercase "Crave it. Grab it." headline,
gold accents, burger image masked directly onto the page, floating dish cards.
Dark mode is the default; navbar is always dark in both modes. Brand palette =
deep warm red (`brand`, 600=#b83a2e) + `gold` + `cream` in
`frontend/tailwind.config.js`. Headings: Playfair Display; body: Inter.

## Deployment notes
- `render.yaml` at root; root package.json has `postinstall` (installs both
  subapps), `build`, `start` — the plain defaults work even if Render ignores
  render.yaml. Must be a **Web Service** (a Static Site cannot run the backend).
- Free tier: sleeps after 15 min (30–60 s cold start); **SQLite DB and uploaded
  photos are wiped on every redeploy** (build re-seeds). Production needs a
  persistent disk or external image storage.
- Google sign-in: button renders only when `GOOGLE_CLIENT_ID` is set in
  `backend/.env` (or Render env var); each deployed origin must be added to the
  OAuth client's Authorized JavaScript origins in Google Cloud Console.
- `backend/.env` is git-ignored — never commit it; `.env.example` is the template.

## Git habits used here
Stage by feature group, descriptive commit messages, verify `.env` isn't staged,
push to `origin main` (which triggers the Render deploy).

# Saffron & Sage — Restaurant Ordering Website

A full-stack, fully responsive restaurant site: browse a categorized menu, build a
persisted cart, sign in, and place a delivery/pickup order with live order tracking.

```
restaurant-app/
├── backend/     Node + Express REST API, SQLite (node:sqlite), JWT + Google auth
└── frontend/    React + TypeScript + Vite, Tailwind, Zustand, Framer Motion
```

## Tech stack

**Frontend** — React 18 (function components + hooks), TypeScript, React Router,
Tailwind CSS, Zustand (cart / session / theme / UI state), Framer Motion, react-hot-toast,
@react-oauth/google.

**Backend** — Node + Express, SQLite via the built-in `node:sqlite` (no native build),
JWT sessions, bcryptjs password hashing, Google ID-token verification.

## Features

- **Auth** — email/password sign-up & login, optional Google sign-in, JWT sessions,
  protected routes (checkout, dashboard).
- **Menu** — categories, search, filtering, "popular" badges, image fallbacks.
- **Cart** — add / remove / quantity, live subtotal, persisted in `localStorage`.
- **Checkout** — delivery vs. pickup, contact + address, mock card / cash payment,
  server-side price recomputation, delivery fee, ETA.
- **Orders** — confirmation screen, live order-status tracking (timeline auto-advances),
  full order history.
- **Dashboard** — profile editing, saved addresses, order history.
- **UX** — dark mode, loading skeletons, error/empty states, toasts, animations,
  keyboard-accessible, responsive on mobile / tablet / desktop.

## Running locally

You need **two terminals** (backend API + frontend dev server).

### 1. Backend (port 4500)

```bash
cd backend
npm install
npm run seed     # create + populate the SQLite database (one time)
npm run dev      # starts the API on http://localhost:4500
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev      # starts Vite on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend,
so no extra configuration is needed.

## Configuration

All client-visible config (restaurant name, currency, delivery fee, Google client id)
is served at runtime from `GET /api/config` — there are **no build-time secrets in the
frontend**. Edit `backend/.env` (copy from `backend/.env.example`):

| Variable             | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `JWT_SECRET`         | Signing secret for session tokens                    |
| `GOOGLE_CLIENT_ID`   | Enables the "Continue with Google" button (optional) |
| `RESTAURANT_NAME`    | Brand name shown across the UI                        |
| `CURRENCY_SYMBOL`    | e.g. `$`, `£`, `Rs`                                   |
| `DELIVERY_FEE_CENTS` | Delivery fee in minor units (cents)                  |

### Enabling Google sign-in

1. Create an OAuth 2.0 **Web** client at the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add `http://localhost:5173` to **Authorized JavaScript origins**.
3. Put the client id in `backend/.env` as `GOOGLE_CLIENT_ID=...` and restart the API.

The button appears automatically once a client id is configured; the credential is
verified server-side at `POST /api/auth/google`.

## API overview

| Method | Path                  | Auth | Description                     |
| ------ | --------------------- | ---- | ------------------------------ |
| GET    | `/api/config`         | —    | Runtime client config          |
| POST   | `/api/auth/signup`    | —    | Create account                 |
| POST   | `/api/auth/login`     | —    | Email/password login           |
| POST   | `/api/auth/google`    | —    | Google sign-in                 |
| GET    | `/api/auth/me`        | ✓    | Current user                   |
| PUT    | `/api/auth/me`        | ✓    | Update profile                 |
| GET    | `/api/menu`           | —    | List menu (`?category=&search=`) |
| GET    | `/api/menu/categories`| —    | List categories                |
| GET    | `/api/orders`         | ✓    | Order history                  |
| POST   | `/api/orders`         | ✓    | Place an order                 |
| GET    | `/api/orders/:id`     | ✓    | Single order (with live status)|
| GET/POST/DELETE | `/api/addresses` | ✓ | Saved addresses              |

> Demo project — payments are mocked and no real charge is made.

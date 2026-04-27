# QueueSetu Auth Integration Guidelines

## Overview

This document describes the auth API integration layer added to connect the Next.js client to the **queuesetu BFF** (Backend For Frontend). It covers the file structure, conventions, and patterns used — follow these when adding future feature integrations.

---

## Architecture

```
Next.js Client
      │
      ▼
src/lib/api/auth.ts        ← fetch wrapper calling queuesetu BFF
      │
      ▼
queuesetu BFF (localhost:8080)
      │
      ▼
user microservice (localhost:8085)
```

---

## Files Added / Changed

### New files

| Path                                           | Purpose                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/api/auth.ts`                          | Typed fetch functions for all `/api/auth/*` BFF endpoints         |
| `src/store/use-auth-store.ts`                  | Zustand store (persisted to `localStorage`) holding user + tokens |
| `src/components/dashboard/UserProfileCard.tsx` | Profile display card with logout action                           |
| `src/app/dashboard/page.tsx`                   | Server component shell for the dashboard route                    |
| `src/app/dashboard/DashboardClient.tsx`        | Protected client component — redirects to `/login` if no session  |
| `.env.local`                                   | `NEXT_PUBLIC_API_BASE_URL` pointing to `http://localhost:8080`    |

### Updated files

| Path                                   | Change                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/components/auth/LoginForm.tsx`    | Wired to `authApi.login` + `authApi.me`; stores session via `useAuthStore`; redirects to `/dashboard` |
| `src/components/auth/RegisterForm.tsx` | Wired to `authApi.signUp` then auto-login; same redirect flow                                         |
| `src/components/layout/Navbar.tsx`     | Auth-aware: shows user greeting + Logout when logged in; shows Login + Get Started when not           |

---

## API Layer Convention (`src/lib/api/`)

- One file per bounded domain (`auth.ts`, future: `queue.ts`, `booking.ts`, etc.)
- All types are exported inline — no separate types file for small domains
- A shared `request<T>()` helper handles `Content-Type`, error extraction, and JSON vs plain-text responses
- Base URL pulled from `process.env.NEXT_PUBLIC_API_BASE_URL` with fallback to `http://localhost:8080`

```ts
// Pattern for adding a new API domain
export const featureApi = {
  list: () => request<ListResponse>("/api/feature"),
  create: (body: CreateRequest) =>
    request<FeatureResponse>("/api/feature", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
```

---

## Auth Store Convention (`src/store/use-auth-store.ts`)

- Zustand `persist` middleware stores state under the `qs-auth` localStorage key
- Exposes `user`, `accessToken`, `refreshToken`
- `setAuth(user, accessToken, refreshToken)` — called after login/register
- `clearAuth()` — called on logout

### Hydration pattern

Because Zustand persist rehydrates asynchronously, **always guard server-rendered pages** with a hydration check before reading auth state:

```tsx
const [hydrated, setHydrated] = useState(false);
useEffect(() => {
  setHydrated(true);
}, []);

// Only redirect / render after hydration
useEffect(() => {
  if (hydrated && !user) router.replace("/login");
}, [hydrated, user]);
```

---

## Protected Page Pattern

Use the split `page.tsx` (server) + `*Client.tsx` (client) convention:

```
app/dashboard/
  page.tsx          ← Server component: exports metadata, renders <DashboardClient />
  DashboardClient.tsx ← "use client": hydration guard + route protection
```

This keeps metadata (SEO) in the server component while auth logic stays in the client component.

---

## Error Display Convention

Inline error banners use a consistent destructive style:

```tsx
{
  error && (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {error}
    </div>
  );
}
```

Place the banner **above** the form, **inside** `CardContent`.

---

## Environment Variables

| Variable                   | Default                 | Description                   |
| -------------------------- | ----------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Base URL of the queuesetu BFF |

Set in `.env.local` for local development. Override per environment in deployment.

---

## Auth Flow

### Login

1. `POST /api/auth/login` → `{ accessToken, refreshToken, email, role }`
2. `GET /api/auth/me` (with `Bearer <accessToken>`) → full user object
3. `useAuthStore.setAuth(user, accessToken, refreshToken)`
4. `router.push("/dashboard")`

### Register

1. `POST /api/auth/sign-up` → user object
2. Auto-login (same steps as Login above)
3. `router.push("/dashboard")`

### Logout

1. `POST /api/auth/logout` (with `Bearer <accessToken>`) — server invalidates token
2. `useAuthStore.clearAuth()` — wipes localStorage
3. `router.push("/login")`

### Token Refresh (future)

Use `authApi.refresh({ refreshToken })` → update store with new tokens.

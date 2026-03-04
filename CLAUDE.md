# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Type-check + production build
npm run preview      # Preview production build at localhost:4173
npm run test         # Run unit tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Lint (Dashboard components only — see ESLint note below)
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format src/**
npm run type-check   # TypeScript check without emitting
npm run e2e          # Run all Playwright e2e tests
npm run e2e:headed   # Run e2e tests with visible browser
```

Run a single unit test file:
```bash
npx vitest run src/__tests__/MyComponent.test.tsx
```

Run a specific e2e filter:
```bash
npm run e2e:list     # Only listing tests
npm run e2e:create   # Only create tests
```

## Architecture Overview

**Tech stack:** React 18, TypeScript, Vite, MUI v5 + Emotion, Tailwind CSS v4, React Router v7, Axios, Formik + Yup, Framer Motion, Vitest, Playwright.

**Path alias:** `@` maps to `./src`.

### Two Routing Modes

The app detects subdomains at runtime in `src/App.tsx`:
- **Subdomain** (e.g., `my-business.example.com`) → renders `PublicWebsite` component only
- **Main domain** → full SPA with two layout groups:
  - `MainLayout` (Navbar + Footer): public pages — `/`, `/about`, `/listings`, `/directory`, `/contact`, `/pricing`, `/site/:slug`, etc.
  - `AuthDashboardLayout` (no chrome): `/auth`, `/dashboard/*`, `/dashboard/websites/:id/editor`, `/template-preview/:id`, `/dashboard/stores/create`

### Context Provider Hierarchy

`main.tsx` wraps: `MUI ThemeProvider` → `I18nProvider` → `FeatureFlagsProvider` → `ABTestProvider`

`App.tsx` wraps: `AuthProvider` → `ThemeProvider` → `CookieConsentProvider` → `ListingsProvider` → `DashboardProvider` → `PendingCounterProvider`

### Authentication

Auth is handled via **httpOnly cookies** exclusively — no tokens in localStorage. All axios requests use `withCredentials: true` (set globally in `AuthContext`). The `useAuth()` hook (from `src/context/AuthContext.tsx`) exposes all auth operations. The `token` field in context is always `null` (deprecated).

Backend API defaults to `http://localhost:5001/api`. Set `VITE_API_URL` env var to override.

### User Roles

Defined in `src/constants/roles.ts` as the single source of truth: `USER`, `CONTENT_CREATOR`, `ADMIN`, `SUPER_ADMIN`. Use `isAdmin()`, `isSuperAdmin()`, `isContentManager()` helpers rather than comparing role strings directly. The canonical `User` type lives in `src/types/user.ts`.

### Key Data Flow

- `ListingsContext` (`src/context/ListingsContext.tsx`) fetches and caches `Place` objects (business listings) from `GET /api/places`. It is prefetched on app init via `AppRoutes`.
- `PublicWebsite` (`src/pages/PublicWebsite.tsx`) fetches a white-labeled website by slug from `GET /api/websites/slug/:slug`, then renders pages as ordered `Block[]` via `BlockRenderer`.

### ESLint Scope

ESLint is **intentionally scoped** to `src/components/Dashboard/**` and `src/pages/Dashboard/**` only — the rest of the codebase is excluded. New code outside Dashboard won't be linted automatically.

### Testing

- Unit tests: Vitest + jsdom + Testing Library. Setup file at `src/test/setup.ts` mocks `localStorage`, `sessionStorage`, `matchMedia`, `IntersectionObserver`, `ResizeObserver`.
- E2E tests: Playwright via `e2e/run-all.mjs` orchestrator. Test suites are in `e2e/tests/`.

### Build Chunking

`vite.config.ts` manually splits chunks: `react-core`, `mui`, `maps` (leaflet + react-simple-maps), and `animations` (framer-motion + tsparticles).

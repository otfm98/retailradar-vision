# ARCHITECTURE.md

*System map for RetailRadar. Read this after `PROJECT_CONTEXT.md`. A new contributor should be able to orient within thirty minutes of reading this.*

## Overview

RetailRadar is currently a single-page React application with no backend of its own. It runs as a TanStack Start SSR app: the server renders the shell and initial HTML, the client hydrates, and all data — both live external API calls and mock forecast data — is fetched or computed client-side. There is exactly one route (`/`). The architecture today is best understood as three layers of maturity stacked in the same page, not three separate systems: a working live-data layer, a scaffolded-but-fake prediction layer, and a set of gaps (backend, auth, model, POS) that don't exist yet.

## Major components

| Component | Path | Responsibility |
|---|---|---|
| SSR entry | `src/server.ts` | Default `fetch()` handler; delegates to TanStack Start's server entry; normalizes catastrophic SSR errors into an HTML error page |
| Start middleware | `src/start.ts` | `createStart()` instance with server-side error middleware catching unhandled throws |
| Router factory | `src/router.tsx` | `getRouter()` — instantiates `QueryClient` and the TanStack Router from the generated route tree |
| Route tree (generated) | `src/routeTree.gen.ts` | Auto-generated. Do not hand-edit — regenerate via the TanStack CLI/dev server |
| Root shell | `src/routes/__root.tsx` | HTML document shell, `QueryClientProvider`, global 404/error boundaries |
| Dashboard page | `src/routes/index.tsx` | The only route (`/`). Composes `Header`, `MetricCard`s, `PredictorChart`, `LiveDataPanel` |
| Header | `src/components/dashboard/Header.tsx` | Sticky nav, sector dropdown (UI-only, no data effect yet) |
| Metric cards | `src/components/dashboard/MetricCard.tsx` | Reusable KPI display; currently fed hardcoded strings |
| Forecast chart | `src/components/dashboard/PredictorChart.tsx` | 6-month forecast area chart (Recharts) with a client-side "optimism" slider; data is a hardcoded array, not a model |
| Live data panel | `src/components/dashboard/LiveDataPanel.tsx` | Three React Query-backed cards pulling real external data |
| Live data fetchers | `src/lib/liveData.ts` | Sole owner of all external API calls: URLs, request logic, SDMX/JSON parsing, response types |
| UI primitives | `src/components/ui/*` (~45 files) | shadcn/Radix components; only a handful (`card`, `badge`, `button`, `slider`, `dropdown-menu`) are actually used today |
| Error handling (server) | `src/lib/error-capture.ts`, `src/lib/error-page.ts` | Global error listeners and a static HTML fallback page for SSR failures |
| Standalone trend script | `sales_trend_tool/sales_trend_analysis.py` | Offline Python script — loads a CSV, computes variance/7-day averages, plots a chart. Not imported by, or connected to, the web app in any way |

## Core data flows

### 1. Page load → SSR → hydration

Browser requests `/` → `src/server.ts` delegates to the TanStack Start server entry → `src/start.ts`'s error middleware wraps the request → `src/router.tsx` builds a fresh `QueryClient` and router from `routeTree.gen.ts` → `__root.tsx` renders the HTML shell and wraps the page in `QueryClientProvider` → `routes/index.tsx` renders `Dashboard`. On the client, the same router/query-client setup hydrates and the page becomes interactive. There is no server-side data loading (no route loaders, no server functions) — everything happens after hydration, client-side.

### 2. Live external data (the one real integration)

`LiveDataPanel.tsx` fires three parallel `useQuery` calls (React Query), each calling into `src/lib/liveData.ts`:

- `fetchAbsCpi()` → `GET https://data.api.abs.gov.au/rest/data/ABS,CPI,...` — parses SDMX-JSON, returns `{ latestPeriod, latestValue, previousValue, changePct, series }`.
- `fetchQldRetailDatasets()` → `GET https://www.data.qld.gov.au/api/3/action/package_search` (CKAN).
- `fetchGoldCoastDatasets()` → `GET https://opendata.arcgis.com/api/v3/datasets` (ArcGIS Hub).

All three are direct browser-side `fetch` calls — no backend proxy, no API key storage (ABS technically requires a key per the provider docs, though the current implementation doesn't appear to send one — worth confirming when the backend is built and keys need a home). Results are cached client-side by React Query (`staleTime` 30–60 min), rendered as loading/error/value states in `AbsCard`-style components inside `LiveDataPanel`.

### 3. Mock forecast (not yet a real flow)

`PredictorChart.tsx` holds a hardcoded `BASE` array (`{ month, value }[]`, Aug–Jan revenue in AUD thousands). The "optimism" slider scales these values client-side via `useMemo`. Nothing here reads from `liveData.ts` or from any model output. This is the component that Phase-4-forward work (a real backend + model) needs to replace.

### 4. Sector selection (currently inert)

`Header.tsx` renders a sector dropdown; `index.tsx` holds the selection in `useState`. It only updates display text (header label, hero subtitle) — it does not filter the chart, the KPI cards, or the live API queries. Worth deciding, when the model exists, whether sector should become a real query parameter across all three live fetchers plus the eventual forecast endpoint.

## Data shapes

- **`AbsCpiResult`, `QldDatasetResult`, `GoldCoastDatasetResult`** (`src/lib/liveData.ts`) — the only typed, real data shapes in the codebase today. These are the shapes any future backend/model integration should either reuse or explicitly supersede, since `LiveDataPanel` already knows how to render them.
- **Mock forecast shape**: `{ month: string, value: number }[]` — implicit, defined inline in `PredictorChart.tsx`, not extracted to a shared type. When a real forecasting endpoint exists, this shape (or its replacement) should be formalized and shared between backend and frontend.
- **CSV shape** (`sales_trend_tool/sample_sales_data.csv`): `date, target, actual` — used only by the standalone Python script; not currently connected to any shape used by the web app.
- **No global state shape exists.** There is no Zustand/Redux store and no app-level React Context beyond the QueryClient provider. Any future cross-cutting state (selected sector affecting multiple components, auth state, etc.) has no home yet — this is a real design decision for the backend/model phase, not an oversight to silently work around.

## Integration points

| Integration | Status | Failure mode today |
|---|---|---|
| ABS Data API (CPI, SDMX) | Real, client-side | No retry-with-backoff beyond React Query's default retry(1); no server-side fallback; a CORS or ABS-side outage shows an inline error card, nothing more |
| QLD Open Data (CKAN) | Real, client-side | Same pattern as above |
| Gold Coast Open Data (ArcGIS Hub) | Real, client-side | Same pattern as above |
| TRA Online / I-Tracks | Not integrated | Subscription-gated, no public REST API — would need a different access pattern (manual export / scheduled internal ingestion) than the others |
| economy.id / Local Footprints | Not integrated | Dashboard-delivered, no public developer API found — same caveat as TRA |
| CBRE / NAB commercial data | Not integrated | Static reports only, no developer endpoint — likely never a live integration in the current form |
| Internal POS system | Not integrated (medium-term) | Distinct trust boundary from the public APIs above — will need its own auth model and almost certainly a backend, since POS data shouldn't be fetched client-side |
| Lovable error telemetry | Real but slated for removal | `window.__lovableEvents.captureException` — tied to the Lovable scaffold being phased out |

**The structural gap underlying all of the above:** every current integration is a direct browser `fetch`, which only works for public, CORS-permissive, keyless (or client-safe-key) APIs. ABS, QLD, and Gold Coast happen to fit that today. TRA, economy.id, CBRE/NAB, and POS do not and cannot — they will require a real backend to hold credentials, handle auth, and proxy requests server-side. This is the single biggest architectural decision the next phase of work needs to make: standing up that backend is a prerequisite for nearly everything on the strategic roadmap in `PROJECT_CONTEXT.md`, not an optional nice-to-have.

## Seam candidates (formalized in `STABLE_SEAMS.md`)

Flagged here, finalized in Phase 5: `routeTree.gen.ts`, `__root.tsx`, `router.tsx`, `server.ts`, `start.ts`, `vite.config.ts`, `styles.css`, `lib/utils.ts`, `lib/liveData.ts`, `components/ui/button.tsx` and `card.tsx`, `lib/error-page.ts`.

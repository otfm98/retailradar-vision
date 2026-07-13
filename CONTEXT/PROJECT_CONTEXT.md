# PROJECT_CONTEXT.md

*Last updated: 2026-07-13. This is the seed document — read this first, before any other file in `/context/`.*

## What this project is

RetailRadar is a sales-forecasting dashboard for the furniture retail industry, focused on the Gold Coast / Queensland region. It aggregates public, government, and (eventually) commercial and internal data sources to predict potential sales for a location over the coming months.

Data sources, phased:

- **Now (integrated or targeted near-term):** ABS Retail Trade Turnover & CPI (SDMX API), Queensland Government Open Data (CKAN API), City of Gold Coast Open Data (ArcGIS Hub API).
- **Prospective (access not yet confirmed):** Tourism Research Australia (TRA Online / I-Tracks — subscription, not a public REST API), economy.id / Local Footprints (NIEIR modeling, typically dashboard-delivered, no public API), commercial real estate and banking data (CBRE, NAB — gated, static reports only, no developer endpoints).
- **Medium-term:** internal POS data from the author's employer, once that integration is in scope. This is architecturally distinct from the external market-data sources above — different trust boundary, different auth model — and should be designed for as a separate integration point even before it's built.

## Where it is now

Early product development stage. No production users, no real forecasting model yet. The project began as a Lovable-scaffolded prototype and is now being developed solely through Cursor and Claude; Lovable is not part of the ongoing stack.

**What's real:**
- Three live data fetchers (`src/lib/liveData.ts`) pulling ABS CPI, QLD Open Data, and Gold Coast ArcGIS data via direct browser-side `fetch`, wired through React Query, rendered in `LiveDataPanel.tsx`.

**What's scaffolded but not real:**
- `PredictorChart.tsx` — a 6-month forecast chart with a hardcoded `BASE` array and a client-side "optimism" slider. No actual model behind it.
- KPI cards in `index.tsx` — hardcoded strings, not derived from data.

**What doesn't exist yet:**
- A backend of any kind (all external calls are direct client-side fetch, CORS-dependent)
- A forecasting model
- Auth, env config, tests, CI/CD
- POS integration
- Any commercial data source integration

## Team and territory

Solo project — one person owns product, data, and development. No territory split. The dual-sign-off waiver for stable seams (see `STABLE_SEAMS.md`) applies: changes proceed on the author's own review, no second approver required.

## The codebase at a glance

Stack: React 19 + TanStack Start (SSR) + TanStack Router (file-based routing) + TanStack React Query + shadcn/ui (Radix primitives) + Tailwind CSS 4. Built with Vite 8 / Nitro 3, package-managed with Bun. TypeScript throughout the app (`src/`); a small, currently disconnected Python script (`sales_trend_tool/`) does standalone CSV trend analysis and is not wired to the web app.

Single route today: `/` (`src/routes/index.tsx`), rendering the `Dashboard` component (header, KPI cards, `PredictorChart`, `LiveDataPanel`).

Key files a new contributor (human or AI) should know about first:
- `src/lib/liveData.ts` — the one place that owns all external API calls, parsing, and response types.
- `src/routes/__root.tsx` / `src/router.tsx` — app shell and QueryClient wiring; every page depends on these.
- `vite.config.ts` — build/SSR config; still carries Lovable-specific plugin wiring pending cleanup.

Near-term cleanup (tracked in `TECH_DEBT.md` once drafted): remove Lovable-specific artifacts — `.lovable/`, `src/lib/lovable-error-reporting.ts`, the Lovable comment block in `vite.config.ts`, and the Lovable git-history warning in `AGENTS.md`. None of this is load-bearing; the underlying stack (React/TanStack/shadcn) is being kept as-is.

## Strategic direction

Success over the next 1–3 months: a working prototype **deployed to production** that forecasts potential sales with reasonable accuracy — not just a local demo. That means, roughly in order of dependency:

1. Stand up a real backend (currently everything is client-side, CORS-dependent fetch — this won't scale to a forecasting pipeline or hold API keys safely).
2. Replace the mock `PredictorChart` data with an actual forecasting model fed by the live data sources already integrated.
3. Deploy to production.
4. Layer in additional data sources (commercial and, later, POS) as access and integration bandwidth allow.

## Current sprint / phase

*No active sprint defined yet. This section will be populated once work resumes past the bootstrap process — see `IN_FLIGHT.md`.*

## How to use this document

Read this first in any new session. It should answer "what is this and where does it stand" without needing to read code. For system structure and data flow detail, go to `ARCHITECTURE.md`. For non-negotiable rules, `RULES.md`. For high-blast-radius files and how to touch them safely, `STABLE_SEAMS.md`. For the enforcement mechanism behind those rules, `gates.yaml` and the seam-enforcement companion doc.

## Companion documents

- `ARCHITECTURE.md` — system map, components, data flows, integration points
- `STABLE_SEAMS.md` — high-blast-radius files and handling rules
- `RULES.md` — non-negotiables, enforced where possible by gates
- `ARCHITECTURE_DECISIONS.md` — append-only decision log
- `TECH_DEBT.md` — known issues not yet fixed
- `IN_FLIGHT.md` — active/paused/recently completed work
- `gates.yaml` — the gate registry (Phase 12)
- `trellis_v0.3_seam_enforcement.md` — the seam-guard companion artifact

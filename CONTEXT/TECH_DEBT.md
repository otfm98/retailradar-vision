# TECH_DEBT.md

_Real problems knowingly deferred, not aspirational improvements. Each item is something we're choosing not to fix right now, with enough detail that fixing it later doesn't require re-discovering the problem._

## Index

| ID          | Severity | Area     | Status  | Description                                                                      |
| ----------- | -------- | -------- | ------- | -------------------------------------------------------------------------------- |
| BACKEND-01  | HIGH     | Backend  | PARTIAL | ABS CPI proxied via `/api/abs/cpi`; QLD/GC still client-side                     |
| BACKEND-02  | HIGH     | Backend  | PARTIAL | `.env.example` + `.gitignore` conventions established; `ABS_API_KEY` server-only |
| DATA-01     | HIGH     | Data     | OPEN    | Forecast and KPI data is hardcoded/mock, not visibly labeled as such             |
| DATA-02     | MEDIUM   | Data     | OPEN    | ABS API key handling unconfirmed                                                 |
| INFRA-01    | MEDIUM   | Infra    | OPEN    | No tests anywhere in the repo                                                    |
| INFRA-02    | MEDIUM   | Infra    | OPEN    | No CI/CD configured                                                              |
| FRONTEND-01 | LOW      | Frontend | OPEN    | Sector selector is UI-only, has no effect on data                                |
| FRONTEND-02 | LOW      | Frontend | OPEN    | ~45 shadcn primitives scaffolded, most unused                                    |
| CLEANUP-01  | LOW      | Cleanup  | OPEN    | Lovable-specific artifacts still present                                         |
| PYTHON-01   | MEDIUM   | Python   | OPEN    | `sales_trend_tool/` has no `requirements.txt`                                    |
| PYTHON-02   | LOW      | Python   | OPEN    | Python trend tool is fully disconnected from the web app                         |

---

### BACKEND-01 — No backend exists

**Severity:** HIGH · **Owner:** unassigned · **Status:** PARTIAL

ABS CPI is now proxied server-side (`GET /api/abs/cpi` → `src/lib/absCpi.server.ts`). QLD Open Data and Gold Coast ArcGIS remain direct browser-side fetch in `liveData.ts`. A forecasting model endpoint and credentialed sources (TRA, POS) still need a fuller backend.

**Why it matters:** Blocks nearly every item on the strategic roadmap in `PROJECT_CONTEXT.md`. This is the prerequisite, not a parallel task.

**Suggested fix:** Extend the server-route pattern to remaining integrations and eventually host the forecasting model.

### BACKEND-02 — No env config / secret storage

**Severity:** HIGH · **Owner:** unassigned · **Status:** PARTIAL

`.env.example` documents `ABS_API_KEY` (server-only, no `VITE_` prefix). `.gitignore` excludes `.env` / `.env.*` while keeping `.env.example` tracked. `absCpi.server.ts` reads `process.env.ABS_API_KEY` when set.

**Why it matters:** Every credentialed integration (TRA, POS, and possibly ABS depending on DATA-02) is blocked until this exists.

**Suggested fix:** Extend env conventions as additional credentialed sources are proxied.

### DATA-01 — Mock data not labeled

**Severity:** HIGH · **Owner:** unassigned · **Status:** OPEN

`PredictorChart.tsx`'s forecast values and the KPI cards in `index.tsx` are hardcoded, with no visual indication to a viewer that they're not real. This violates RULES.md rule 4.

**Why it matters:** Anyone looking at the dashboard today — including a future stakeholder demo — could mistake mock output for a real forecast. Real risk of misleading someone, even accidentally.

**Suggested fix:** Add a visible "sample data" badge to both components until real data replaces them.

### DATA-02 — ABS API key handling unconfirmed

**Severity:** MEDIUM · **Owner:** unassigned · **Status:** OPEN

The ABS Data API documentation indicates a key is required; `fetchAbsCpi()` in `liveData.ts` doesn't appear to send one. It's currently working, which suggests either the key isn't actually enforced for this endpoint, or requests are being rate-limited/degraded without an obvious failure.

**Why it matters:** Could silently break, or already be operating in a degraded/throttled mode.

**Suggested fix:** Confirm against current ABS API docs whether a key is required for this specific endpoint; if so, this becomes part of BACKEND-02's scope rather than a separate fix.

### INFRA-01 — No tests

**Severity:** MEDIUM · **Owner:** unassigned · **Status:** OPEN

No test files, no test runner configured in `package.json`. The `/api/abs/cpi` endpoint shipped without tests (explicitly out of scope for the BACKEND-01 proof-of-pattern).

**Why it matters:** Accepted per RULES.md rule 14 for existing code; the floor going forward is that new backend/model work ships with tests. Flagging here so it isn't silently forgotten as "someday" debt.

**Suggested fix:** Pick a test runner (Vitest is the natural fit given the Vite-based toolchain) when backend work continues, not before it's needed.

### INFRA-02 — No CI/CD

**Severity:** MEDIUM · **Owner:** unassigned · **Status:** OPEN

Nothing in the repo configures CI. This also blocks Phase 12/13's gate wiring — gates need somewhere to run in CI, not just locally.

**Why it matters:** Local-only enforcement (lint, tests, seam guard) is bypassable (`--no-verify`); per RULES.md, CI is meant to be the real enforcement layer.

**Suggested fix:** Add a minimal GitHub Actions setup (lint + build, at minimum) as part of Phase 13's repo setup, ahead of the fuller `gates.yaml` wiring.

### FRONTEND-01 — Sector selector has no effect

**Severity:** LOW · **Owner:** unassigned · **Status:** OPEN

`Header.tsx`'s sector dropdown updates `useState` in `index.tsx`, which only changes display text — it doesn't filter the chart, KPI cards, or any of the three live queries.

**Why it matters:** Currently just an incomplete feature, not a bug — but worth deciding intentionally (make it real, or remove it) rather than leaving it looking functional when it isn't.

**Suggested fix:** Defer until the backend/model exists and sector can become a real query parameter end-to-end.

### FRONTEND-02 — Unused shadcn primitives

**Severity:** LOW · **Owner:** unassigned · **Status:** OPEN

~45 shadcn/Radix components are scaffolded in `src/components/ui/`; only `card`, `badge`, `button`, `slider`, and `dropdown-menu` are actually used.

**Why it matters:** Minor bundle/maintenance overhead, not urgent. Per ADR-001, this was an accepted consequence of keeping the scaffold.

**Suggested fix:** No action needed unless bundle size becomes a real concern; prune opportunistically if a component is clearly never going to be used.

### CLEANUP-01 — Lovable artifacts remain

**Severity:** LOW · **Owner:** unassigned · **Status:** OPEN

`.lovable/`, `src/lib/lovable-error-reporting.ts`, the Lovable plugin comment block in `vite.config.ts`, and the Lovable git-history warning in `AGENTS.md` are all still present despite Lovable being dropped from the stack (ADR-001).

**Why it matters:** Not load-bearing, but leaves stale/confusing context for future sessions about what the actual toolchain is.

**Suggested fix:** Remove in one small, low-risk PR — good first task to warm up the Plan/Execute gate on.

### PYTHON-01 — No requirements.txt

**Severity:** MEDIUM · **Owner:** unassigned · **Status:** OPEN

`sales_trend_tool/sales_trend_analysis.py` implicitly depends on pandas and matplotlib with no `requirements.txt` capturing that.

**Why it matters:** Blocks RULES.md rule 8; makes the script non-reproducible for anyone (including future-you on a new machine).

**Suggested fix:** Generate a `requirements.txt` from the current working environment before any further work touches this script.

### PYTHON-02 — Python tool fully disconnected

**Severity:** LOW · **Owner:** unassigned · **Status:** OPEN

`sales_trend_tool/` has no import bridge to the web app; it reads a static CSV and writes a PNG locally.

**Why it matters:** Not a bug — it may simply be a scratch analysis tool. Worth an explicit decision (integrate it, or keep it as a standalone utility) rather than it drifting indefinitely.

**Suggested fix:** No fix needed yet; revisit once model/backend work starts, since its trend logic may or may not be relevant to the real forecasting approach.

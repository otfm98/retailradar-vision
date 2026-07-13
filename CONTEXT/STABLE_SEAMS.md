# STABLE_SEAMS.md

*High-blast-radius files in RetailRadar. This list is deliberately short — if most of the codebase ended up here, the concept would stop being useful. Each entry below has specific, actionable handling guidance. The enumerated paths between the markers are also the direct input to the seam-guard gate (Phase 12) — do not add prose or commentary inside the marker block itself.*

<!-- SEAMS:START -->
src/routeTree.gen.ts
src/routes/__root.tsx
src/router.tsx
src/server.ts
src/start.ts
vite.config.ts
src/lib/liveData.ts
src/lib/utils.ts
<!-- SEAMS:END -->

## Why each one is a seam

| File | Why it's a seam | Who depends on it | Safe changes | Risky changes |
|---|---|---|---|---|
| `src/routeTree.gen.ts` | Auto-generated routing spine. Every route in the app resolves through it. | The router, every page | None — this file should never be hand-edited | Any manual edit. Regenerate via the TanStack dev server/CLI instead, never by hand |
| `src/routes/__root.tsx` | Wraps every page: HTML shell, `QueryClientProvider`, global 404/error boundaries. | Every route in the app, present and future | Adding new global providers additively; tweaking error UI copy | Changing the `QueryClientProvider` setup, removing/reordering boundaries, altering the HTML shell structure |
| `src/router.tsx` | Single factory for the router and `QueryClient`; defines the shape of router context every route can access. | Every route, `__root.tsx` | Adjusting `QueryClient` default options (staleTime, retry) | Changing the router `context` shape — this is a contract every route implicitly relies on |
| `src/server.ts` | SSR entry point. Owns error normalization for every server response. | Every server-rendered request | Adding logging inside existing error paths | Changing how catastrophic SSR errors are caught or rendered — a mistake here breaks error handling for the entire app, silently |
| `src/start.ts` | Registers request-level error middleware globally for TanStack Start. | Every server request | — | Removing or narrowing the middleware's error catch scope |
| `vite.config.ts` | Owns build/SSR plugin wiring. Currently still carries Lovable-specific config pending cleanup (see `PROJECT_CONTEXT.md`). | The entire build and dev server | Removing the Lovable-specific plugin block (tracked cleanup) | Changing the TanStack Start / Nitro target config without testing both `dev` and `build` |
| `src/lib/liveData.ts` | Sole owner of every external API call: URLs, request logic, SDMX/JSON parsing, response types. | `LiveDataPanel.tsx`, and every future consumer of ABS/QLD/Gold Coast data | Adding a new fetcher function for a new data source | Changing an existing fetcher's return shape without updating every consumer; changing parsing logic for SDMX/CKAN/ArcGIS responses without verifying against live API responses |
| `src/lib/utils.ts` | The `cn()` helper (clsx + tailwind-merge), imported by roughly 42 files across `src/components/ui/`. | Nearly every UI primitive | Adding new unrelated utility functions to the file | Changing `cn()`'s behavior — it would silently affect styling across almost the entire UI kit |

## The rules

- **Declare before touching.** Before starting work on a seam file, say so — in a commit message, a PR description, or (for solo work) a note in `IN_FLIGHT.md`.
- **Announce in the PR.** The PR description must name which seam(s) it touches and why.
- **Dual sign-off.** Normally, a second contributor reviews any change to a seam file before merge.
- **One contributor at a time.** Seam files should not have concurrent in-flight changes from multiple people.
- **Phased refactors.** Large changes to a seam land in phases, each independently mergeable and revertable, not as one large rewrite.
- **Backward compatibility at phase boundaries.** Each phase of a seam refactor keeps the rest of the app working — don't leave the seam in a half-migrated state between commits.

### Dual sign-off waiver

This is a solo project (see `PROJECT_CONTEXT.md`). The dual-sign-off rule above is **waived** — there is no second contributor to provide it. In its place: seam changes still get the "declare before touching" and "announce" treatment (a note in `IN_FLIGHT.md` and a clear commit message), and still go through the Plan/Execute gate (Phase 7 of the operational loop) rather than being made ad hoc. If a collaborator joins the project later, dual sign-off should be reinstated for seam files at that point.

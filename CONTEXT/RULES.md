# RULES.md

*Non-negotiables for RetailRadar. Claude loads this before every session and treats it as overriding its own judgment — including its own instinct to be "helpful" by cutting a corner. Every rule here passes the test: would this be enforced on a colleague's PR? For a solo project, read "colleague" as "your own future self reviewing this in three months with no memory of today's context."*

*Rules marked **[GATE-A]** or **[GATE-B]** are mechanically enforced once Phase 12 compiles them into `gates.yaml`. Rules marked **[JUDGMENT]** stay prose-only — see Phase 12 for why judgment rules are deliberately never mechanized.*

## General rules

1. **No secret or API key is ever committed to the repo, hardcoded in source, or logged.** `[GATE-B]` — a secret-scanning pre-commit check once one exists. Right now no keys are in use client-side; this rule exists ahead of the backend work where it'll start mattering.
2. **No new external data integration ships without updating `ARCHITECTURE.md`'s integration points table in the same PR.** `[JUDGMENT]` — keeps the architecture doc from silently going stale, which the methodology treats as worse than not having the doc at all.
3. **A failing gate is authoritative.** If a gate blocks a commit, fix the cause — don't bypass with `--no-verify` as a substitute for fixing it, and don't argue with the gate. `[JUDGMENT]`, but this is the rule that makes all the other gates worth having.
4. **Mock or hardcoded data must be visibly labeled as such in the UI** (e.g. a "sample data" badge) until it's replaced with a real source. `[JUDGMENT]` — currently violated by `PredictorChart.tsx` and the KPI cards in `index.tsx`; tracked in `TECH_DEBT.md`.

## Per-language rules

### TypeScript
5. **`strict` mode in `tsconfig.json` stays on.** No loosening it to silence errors faster. `[GATE-A]` — bound to `tsc --noEmit` in CI.
6. **ESLint must pass with zero errors before merge.** Warnings are acceptable to ship with a tracked follow-up; errors are not. `[GATE-A]` — bound to the existing `eslint.config.js` / `lint` script.
7. **Prettier formatting is applied before commit, not argued about in review.** `[GATE-A]` — bound to the existing `format` script; consider a pre-commit hook once `.githooks/` exists (Phase 13).

### Python
8. **The `sales_trend_tool/` script gets a `requirements.txt`** before any further work is done on it or it's connected to anything else. `[JUDGMENT → becomes GATE-A once requirements.txt exists]` — currently missing entirely; flagged in the audit.
9. **If/when the Python trend logic is integrated with the web app, it happens through a defined interface (an API endpoint from the future backend, or a scheduled export), never by having the frontend shell out to a Python process directly.** `[JUDGMENT]`

## Per-layer rules

### Frontend / UI
10. **New UI primitives come from the existing shadcn set in `src/components/ui/` before reaching for a new library.** ~45 primitives are already scaffolded; most are unused but available. `[JUDGMENT]`
11. **No component makes its own direct `fetch()` call.** All external data access goes through `src/lib/liveData.ts` (or its eventual backend-calling successor), so there is one place that owns URLs, parsing, and types. `[JUDGMENT]` — this is what keeps `liveData.ts` a clean seam rather than a leaky one.

### Data / backend (forward-looking — no backend exists yet, rules apply from the point one is stood up)
12. **Any credential-requiring data source (TRA, economy.id, CBRE/NAB, POS) is proxied through the backend. It is never called directly from the client**, regardless of how convenient a client-side call looks in the moment. `[JUDGMENT, becomes structurally enforced once the backend exists — see ARCHITECTURE.md's integration points section]`
13. **The forecast/model output has a defined, versioned response shape** that the frontend consumes — not an ad hoc object shape that changes silently between sessions. `[JUDGMENT]`

## Stable seams

Verbatim from `STABLE_SEAMS.md` — the seam list and its handling rules are non-negotiable and repeated here as the canonical short form:

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

Declare before touching. Announce in the PR (or `IN_FLIGHT.md` entry, for solo work). Dual sign-off is waived for this solo project — see `STABLE_SEAMS.md` for the full waiver terms. Phased refactors; backward compatibility preserved at every phase boundary. `[GATE-B]` — the seam-guard commit-msg hook, once Phase 12/13 stand it up.

## The testing floor

14. **There are no tests in the repo today. This is accepted debt, not silently ignored debt** — tracked explicitly in `TECH_DEBT.md`. The floor going forward: any new backend endpoint or forecasting logic ships with at least one test covering its core behavior before merge. Existing frontend code is not retroactively required to reach this bar yet. `[GATE-B once a test command exists]`
15. **No test is deleted or skipped to make a build pass without a corresponding note in `TECH_DEBT.md` explaining why.** `[JUDGMENT]`

## Context discipline

16. **Every session starts by reading `PROJECT_CONTEXT.md`, then only the other context files actually relevant to the work at hand** — not the entire `/context/` folder by default. See section 8 of the Trellis methodology (progressive discovery). `[JUDGMENT]`
17. **Never guess at codebase state.** If a session needs to know whether something exists or how something currently works, read the file or search the docs — don't assume based on what "should" be there. `[JUDGMENT]`
18. **Session-end always writes a short summary** (to `docs/sessions/`, once Phase 13 sets that up) so the next session isn't reconstructing state from memory. `[JUDGMENT]`

## Territory boundaries

Not applicable — solo project, no territory split. Revisit this section if a collaborator joins.

## Branches and merges

19. **Feature work happens on a branch, not directly on the integration branch**, even solo — this keeps the seam-guard and CI gates meaningful and gives you a real diff to review before merging into yourself. `[JUDGMENT]`
20. **Branch protection / required CI status checks on the integration branch are enabled only with explicit sign-off**, per Phase 12 — for a solo project, that sign-off is just a deliberate decision, not a rubber stamp, since it changes your own workflow friction. `[JUDGMENT]`
21. **`routeTree.gen.ts` is never committed with manual edits** — if it doesn't match what the router would regenerate, that's a bug to fix, not a diff to accept. `[GATE-B candidate]` — a regeneration-diff check once `.githooks/` exists.

---

*Revisit note: several rules above (8, 12, 13, 14) are stack-best-practice defaults rather than rules grounded in an observed failure yet, since this is a young project. Revisit after the first real sprint of backend/model work and sharpen or cut anything that turns out to be aspirational rather than enforced.*

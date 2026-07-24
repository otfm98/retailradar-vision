# IN_FLIGHT.md

_Active work registry. One entry per active branch. Update at phase boundaries (start, plan approved, mid-implementation, done). Close an entry by moving it to "Recently completed" on merge — don't just delete it._

## Conventions

- One entry per active branch, not per task — if a branch covers several small tasks, list them together under that entry.
- Update this file at phase boundaries: when work starts, when a Plan/Execute plan is approved, at any major milestone, and on completion.
- Close on merge: move the entry from **Active** to **Recently completed**, keep a one-line note of what shipped.
- If work stalls for a reason outside your control (blocked on API access, waiting on a decision), move it to **Paused / blocked** with the reason — don't leave it silently rotting in Active.

## Active work

**Phase 13 — Claude project setup (manual, claude.ai)**
**Status:** In progress — repo side complete; Claude.ai UI steps remain
**What:** Create a Claude Project for RetailRadar, paste the instruction prompt (see below), upload the core four docs, wait for sync.
**Checklist:**

- [ ] Create project at claude.ai → Projects → New project (name: `RetailRadar`)
- [ ] Paste instruction prompt into Project Instructions
- [ ] Upload: `CONTEXT/PROJECT_CONTEXT.md`, `CONTEXT/ARCHITECTURE.md`, `CONTEXT/RULES.md`, `CONTEXT/STABLE_SEAMS.md`
- [ ] Wait for project knowledge sync to finish before first session

## Paused / blocked

_None._

## Recently completed

**Branch:** `feat/gates-pre-commit-hooks` → merged to `main` (`d61a772`)
**Shipped:** `gates.yaml` gate registry (Phase 12) and `.githooks/pre-commit` with eslint/prettier/tsc, secret scan, and seam guard. `core.hooksPath` set to `.githooks` locally.

**Branch:** `feat/abs-cpi-backend-proxy` — done
**Seams touched:** `src/lib/liveData.ts` (ABS fetcher only — client now calls proxy; parsing moves server-side)
**Why:** BACKEND-01/02 proof-of-pattern; proxy ABS CPI through server route while QLD/GC stay client-side

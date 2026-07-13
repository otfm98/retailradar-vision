# ARCHITECTURE_DECISIONS.md

*Append-only decision log. Add a new entry when a real choice is made between options, it's likely to be referenced again, and a future contributor (including future-you) might revisit it without the original context. Do not edit or delete past entries — supersede them instead.*

## Format reference

Each entry:

```
## ADR-NNN: <short title>

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN
**Date:** YYYY-MM-DD

**Context.** What situation forced a decision.

**Decision.** What was chosen.

**Alternatives considered.** What else was on the table, and why it lost.

**Consequences.** What this makes easier, what it makes harder, what debt it creates.
```

**Status values:**
- **Proposed** — under discussion, not yet acted on
- **Accepted** — decided and in effect
- **Deprecated** — no longer recommended, but not actively replaced
- **Superseded by ADR-NNN** — explicitly replaced by a later decision; the old entry stays in place with this status, for history

## Index

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Keep the TanStack Start/React/shadcn scaffold instead of rebuilding | Accepted | 2026-07-13 |

---

## ADR-001: Keep the TanStack Start/React/shadcn scaffold instead of rebuilding

**Status:** Accepted
**Date:** 2026-07-13

**Context.** RetailRadar began as a Lovable-scaffolded prototype. The project owner is moving to a Cursor + Claude-only workflow and is not attached to the current stack or codebase — a from-scratch rebuild was genuinely on the table during the Trellis bootstrap's Phase 2 codebase audit.

**Decision.** Keep the existing stack — React 19, TanStack Start (SSR), TanStack Router, TanStack React Query, shadcn/ui, Tailwind CSS 4, Vite/Nitro, Bun — and remove only the Lovable-specific surface area (`.lovable/`, `src/lib/lovable-error-reporting.ts`, the Lovable plugin block in `vite.config.ts`, the Lovable git-history warning in `AGENTS.md`).

**Alternatives considered.** Starting the frontend fresh with a different stack chosen directly in Cursor/Claude. Rejected because: the stack itself is solid and unremarkable-in-a-good-way for this use case (typed routing, SSR, good data-fetching primitives); the three working live-data integrations (ABS, QLD, Gold Coast) already solve real problems (CORS, SDMX parsing, response typing) that a rebuild would re-solve for no benefit; and the actual hard, unbuilt work — a backend and a forecasting model — doesn't depend on which frontend scaffold sits on top of it.

**Consequences.** Near-term cleanup task to strip Lovable artifacts (tracked in `PROJECT_CONTEXT.md` and `TECH_DEBT.md`). The project inherits ~45 largely-unused shadcn UI primitives, which is a mild bulk cost but not a real liability. Any future stack regret is now scoped to "we chose to keep an existing scaffold" rather than "we never considered the alternative" — this entry is the record if that gets revisited.

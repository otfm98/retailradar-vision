# IN_FLIGHT.md

*Active work registry. One entry per active branch. Update at phase boundaries (start, plan approved, mid-implementation, done). Close an entry by moving it to "Recently completed" on merge — don't just delete it.*

## Conventions

- One entry per active branch, not per task — if a branch covers several small tasks, list them together under that entry.
- Update this file at phase boundaries: when work starts, when a Plan/Execute plan is approved, at any major milestone, and on completion.
- Close on merge: move the entry from **Active** to **Recently completed**, keep a one-line note of what shipped.
- If work stalls for a reason outside your control (blocked on API access, waiting on a decision), move it to **Paused / blocked** with the reason — don't leave it silently rotting in Active.

## Active work

*None. The Trellis bootstrap itself is in progress but isn't tracked here — this registry starts recording work once the bootstrap completes and real implementation work begins (see TECH_DEBT.md for the likely first candidates: BACKEND-01 and DATA-01 are the natural first branch).*

## Paused / blocked

*None.*

## Recently completed

*None yet. First real entries will land once implementation work starts post-bootstrap.*

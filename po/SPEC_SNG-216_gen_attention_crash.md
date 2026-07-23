# SPEC — SNG-216: recordAttention throws on a boolean `_gen` — travel to any generated place breaks bookkeeping
## Aevi (PO) · 2026-07-22 · verified at origin with a live stack trace + the malformed data

> **Erik, live:** told the GM to walk to Stillwater's Trouble, confirmed the travel modal, and the turn
> showed *"the scene stands, but part of this turn's bookkeeping didn't land — the GM will restate it next
> beat."* A small error on a normal travel action.

## §1 — Verified: the exact throw, and it's systemic in the save
The salvage message (app.js:7193) fires on `turn._applyFailed` — set when `applyTurn` THROWS mid-application
(app.js:3215). The engine correctly preserves the narration (Design Law 5) and flags the loss. Silas's save
recorded the actual throw in `_turnApplyError`:
> `Cannot create property 'engagementScore' on boolean 'true'`
> `at recordAttention (generate.js:341) ← noteGeneratedAttention (app.js) ← applyTurn`

**Root cause — a malformed `_gen`, verified across the whole save:** EVERY generated location has
`_gen: true` (a boolean) instead of the tracking OBJECT `recordAttention` expects:
- `gen-waygate._gen = true`
- `gen-center._gen = true`
- `gen-the-ent-grove._gen = true`
- `gen-ashwarden-march-road._gen = true`
- `gen-stillwater-s-trouble._gen = true`  ← the one Erik traveled to

`recordAttention` (generate.js:400) guards `if (!g) return` — but `true` is truthy, so the guard PASSES,
then `g.engagementScore = ...` throws on the boolean. **The guard checks PRESENCE, not TYPE.**

## §2 — Why this explains three things at once
1. **The salvage message** Erik saw: recordAttention threw → applyTurn threw → `_applyFailed` → the italic
   "bookkeeping didn't land" line. Working as designed (it caught the crash and kept the narration) — but a
   crash it shouldn't have hit.
2. **The location desync (SNG-210) RE-EXPLAINED:** the throw happened DURING applyTurn, so the ops after it —
   INCLUDING the moveTo/location commit to Stillwater's Trouble — never ran. `currentLocationId` is still
   `the_crossing`. So the "GM narrates travel but location doesn't commit" symptom has (at least) this
   concrete cause: a mid-apply throw aborts the commit. The Crossing/Cairnhold desync may be the same crash,
   earlier.
3. **Travel to ANY generated (`gen-`) place is affected** — every gen-location has the malformed `_gen`, so
   every arrival at one fires recordAttention and throws. This isn't Stillwater-specific; it's every
   generated destination. Given the living-world generates locations constantly, this is a HIGH-frequency
   break.

## §3 — Two fixes, both needed
### §3a — Harden the guard (stops the crash immediately)
`recordAttention` must guard TYPE, not just presence:
`const g = entity?._gen; if (!g || typeof g !== "object") return entity;`
(Same for any sibling reader that assumes `_gen` is an object — `attentionForGM`, `recomputeTier`, the
promotion readers at generate.js:420/428.) This makes a malformed `_gen` a no-op instead of a throw — the
turn's bookkeeping completes, the location commits, no salvage message. **This alone unbreaks travel.**

### §3b — Fix the DATA + the writer that made `_gen: true` (stops it recurring)
Hardening the reader stops the crash but leaves attention-tracking silently DEAD on every existing
gen-location (a `true` `_gen` can't accumulate engagement, so those places never promote toward canon). Need:
- **Find the writer** that persists `_gen` as `true` instead of the object. Somewhere a generated location is
  serialized/re-hydrated with `_gen` collapsed to a boolean (likely a save/normalize/merge pass that treated
  `_gen` as a flag). Trace how a gen-location's `_gen` becomes `true` — probably normalizeInventory-style
  location normalization or a merge that did `_gen: !!entity._gen`.
- **A reconcile/backfill** for existing saves: where `_gen === true`, replace with a fresh default tracking
  object (`{engagementScore: 0, tier: "fresh", attentionHistory: [], createdDay: <known or null>}`) so
  attention tracking resumes. Same pattern as prior backfill passes.

## §4 — Erik's immediate save
Once §3a ships, traveling again works. For the STUCK location right now (still `the_crossing`), Erik asks the
GM to reanchor to Stillwater's Trouble (reanchorLocation, per SNG-207) OR just re-issues the travel once the
crash is fixed — the second travel will commit cleanly. ⚠️ Don't hand-edit the save (LLW — it's the volatile
layer); fix via the live path.

## GUARDS
- **Type-guard every `_gen` reader** — not just recordAttention; audit generate.js for `entity._gen.<field>`
  access that assumes object shape. One malformed field shouldn't be able to throw from multiple sites.
- **The reader-harden is the urgent half** — it unbreaks travel today; the data-fix + writer-trace stops the
  silent-dead-tracking and the recurrence. Ship 3a first if splitting.
- **Design Law 5 already held** — the narration was preserved; this doesn't touch that. We're stopping the
  crash that made the salvage fire, not the salvage itself (which did its job).

## OPEN QUESTIONS — CCODE ROUND 2
1. Where does `_gen` become `true`? Likely a save/serialize/merge step that flattened the object to a flag.
   (Grep for `_gen:` assignments and `_gen =` in app.js + the save/normalize path.) This is the writer bug
   under the reader crash.
2. Is `_gen: true` a MIGRATION artifact (an old save shape where `_gen` was a boolean flag, later made an
   object) that a hydrate step should upgrade? If so the backfill is a version-migration, not a one-off.
3. Any OTHER `_gen` reader that assumes object shape and could throw (recomputeTier, tier/threshold readers)?
   Harden them in the same pass so a stray boolean can't crash from a different call site next.

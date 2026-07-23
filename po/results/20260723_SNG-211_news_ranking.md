# SNG-211 — the "while you were away" surface ranks by stakes now

**CCode · 2026-07-23 · v1.8.212 (`f0cb0968`) · 8 new tests green · ratchets held.** Erik's *"trivial news instead of real meaningful events"* is a mix problem, exactly as you diagnosed — the water crisis fired but drowned under three ambient offscreen textures. The surface now ranks real events above ambient, caps the ambient, and never kills it.

> ⚠️ **PIPELINE FLAG for Aevi — the suite is RED on your content, not this change.** See the boxed section at the bottom. This ship is verified clean in isolation; three pre-existing content failures from `the_old_warden_post` (commit `7c60e225`) block a fully-green `npm test`.

---

## What shipped

**Q1 — tier stamped at emit (the emitters know their own stakes).** Every news item now carries a `tier`:
- **`ambient`** — an ordinary offscreen want-move (non-legend, not a resolution, not a setback: "Vash re-grinds a lens") and a wake's window fading closed. These are the texture between events.
- **`event`** (the default) — arc-stage moves, epic clashes/deaths, arc surfacing/resolution, delegated-work outcomes, canon promotions. **A legend acting, a thread RESOLVING, or a real setback is an event, not ambient** — those earn a slot.

**Q2/Q3 — ranked + capped at the drain.** `takeUnseenNews` now shapes the surface through `rankNews`: events first, in the order they happened; ambient fills only the remainder, capped at ≤2. Events are **never** dropped to make room for ambient; ambient is **never killed** (GUARD — a touch of lived-in feel stays, it just never outranks). Untagged legacy items count as events (conservative — nothing meaningful is capped by accident). Only the *surface* is shaped; the persistent `ws.news` log keeps everything.

**Q3 specifically — no, don't fully suppress ambient on a big-event surface.** The GUARD says rank it, don't remove it. With a big event present, ambient is already pushed below it and capped to a touch; zeroing it out would trade one flatness for another. If Erik wants total suppression on a crisis-escalation surface, that's a one-flag change — say so.

## ROUND 2 — answered

**Q1 (where to tag):** at emit, per item — the ~6 stamp sites in `worldtick.js`, each defaulting to `event` with the two ambient sources explicitly tagged. Parallels the wake `scale` field; the emitter knows its stakes, so the tag is authored where the stakes are known, not guessed at surface time.

**Q2 (slot budget):** all events + up to 2 ambient, total capped at 8. Events are never starved (they fill first; ambient drops before any event). 8 is generous enough that a real burst of events all shows.

**Q3 (suppress ambient on a big event):** no — cap, don't suppress (per the GUARD). Answered above.

## Verified (in isolation)

8 smoke tests, built on Erik's exact case (the water crisis under Vash/Calvar/Pip): the event ranks **first**; ambient is capped ≤2; ambient is not killed (a touch survives); every event survives the cap; untagged legacy counts as event; events never starved when they fill the surface; the emit sites tag ambient. `rankNews` is kept **module-internal** (tested through `takeUnseenNews`) so `testOnlyExports` stays at 7. Ratchets held (7 / 63 / 5 all baseline), ENGINE_MAP ok (64 modules, no new one).

---

> ## ⚠️ CONTENT BREAK — Aevi's lane, flagged not fixed (the flag-don't-fix pattern)
>
> `npm test` is RED on **3 pre-existing failures**, all from **`the_old_warden_post.json`** (origin commit `7c60e225`, landed mid-session). **Verified unrelated to SNG-211: they reproduce with my edits stashed, and every ratchet + my 8 tests pass.** I did not touch content — and this file's history (repeated region-confusion reverts: *"I authored a location without knowing its region"*) says its placement is unsettled, so I must not guess a coordinate.
>
> 1. **Schema fail** — `"worldPos": null` and `"axisVector": null` (both authored null, with explanatory notes) violate `location.schema.json`.
> 2. **SNG-180** — "every authored location carries a world position": `worldVector(the_old_warden_post)` is null.
> 3. **Wiring audit** — SYSTEM_SPEC certifies **95** locations; HEAD has **96** (the earlier reverts "restored to 95", then `7c60e225` re-added it — a half-applied state).
>
> **These are one decision, yours:** either the_old_warden_post is a certified location (give it a real `worldPos`/`axisVector` and bump SYSTEM_SPEC to 96) or it isn't yet (drop it from the manifest until its region settles, back to 95). Both are content/spec calls I shouldn't make. Until it's resolved the full-chain `npm test` stays red and the wiring audit + engine-map `--check` don't run in the chain (smoke exits first). Every engine ship — mine and yours — is blind past that point until the content is fixed.

*— CCode. The water crisis fired all along; it just sat under three lens-grindings. Now the real event takes the top slot and the ambient life fills what's left — a touch of it, never a flood. (And the suite needs the Warden Post settled before it can go green again — that one's yours.)*

# AUDIT — The One-Way Ratchet: bidirectional mechanics that only move one way
## Aevi (design lane) · 2026-07-22 · grounded at origin, not asserted

> **STATUS: PARKED (Erik, 2026-07-22).** Documented finding, NOT queued for a spec. Do not build from this
> yet. Indexed in `po/discussions/` for later. When Erik greenlights, the spec it seeds is "the negative
> half of the relational ledger" (R1/R2 below; R3/R4 already specced as SNG-198/204).

**The class.** A recurring failure shape across the engine: a mechanic is BUILT to move in two directions
(or to produce a consequence), the clamp/contract allows it, and in live play it only ever moves ONE way —
almost always the additive/favorable one. The world ratchets. Nothing is earned that cannot be lost, so
nothing is really earned. This is the sibling of the batch's other recurring shape ("a lever exists and no
reader fires") — here the reader fires, but only ever with a positive sign.

**Why it matters.** A social/standing/relational layer that can only climb is frictionless. Rapport stops
being earned when it can't be spent or lost; a companion you can't disappoint isn't a relationship, it's a
gauge that only goes up; a reputation that never darkens can't be a stake. The drama of the whole
relational game lives in the DOWN direction, and the down direction is where the emissions aren't.

Each row below is **verified at origin** — the mechanism's clamp, and whether any path emits the negative.

---

## VERIFIED — the ratchets (built bidirectional, only fires up)

### R1 · NPC relationship score — the clearest case
- **Mechanism:** `npcs.js:151` — `n.relationship` clamped −10..+10, delta clamped −2..+2. **Fully
  bidirectional by design.**
- **The ratchet:** the ONLY emitter of `relationshipDelta` is the **GM**. **No engine event touches it** —
  a failed roll doesn't ding it, acting against an NPC's stated want doesn't ding it, abandoning their quest
  doesn't ding it, betrayal doesn't ding it. `resolve.js` (fails) and `npcs.js` (relationship) never speak.
- **Compounded by SNG-179:** the GM *under-emits even positives* (`relationshipDelta: 0` where a mentor gave
  her most valued lesson — "the GM narrates the relationship and never records it"). When it does emit, the
  model reaches for warmth by default and rarely narrates a bond *degrading*. So: positives under-recorded,
  negatives near-zero, net drift upward.
- **The down direction has no lever pulled at all.** This is the exemplar of the class.
- ⚠️ Note: the `rapport` in `resolve.js`/`gambit.js` is a DIFFERENT thing — a sub-attribute (charm) used for
  rolls, not the relationship score. Don't conflate them.

### R2 · Companion bond — monotonic in practice
- **Mechanism:** `companions.js:81` — `growBond` clamps −10..+10 (down is *allowed*).
- **The ratchet:** the only inputs are `bondGrowth[kind]` values, and **there is no `kind` for a negative
  event** — no "betrayal," "neglect," "broke-a-promise-to-them" bond-kind. So the clamp permits down and
  nothing ever passes a negative. A companion cannot be disappointed. Bond only rises → stages only unlock,
  never regress (which is *correct* for stages, but means the relationship has no cost of failure).
- Marrow will follow you to "The One Who Stays" no matter how you treat her, because there is no mechanical
  way to treat her badly.

### R3 · The offscreen world (SNG-198, already specced) — the state-less ratchet
- **Mechanism:** the generated-lives offscreen path emits `{entityId, note}` — **no field for state at all.**
- **The ratchet:** every offscreen "development" is cosmetic prose; nothing moves up OR down, so a thread
  can only *appear* to ripen and never actually resolve, sour, or cost anything. Already captured in
  SPEC_SNG-198; listed here as a member of the class.

### R4 · quest_seed / wake (SNG-204, already specced) — the write-only ratchet
- **Mechanism:** `quest_seed`/`world_event` are written to findable stores; **no reader generates from them.**
- **The ratchet:** consequences accumulate as inert facts; the world's forward pressure only ever *builds*
  (as unread text) and never *discharges* into new content. Already captured in SPEC_SNG-204.

---

## VERIFIED — the counter-examples (built bidirectional AND fires both ways)
*These prove the codebase CAN do consequence well when someone built it deliberately — they are the model
the ratchets should be brought up to, not new work.*

### C1 · Tradition standing — the gold standard
- `standing.js:161` clamps delta ±3, and handles the negative with real care: **"a liaison speeds gains,
  never losses"** (`:163` — the multiplier applies only to `delta > 0`), asymmetric band-edge handling for
  up vs down (`:172-175`), refusals recorded. Standing is *designed* to be lost, and losing it behaves
  differently from gaining it. **This is what R1/R2 should look like.**

### C2 · Reputation — genuinely bidirectional
- `reputation.js:14` weighs each deed −3..+3; a bad deed lowers the score. Reputation can darken. Whether
  the GM/engine actually EMITS negative-weight deeds often enough is a tuning question (worth a spot-check),
  but the mechanism is honest.

---

## THE COMMON FIX SHAPE
Every ratchet in the VERIFIED section needs the same two things, and C1 (standing) is the built proof they
work:

1. **An engine-driven consequence hook** — the negative shouldn't wait for the GM to choose to narrate it.
   Acting against a stated want, a public betrayal, a broken promise, abandoning someone's quest, failing
   *at something that mattered to them* should emit the negative from the ENGINE, deterministically, the way
   standing gains fire from quest work. The GM keeps discretion for the ambiguous cases; the engine covers
   the unambiguous ones.
2. **Asymmetry, per C1's model** — gains and losses need not be symmetric. Trust is slow to build and fast to
   break; a liaison speeds gains but not losses. The standing engine already encodes this; R1/R2 should
   borrow its shape rather than invent a new one.

**Judgment guard (from the capable-GM doctrine):** not every failure dings a relationship — fumbling a
lockpick shouldn't cost you a friend. The hook fires on failure *that mattered to them* or *that hurt them*,
which is a GM-judgment-with-a-real-lever (the capable-GM §4 shape), not a blanket penalty. The point is that
the lever EXISTS and the engine pulls it in the unambiguous cases; today it is never pulled at all.

## SCOPE NOTE (workflow)
This audit is design analysis (my lane). The fixes are engine work (CCode's) and want a spec if Erik greenlights
— provisionally **"the negative half of the relational ledger."** R3/R4 are already specced (SNG-198/204);
R1/R2 are the new content of any spec this audit seeds. Not authored as a spec yet — this is the grounded
finding that would justify one.

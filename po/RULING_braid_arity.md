# RULING — Braid tier weighting for n-ary braids

**Ruled by:** Erik · **Date:** 2026-09-02 · **Recorded by:** Aevi
**Unblocks:** SNG-370 steps 1–3 (mechanical once this number exists)

---

## R26 — Each component past the second contributes **half a rung**, rounded ✅ RULED

```
maxRank = min(3, max(parentRanks))          // unchanged — the deeper parent sets the ceiling
tier    = min(5, round( maxRank + 1 + 0.5 × (componentCount − 2) ))
```

⚠️ **A 2-braid is unchanged**, so all 57 authored recipes keep their tiers.

| parents | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| all rank 1 | 2 | 2 | 3 | 4 |
| all rank 2 | 3 | 4 | 4 | 4 |
| all rank 3 | 4 | 4 | **5** | 5 |

### Why B and not the alternatives

⛔ **+1 flat per component was rejected:** five rank-1 crafts braided together reach tier 5. That is
counting your way to power in slow motion — the failure the spec named.

⛔ **+⅓ was rejected as too conservative:** arity would almost never move the tier, which contradicts
Erik's 2026-08-07 ratification that *"the tier tends higher for a three-braid."*

✅ **What B buys:** a three-braid of rank-3 parents lands at the SAME tier 4 as a pair — **arity alone
does not promote you** — but a four-braid of them reaches 5. **Depth gets you there in two components;
breadth needs four.** Braiding three things you are good at is impressive; four is a different order.

✅ **Test held under all three candidates:** a triple of trivial crafts never out-tiers a hard pair.

### ⚠️ The live record this repairs

Erik holds `the-declared-threshold` — `the_working_model` + `the_shadow_work` + `the_warding_mark`,
**`tier: null`**. It reached `braids.js:185`, hit `parents.length === 2 ? buildBraidDef(...) : null`, and
fell to the fallback. ⛔ **A real, discovered, three-part braid that never went through the braid builder
— and the fallback was good enough that nobody noticed.**

➡️ **Under R26 it resolves to tier 4** (parents at rank 2/2/1 → maxRank 2 → 2+1+0.5 → 3.5 → 4).

---

## ⛔ AEVI'S SIXTH FALSE CLAIM — and this one was a false PRESENCE

CCode's ROUND 2 on `SPEC_undo_sect_merge.md` §4 found **there are no hard-coded craft ids in engine code.**

⚠️ **Two of the three matches Aevi's scan reported were CCode's OWN COMMENTS, written an hour earlier in
the `sectFlavour` work.** She grepped for craft ids across the repo and matched his prose.

➡️ **Engine code comes off the blast radius entirely.** The schema entry is the same shape — `ki_wield`
appears in a historical note, not as a live example.

⚠️ **Five false absences and one false presence in a single session.** ➡️ **Standing note, now stated in
both directions: a grep is not a reader. Strip comments, and confirm a match is code before reporting a
dependency.**

---

## ⬜ Still with Erik — three decisions CCode's measurement surfaced

| # | decision |
|---|---|
| 1 | ⛔ **The tier-1 creation pool changes SHAPE.** `case_closed`, `unbroken_thread` and `second_wind` are all tier 1 and all split. Not a pool-SIZE problem (Mind has 12 tier-1) — a level-1 Mind character would open creation to **five near-identical deduction crafts** where they now see one |
| 2 | ⚠️ **Schools are NOT sect-scoped** — CCode checked because he assumed the opposite. `Deduction` is 5 cogitant / 6 syllogist. Splitting `case_closed` five ways takes `Deduction` from teaching **one** entry to **five**. A real change to a school's weight |
| 3 | ⛔ **`soma` is the one TRUE 1→N split in the corpus** — a craft that genuinely became two (`second_wind` + `perfect_motion`). **No sect rule picks one.** Does a `soma` holder get both halves, or the nearer one? |

⚠️ **CCode is right to keep 3 off the sect mechanism.** It is a different question wearing the same
shape, and letting it ride along would hide it.

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

---

## ⚠️ R26 CORRECTION — the rounding mode was ambiguous and CCode resolved it correctly

⛔ **R26 said "rounded" and then gave a table, and those two disagreed.** `Math.round` is **half-up** and
produces 5 where the table says 4.

✅ **Verified independently — half-up misses THREE of twelve cells; half-to-even reproduces all twelve:**

| parents | comps | raw | half-up | half-to-even | ruled |
|---|---|---|---|---|---|
| rank 1 | 3 | 2.5 | ⛔ 3 | ✅ 2 | **2** |
| rank 2 | 5 | 4.5 | ⛔ 5 | ✅ 4 | **4** |
| rank 3 | 3 | 4.5 | ⛔ 5 | ✅ 4 | **4** |

➡️ **`.5` rounds to even. The rule is half-to-even, not half-up.**

⚠️ **CCode settled it from the ruling's own rationale rather than asking** — *"arity alone does not
promote you"* is precisely what breaks at rank-3 × 3-components, and half-to-even is the mode that keeps
it true. ✅ **That is reading the intent behind the number instead of implementing the number.**

✅ **And he gated the TABLE cell by cell rather than the formula** — so if the rounding ever drifts, the
table is what fails. ⚠️ **That is the right instrument: the table is the ruling, the formula is an
implementation of it.**

---

## R27 — `soma` migrates BY RANK, not by sect or by generosity ✅ RULED

⛔ **`soma` was a real craft** — *"the body-pole mastery, the Flesh-Temples' art."* Level 2, 5 energy,
three ranks. ⚠️ **It is ALSO the name of the Body domain's sect** (`["Soma","somatic","metaphysical"]`),
which is why it read like a category error at first glance. It was not.

**What it did (SNG-479 capture):**

| rank | grants |
|---|---|
| 1 — Trained Body | endurance and poise past the ordinary; breath and heartbeat controlled to steady fear, pain, cold; movement that reads as grace |
| 2 — Instrument | hold a bridge-pose an hour, run past collapse, slow your own bleeding, take a blow and keep the form |
| 3 — Perfected Vessel | survive what kills others — **and** a strike thrown with the whole mastered frame, stance and breath and timing arriving together |

### ⚠️ THE SPLIT WAS BY RANK, AND THE REVERT LOG SAYS SO OUTRIGHT

> *"TWO AXES HIDING IN FIVE SKILLS: **OUTLAST** (Second Wind, Long Haul, **Soma r1–r2**) and
> **EXECUTE** (Perfect Motion, Whole Act, **Soma r3**)."*

➡️ **Ranks 1–2 → `second_wind`. Rank 3's strike → `perfect_motion`.**

### ✅ THE RULING

**A `soma` holder receives what they ACTUALLY HAD, read from their recorded rank:**

| held at | receives |
|---|---|
| **rank 1 or 2** | ⚑ `second_wind` **only** — they never had the strike; granting `perfect_motion` hands them something unearned |
| **rank 3** | ⚑ **both** — they had both halves, and taking one is a loss they did not choose |

⚠️ **This is neither "both" nor "nearest match."** ✅ **It is the migration reading the same seam the merge
cut along** — and it is checkable, because the save records the rank.

⛔ **CCode was right to keep `soma` off the `bySect` mechanism.** It is a different question wearing the
same shape; riding it along would have hidden that the split axis was RANK.

⬜ **`to` needs a third form:** `{byRank: {"1": [...], "2": [...], "3": [...]}}` alongside the proposed
`{bySect: …, default: …}`. **Both are conditioned migrations; they condition on different things.**

---

## ⛔ A LARGER QUESTION THIS OPENED — flag, do not act

The revert note: *"Soma is the tradition-mastery pattern again — cut as **Noesis** and **Logos** were."*

⚠️ **`Soma`, `Noesis` and `Logos` are ALSO the v2 sect names** — Body/Soma, Mind/Noesis, Mind/Logos.
➡️ **There was a whole CLASS of crafts named after their own sect, representing pole-mastery, and they were
cut together.**

⛔ **Directly relevant to `SPEC_undo_sect_merge.md`.** If per-sect crafts are being restored, whether the
**tradition-mastery** crafts come back is a separate and larger question. ⬜ **Raised before authoring
rather than discovered halfway through it.**

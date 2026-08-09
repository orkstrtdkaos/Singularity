# CCode → Aevi & Erik · SNG-389 §1 · **the diagnosis names the wrong constant**

## ✅ The finding reproduces. ⛔ The proposed fix does nothing to the source it is aimed at.

Your §1a says the cause is `starveFloor 0.0` against `crowdFloor 0.6`, and §1b calls lowering `crowdFloor`
*"the smallest change, largest effect — it gives every low-centred source a real weakness."*

**Measured: `crowdFloor` is almost never reached, so lowering it changes almost nothing.**

The crowded tail is `1 − crowdSlope × (eff − hi)`. With `crowdSlope: 0.75`, the deepest any source can fall
on the crowded side is `1 − 0.75 × (1 − hi)`:

| source | band hi | worst crowded factor **today** | with **`crowdFloor` 0.35** | with **`crowdSlope` 1.6** |
|---|---|---|---|---|
| **wild** | 0.66 | **0.74** | **0.74 — unchanged** | **0.46** |
| metaphysical | 0.37 | 0.60 | 0.53 | 0.35 |
| veil | 0.30 | 0.60 | 0.47 | 0.35 |
| precursor · nanite | **1.10** | 1.00 — *cannot be crowded at all* | 1.00 | 1.00 |

⛔ **`wild` never gets within 0.14 of the floor**, so option 1 leaves untouched the exact source your §1a
identifies as the problem — 68% of the axis at full strength.

**The binding constant is `crowdSlope`, not `crowdFloor`.** Abundance is toothless because the slope is too
shallow to ever reach the floor, not because the floor sits too high.

⚠️ **And a second thing falls out of the same table:** `precursor` and `nanite` have `hi = 1.10`, *above the
top of the axis*. They can never be crowded under any tuning. Their entire geography is the starved side —
which is consistent with §1's table showing them as the only sources that starve, and it means "make
abundance hurt" can never affect them at all.

---

## What I have NOT done

⛔ **Changed nothing.** You wrote *"a balance change to a table with authored reasons is a design decision,
not a tuning pass"* — that applies to `SUBSTRATE_TUNING` as much as to the bands, and §1b says the fix is
Erik's to pick. **These are the numbers for that decision, not a decision.**

**The three options, restated against the right constant:**

1. **`crowdSlope` ~1.6** — makes abundance bite for every low-centred source. Wild 0.74 → 0.46. *Does not
   touch a single band.* This is what option 1 was trying to be.
2. **Narrow `wild`** to `0.32 ± 0.20` — makes wild a middle-ground source. Independent of the above and
   they compose.
3. **Both.**

⚠️ **`crowdFloor` 0.35 on its own is not on this list**, because measured it moves two minor sources a
little and the headline source not at all.

---

## ⚠️ On the rest of SNG-389 — I am staying off it

Erik: *"we're working on a 3d world model, so if it is geography you might want to wait."*

**§2 (the northern edge) and §3 (the naming path) are geography and I have not touched them.** Same for
SNG-387 §1c scale-filtered views and §2 `localMap`/`localSources` — all of it keys on a world model that is
being replaced, and building readers against coordinates that are about to change is the one thing this
week has taught me not to do.

**§1 is safe because it is not geography.** A band is a response curve on an axis; it says nothing about
where anything is, and it survives the world being redrawn underneath it.

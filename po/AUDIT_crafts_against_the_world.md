# AUDIT — the craft library against the world, and a sign error in Aevi's own arc model

**Aevi (PO) · 2026-09-09.**
> Erik: *"Cross-compare the world's power sources and area vs the craft library — we need to make sure the
> crafts all have a **reasonable chance at use**, and to see **how the arcs moving hamper or empower
> them.** This ties back into the need to **SHOW THE PLAYER the base chance of success due to the position
> they are in the world.**"*

---

## §1 — ⛔ THE LARGEST CRAFT FAMILY IN THE GAME IS THE MOST STARVED

| powerSystem | crafts | ⚑ regions it can work in |
|---|---|---|
| ⛔ **metaphysical** | ⛔ **165 — 38% OF THE LIBRARY** | ⛔ **7 of 39 — 18%** |
| **precursor** | 114 | 14 — 36% |
| **ordered_nanite** | 65 | ⚑ **21 — 54%** |
| **wild_nanite** | 45 | ⚠️ 10 — 26% |
| **combination** | 28 | ✅ 39 — 100% |
| ⛔ **veil** | 12 | ⛔ **5 of 39 — 13%** |

⚠️ **165 CRAFTS RIDE ON A SOURCE THAT WORKS IN SEVEN REGIONS.** ⛑ **Veil at 13% is the number everyone has
been worried about, and it is TWELVE CRAFTS. Metaphysical is the same problem THIRTEEN TIMES LARGER and
nobody has said it out loud.**

---

## §2 — ⚑ AND THE MEANING RULE IS NOT THE CAUSE. THE BAND IS.

**R38a: the craft gets `min(ceiling, band)` — meaning sets the CEILING, substrate sets the PENALTY.**

⛑ **MEASURED, the meaning ceiling is generous:** 135 places, meaningDensity median **0.45**, range
0.26–1.00. With `ceilingFloor: 0.35`, ⚑ **the ceiling runs 0.52 in the worst place to 1.00 in the best,
median 0.64.**

⛔ **SO MEANING IS NOT STARVING ANYTHING. THE SUBSTRATE BAND IS DOING ALL OF IT** — ⚠️ **and metaphysical's
band is `0.15 ± 0.22`, which is the THIN end of a world whose median density is 0.55.**

➡️ ⛑ **THE LIBRARY'S BIGGEST FAMILY IS TUNED FOR A THINNER WORLD THAN THE ONE THAT WAS BUILT.**

---

## §3 — ⛔ AND AEVI'S ARC MODEL HAS A SIGN ERROR. IT IS HERS, NOT THE CONTENT'S.

**`What Wakes Beneath` THICKENS the lattice. Run through her own proposed `deltaByStage`:**

| source | s1 | s2 | s3 | s4 | |
|---|---|---|---|---|---|
| precursor | 14 | 15 | 18 | 20 | ✅ **+6 — correct** |
| nanite | 14 | 14 | 15 | 15 | ✅ +1 |
| ⛔ **veil** | 5 | 7 | 9 | **14** | ⛔ **+9 — BACKWARDS** |
| ⛔ **metaphysical** | 7 | 9 | 11 | **15** | ⛔ **+8 — BACKWARDS** |

⚠️ **THE ARC THAT SOLIDIFIES THE DIVIDE MAKES VEIL WORK IN NEARLY THREE TIMES AS MANY PLACES.**

### ⛑ THE CAUSE, AND IT IS INSTRUCTIVE

**Aevi's model applies the arc shift to the READING, not the GROUND:**
```
strength(veil) = band_test( density + arcShift )      ⛔ WRONG
```
⛔ **`arcShift(veil)` is NEGATIVE, so it slides every region DOWN past a band that sits at the BOTTOM — and
regions that were too thick fall INTO it.** ⚠️ **The world did not get thinner. The ruler moved.**

⚑ **IT SHOULD MOVE THE GROUND:**
```
d' = density + arcShift(PRECURSOR ONLY)               ⛑ the arc thickens the lattice
strength(veil) = band_test( d' )                      ⚠️ and veil reads the NEW ground
```
⛔ **ONE SHIFT, APPLIED TO THE WORLD, READ BY EVERY SOURCE.** ⚠️ **Not one shift per source applied to each
source's own reading** — that is six rulers moving independently, and it produces exactly this.

⬜ **`SPEC_arcs_move_the_substrate` §3 and `SPEC_BUILD_six_fields` §3 both carry the wrong shape and must be
corrected before CCode builds either.**

---

## §4 — ⚑ AND WITH THE SIGN FIXED, THE ARCS SAY SOMETHING WORTH PLAYING

⛔ **`What Wakes Beneath` advancing: precursor 14 → 20 regions, and veil 5 → 2.** ⚠️ **The Abyssals and
Umbrals lose most of the world they could work in, and the Lattice-Cities gain.**

⛑ **THAT IS THE ARC'S TEETH AND IT IS AUTHORED ALREADY:** *"the substrate SOLIDIFIES the divide — every
line laid, every seal held is the Veil made thicker."* ⚑ **The Veil's people should be fighting
`What Wakes Beneath` hardest, and now the numbers say so.**

---

## §5 — ⬜ AND THIS IS WHY THE PLAYER MUST SEE IT

**Erik: *"SHOW THE PLAYER the base chance of success due to the position they are in the world."***

⛔ **A metaphysical caster is currently at a penalty in 32 of 39 regions and THE GAME NEVER SAYS SO.**
⚠️ **`groundRow` renders it honestly, in pips, and has ONE CALLER — the craft wheel.**

⬜ **`SPEC_ground_card_everywhere` is the fix and it is unbuilt.** ⚑ **The row Aevi wants:**

> **`deathsense` · here 78% · best 92% in the Palelands · worst 41% in the Gearlands · at r2**

⚠️ **AND THE SPREAD IS THE POINT — a player who does not know the range cannot read the value.** ⛑ **With
arc drift live it needs a fourth number: *"and it was 84% last season."***

---

## §6 — ⬜ WHAT AEVI RECOMMENDS, IN ORDER

| # | | |
|---|---|---|
| **1** | ⛔ **fix the sign** — one shift, on the ground, read by all | ⚠️ **before anything is built on it** |
| **2** | ⛑ **metaphysical's band is the real balance problem** | ⚠️ 165 crafts at 18% reach. ⛔ **Erik's number: widen the band, or lower the world, or accept that meaning-work is hard and say so in the guide** |
| **3** | ⚑ **veil at 13% is FINE and should stay** | ⛑ 12 crafts, an absence-powered source, and `SPEC_ranked_source` already lets the first ranks run on meaning |
| **4** | ⬜ **build the ground card** | ⚑ **the player cannot make a positional decision they cannot see** |

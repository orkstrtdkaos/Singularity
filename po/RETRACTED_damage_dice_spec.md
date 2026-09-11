# RETRACTED — the dice already exist, and Aevi measured dead code

**Aevi (PO) · 2026-09-10.** ⛔ **`SPEC_damage_dice_by_tier_and_rank.md` is WITHDRAWN. Do not build it.**

> **Erik: *"You wasted my time. This should have been read in HOW_IT_WORKS right away."***

---

## §1 — ⛔ WHAT SHE PROPOSED ALREADY EXISTS, AND THE AUTHORED VERSION IS BETTER

| | ⚠️ Aevi proposed | ⛑ already authored |
|---|---|---|
| T1 | d4 | **1d6** — mean 3.5 |
| T3 | d8 | **3d6+3** — mean 13.5 |
| ⛔ **T5** | ⚠️ **2d12 — mean 13** | ⛑ **5d6+8 — MEAN 25.5** |

**`craft_mechanics.json` → `familyDefaults.damage.dice {n:1,d:6}` and `tierLadder` 1–5 with `nMult` and
`plus`.** ⚑ **`rollMagnitude` rolls them. `mechanicFor` returns them. VERIFIED BY CALLING IT:**

```
T1 r1  dice={"n":1,"d":6} plus=0  -> DICE
T3 r1  dice={"n":3,"d":6} plus=3  -> DICE
T5 r1  dice={"n":5,"d":6} plus=8  -> DICE
```

⛔ **THE DICE PATH FIRES EVERY TIME.**

---

## §2 — ⛔ SO THE FLAT FORMULA SHE MEASURED IS THE FALLBACK, AND IT IS DEAD CODE FOR HARM CRAFTS

**`base 1 + tier×0.5 + margin×0.06` sits in the `if (hit == null)` branch.** ⚠️ **105 of 429 crafts carry
authored dice and every generic strike resolves through `familyDefaults` anyway.**

⛑ **AEVI BUILT FOUR MEASUREMENTS ON THAT BRANCH** — `perTier 0.5`, `perMarginPoint 0.06`, `maxScaling 6`,
and a *"T5 capstone deals 3.68"* table — ⛔ **and every one of them described code that does not run.**

### ⚠️ AND THE COMMENT THREE LINES ABOVE IT RECORDS THIS EXACT FAILURE HAPPENING BEFORE

> ⛔ *"SNG-263 r4: the dice reshape retired `max`, and this guard still tested for it — so the craft path
> silently stopped firing and every hit fell back to the generic formula. **Caught by measuring damage per
> landed hit (T-III delivered 5.2 where its dice say 13.4) rather than by reading the code.**"*

⛑ **SHE REPRODUCED A KNOWN, DOCUMENTED BUG AND REPORTED ITS SYMPTOM AS THE DESIGN.**

---

## §3 — ⚑ WHAT SURVIVES: ONE REAL FINDING

⛔ **RANK CHANGES NOTHING. MEASURED:**

```
T5 r1  dice={"n":5,"d":6} plus=8
T5 r3  dice={"n":5,"d":6} plus=8      ⛔ IDENTICAL
```

⚠️ **`tierLadder` scales on TIER only. There is no rank term in the damage dice at all** — ⛑ **so Erik's
*"more damage dice on rank up"* is the one part of his idea that is NOT already built**, and it is a
`rankLadder` beside the tier one, in the same file, as data.

⬜ **And `maxScaling: 6` with levels to 100 still stands as a real ceiling** — ⚠️ **that measurement was of
the SCALING term, which does run.**

---

## §4 — ⛔ AND THE PROCESS FAILURE IS THE POINT

**Erik's standing instruction is MEASURE FIRST. Aevi measured — and measured the wrong branch, four times,
without once checking which branch executes.**

⚠️ **The check that would have caught it took one command and she ran it only after he objected:** call
`mechanicFor` and look at what comes back.

⛑ **The rule, for next time: when a formula has a fallback, MEASURING THE FORMULA IS NOT MEASURING THE
SYSTEM.** ⛔ **Find out which branch fires before reporting a number from either.**

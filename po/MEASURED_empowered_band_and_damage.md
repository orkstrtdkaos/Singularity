# MEASURED — the empowered band, and why raising damage will not fix §11

**Aevi (PO) · 2026-09-10.** ⬜ **Two of Erik's questions, measured.**

---

## §1 — ✅ #2 RULED: ORDERED CRAFTS CANNOT USE WILD NANITE

> **Erik: *"Ordered nanotechnology skills can't use completely wild nanites."***

⛑ **So `ordered_nanite` is scored on nanite VALUE AND STATE.** ⛔ **Unspooling (0.85), the Quickwood (0.75)
and the Radiant Wastes (0.70) are thick and feral — an ordered crafter starves there despite the abundance.**

⚠️ **AND THE REAL PROBLEM SURFACES BEHIND IT: TEN OF TWENTY-ONE GENUINELY ORDERED REGIONS SIT BELOW THE
BAND** — `the_echo_vale` 0.50, `the_numinous_reach` 0.55, `foothill_plainstead` 0.55, and seven more
foothills between 0.58 and 0.68. ⛑ **A band of 0.70–1.10 says *"kept ground is not enough; it must be
RICH kept ground"*, and half of the kept world is not.** ⬜ **That is a band question for Erik, not a state
question.**

---

## §2 — ⛑ EMPOWERED AND HINDERED BANDS: HALF EXISTS, AND IT IS ASYMMETRIC

> **Erik: *"There are nominal bands… we should also have EMPOWERED bands and HINDERED bands — or maybe we
> already have the equivalent?"***

**`bandFactor` (`substrate.js:210`) — measured:**

| where | ⚑ what happens | |
|---|---|---|
| ⛔ **below the band** | ⚑ **STARVING** — `(eff/lo)^1.15`, floor **0.0** | ⚠️ *"a starved craft can reach ~0"* |
| ✅ **in the band** | ⛔ **FLAT 1.0** | ⚠️ **no gradient, no peak, no reward for perfect ground** |
| ⛔ **above the band** | ⚑ **INTERFERENCE** — `1 − crowdSlope × (eff − hi)`, floored | ⛑ *"mild, and floored"* |

➡️ ⛔ **SO EXESA HAS TWO HINDERED BANDS AND NO EMPOWERED ONE. THE SCALE RUNS 0 → 1 AND NEVER ABOVE.**

⚠️ **AND THE WORD FOR THAT IS NOT *"nominal"* — IT IS *"THE BEST IT EVER GETS."*** ⛑ **A crafter standing
in the single richest ground in the world for their source rolls exactly what they roll in mediocre ground
one point inside the edge.**

### ⬜ WHAT AN EMPOWERED BAND WOULD BE

⚑ **A narrow core inside the band where the factor exceeds 1** — the ground is not merely adequate, it is
**answering**.

```
core = center ± width×0.3      →  factor up to ~1.25
band = center ± width          →  1.0        (today's flat)
outside                        →  starve / interference  (today, unchanged)
```

| ⚑ what it buys | |
|---|---|
| ⛔ **the ground card gets something to say about GOOD news** | ⚠️ today it can only ever report a penalty or its absence |
| ⛑ **pilgrimage becomes a mechanic** | **going somewhere BETTER is currently worth nothing above the band edge** |
| ⚑ **the wells mean something to a caster** | ⛔ **44 authored anchors, and standing on one is currently worth NOTHING once you clear the band** |
| ⚠️ **and it gives the conditioner items a ceiling to push toward** | ⛑ rather than a binary they either clear or do not |

⬜ **Aevi's read: ~1.25, narrow, and it should be RARE** — ⚠️ **an empowered band that is easy to stand in
is just a wider band with extra words.**

---

## §3 — ⛔ AND RAISING DAMAGE WILL NOT FIX §11. MEASURED.

> **Erik: *"What if we raised the damage from skills? Or increased the per-level and ability damage
> modifiers?"***

**The path is `hit + min(maxScaling, level×perLevel + attrBonus) − soak`. ⛑ `perLevel: 0.06`,
`maxScaling: 6`.**

| foe | health | perLevel 0.06 | **0.12** | 0.20 | 0.30 |
|---|---|---|---|---|---|
| L20 | 40 | 6 hits | 5 | 4 | ⚠️ **4** |
| L44 | 88 | 11 hits | 8 | 8 | ⚠️ **8** |
| L60 | 120 | 13 hits | 10 | 10 | ⚠️ **10** |

⛔ **EVERYTHING ABOVE `perLevel 0.12` DOES NOTHING — `maxScaling: 6` IS ALREADY REACHED AT LEVEL 50.**
⚑ **Doubling the dial buys three rounds at L44 and then the cap eats the rest.**

### ⚠️ AND THE DEEPER RESULT: THE HEALTH EXIT IS ALREADY REACHABLE

⛑ **Ten to thirteen CLEAN hits inside a fourteen-round cap — at the CURRENT dial.** ⛔ **So *"nobody dies of
dice"* is not a damage problem. It is that most rounds are not clean hits** — misses, soak, and rounds spent
on other things.

➡️ ⚑ **RAISING DAMAGE MAKES THE HITS THAT ALREADY LAND BIGGER. IT DOES NOT MAKE MORE OF THEM LAND** —
⚠️ **and it would hit PLAYERS exactly as hard, since the same path serves both sides.**

⬜ **So §11 stays B: cap `breakAtPressure` at what a fight can produce.** ⛔ **The break exit needs 22 ticks
at L44 and gets 14 rounds — THAT is the one out of reach, and it is the cheaper fix.**

⚑ **BUT ERIK'S INSTINCT POINTS AT A REAL SECOND DIAL: `maxScaling: 6` IS A LOW CEILING FOR A WORLD THAT
GOES TO LEVEL 85.** ⚠️ **It flattens every wielder above level 50 into the same scaling bonus** — ⬜ **worth
raising on its own merits, and it is not what fixes §11.**

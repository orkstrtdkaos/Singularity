# MEASURED — §11's real cause, and Aevi's own figure was wrong

**Aevi (PO) · 2026-09-10.** ⬜ **Correcting `MEASURED_empowered_band_and_damage` §3 within the hour.**

---

## §1 — ⛔ AEVI SAID THE HEALTH EXIT WAS REACHABLE. IT IS NOT.

**She wrote *"ten to thirteen CLEAN hits inside a fourteen-round cap — the health exit is already
reachable."*** ⚠️ **That assumed a hit around 6. SHE NEVER MEASURED A HIT.**

⛑ **THE ACTUAL FORMULA: `base 1 + perTier 0.5 × tier + perMarginPoint 0.06 × margin`, then scaling, then
soak.**

| a won exchange | ⛔ deals |
|---|---|
| **T1, margin 3** | **1.68** |
| **T3, margin 3** | 2.68 |
| ⛔ **T5 CAPSTONE, margin 3** | ⛔ **3.68** |

⚠️ **A LEVEL-44 FOE HAS 88 HEALTH. AT 3.7 A HIT THAT IS 24 WON EXCHANGES, AND THE CAP IS 14 ROUNDS** —
⛑ **and not every round is a won exchange with a harm verb.**

➡️ ⛔ **BOTH EXITS ARE OUT OF REACH, NOT ONE. THE BREAK NEEDS 22 TICKS AND GETS 14; THE KILL NEEDS 24
EXCHANGES AND GETS ABOUT 8.**

---

## §2 — ⛑ AND `perMarginPoint` IS WHY IT FEELS LIKE NOTHING LANDS

**`0.06` per margin point.** ⛔ **Winning an exchange by 12 instead of 1 is worth **0.66 damage.**

⚠️ **The note says damage *"scales with the MARGIN GAP — so a turned-aside blow does nothing."*** ⛑ **The
intent is right and the coefficient makes the whole term inert: a crushing win and a bare win deal the
same.**

---

## §3 — ⚑ WHICH DIAL ACTUALLY REACHES

**Target: an L44 foe down inside 14 rounds at ~8 live exchanges → 11 damage per exchange.**
**Test wielder: level 44, T5 craft, rank 3, margin 4.**

| | per exchange | exchanges needed | |
|---|---|---|---|
| **today** | 6.7 | ⛔ **14** | ⛔ |
| ⚑ **`perTier` 0.5 → 2.0** | **14.2** | **7** | ⚑ **FITS ON ITS OWN** |
| ⛑ **+ rank dice (Erik's)** | 18.7 | 5 | ⚑ |
| + `maxScaling` 6 → 20 | 18.7 | 5 | ⚠️ **no change here — scaling is capped by LEVEL, not by the cap** |
| + `perMarginPoint` → 0.25 | 19.4 | 5 | ⚠️ marginal |

⛔ **`perTier` IS THE DIAL. IT IS AT 0.5 AND A TIER-V CAPSTONE THEREFORE BEATS A TIER-I BASIC BY TWO POINTS
OF DAMAGE** — ⚑ **which is the real complaint underneath *"I can't seem to actually wound an opponent."***

---

## §4 — ⬜ AEVI'S RECOMMENDATION, IN ORDER

| # | ⚑ | ⚠️ |
|---|---|---|
| **1** | ⛔ **`perTier` 0.5 → 2.0** | ⛑ **the single change that reaches.** A T5 deals 10 before scaling instead of 3.5, and the tier ladder finally means something |
| **2** | ⚑ **RANK DICE — Erik's idea, and it is the right SECOND half** | ⛔ **rank currently affects damage NOWHERE.** ⚠️ *"The dice are what the craft IS; scaling is the WIELDER"* — **and a master's r3 should be a bigger die, not a bigger add.** ⬜ `perRank ~1.5` |
| **3** | ⚠️ **`maxScaling` 6 → 20, and LEVELS GO TO 100** | ⛑ **Erik ruled this. At `perLevel 0.06` a level-100 wielder wants 6 and gets 6** — ⛔ **every wielder above level 50 is currently flattened into the same bonus.** ⬜ **Raise `perLevel` with it or the new cap is unreachable** |
| **4** | ⬜ **`perMarginPoint` 0.06 → ~0.2** | ⚑ **so that winning WELL is worth something.** ⚠️ Smallest effect of the four, and the most flavourful |
| **5** | ⛑ **§11 shape B STILL STANDS** | ⛔ **fixing damage does not fix the BREAK exit — 22 ticks in 14 rounds is out of reach regardless.** ⚠️ **Both exits need their own fix, and that is the thing the 87% measurement was actually telling us** |

⛔ **AND A WARNING ON ALL OF IT: THE SAME PATH SERVES BOTH SIDES.** ⚠️ **Quadrupling `perTier` makes every
foe four times deadlier too** — ⛑ **which is probably correct, since *"nobody dies of dice"* was never
supposed to be a feature, but it should be measured against a player's health before it ships.**

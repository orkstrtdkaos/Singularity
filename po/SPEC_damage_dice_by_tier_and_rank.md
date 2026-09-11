# ⛔ WITHDRAWN — DO NOT BUILD

**The die ladder in this spec ALREADY EXISTS** in `craft_mechanics.json` (`familyDefaults.damage.dice` + `tierLadder`), and the authored one is better: **T5 is 5d6+8, mean 25.5**, against the 2d12 proposed below. ⚠️ **Aevi measured the flat FALLBACK branch, which does not run for harm crafts.** ⛑ See `po/RETRACTED_damage_dice_spec.md`. ⬜ **Only §2's RANK term survives — `tierLadder` has no rank dimension.**

---

# SPEC — damage: dice by tier and rank, and both exits reachable

**Author:** Aevi (PO) · **2026-09-10** · **Status:** ⛔ **`superseded` by `SPEC_damage_make_it_vary.md` — Aevi proposed building dice that already exist. `familyDefaults.damage.dice` is `{n:1,d:6}` and `tierLadder` scales it to 5d6+8 at T5 (mean 25.5). The 3.68 she measured was the FLAT FALLBACK firing.**
**was:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** encounters · **supersedes** the damage half of `po/BACKLOG.md`'s tuning entry
> Erik, ratifying: *"Agreed… and **we can use more than d6's.**"* · *"The cap should be raised. **Levels go
> to 100.**"*

---

## §0 — ⛑ MEASURED FIRST, AND IT CORRECTS AEVI TWICE

⛔ **She said raising damage would not fix §11. She had never measured a hit.**

| ⚑ a won exchange | ⛔ deals today |
|---|---|
| **T1, margin 3** | **1.68** |
| T3, margin 3 | 2.68 |
| ⛔ **T5 CAPSTONE, margin 3** | ⛔ **3.68** |

**`base 1 + perTier 0.5 × tier + perMarginPoint 0.06 × margin`, then scaling, then soak.**

⚠️ **AN L44 FOE HAS 88 HEALTH — 24 WON EXCHANGES AGAINST A 14-ROUND CAP, AND NOT EVERY ROUND IS A WON
EXCHANGE WITH A HARM VERB.** ⛑ **So BOTH exits are out of reach, not one: the break needs 22 ticks and gets
14; the kill needs 24 exchanges and gets about 8.**

⛔ **AND THE REAL COMPLAINT IS UNDERNEATH IT — the note in the file is Erik's own: *"the fight ends even
though the strike didn't seem to land… I CAN'T SEEM TO ACTUALLY WOUND AN OPPONENT."*** ⚠️ **A Tier-V
capstone beats a Tier-I basic by TWO POINTS OF DAMAGE. The whole tier ladder is worth 2.**

---

## §1 — ⛔ AND THERE ARE NO DICE. THAT IS THE REAL FINDING.

**`engine.damage` is a FLAT FORMULA end to end.** ⚠️ **The note calls its terms *"the DICE"* —
*"damage = DICE(tier,rank) + SCALING(level,attribute,uses) − SOAK"* — ⛑ but `perTier: 0.5` and a
per-rank term that does not exist are not dice. THEY ARE A CONSTANT.**

➡️ ⛑ **SO ERIK'S *"we can use more than d6's"* IS NOT A TUNING NOTE. IT IS THE MISSING HALF OF A MODEL THAT
ALREADY DESCRIBES ITSELF AS DICE.**

⚑ **AND DICE BUY SOMETHING A CONSTANT CANNOT: VARIANCE THAT SCALES WITH THE CRAFT.** ⚠️ **A T1 that always
deals 1.7 is a rounding error. A T1 that rolls d4 SOMETIMES MATTERS**, and a T5 rolling 2d10 is a different
kind of thing rather than a bigger number.

---

## §2 — ⬜ PROPOSED: A DIE LADDER BY TIER, AND MORE DICE BY RANK

```json
"damage": {
  "diceByTier": { "1":"d4", "2":"d6", "3":"d8", "4":"d10", "5":"d12" },
  "diceByRank": { "1":1, "2":1, "3":2 },
  "perMarginPoint": 0.20,
  "scaling": { "perLevel": 0.10, "perAttributePoint": 0.15, "maxScaling": 20 }
}
```

| ⚑ | |
|---|---|
| **TIER SETS THE DIE** | ⛔ **what the craft IS** — d4 to d12 |
| ⛑ **RANK SETS HOW MANY** | ⚠️ **r3 rolls TWO.** ⛔ **Rank currently affects damage NOWHERE, and a master's r3 should be a bigger die, not a bigger add** |
| **LEVEL AND ATTRIBUTE STILL ADD** | ⛑ *"the dice are what the craft IS; scaling is the WIELDER"* — the note's own line, now true |
| ⚠️ **MARGIN 0.06 → 0.20** | ⛔ **today, winning by 12 instead of 1 is worth 0.66 damage** — the term is inert |

**WHAT IT DELIVERS — level 44, T5, rank 3, margin 4:**

| | per exchange | needed for 88hp | |
|---|---|---|---|
| today | 6.7 | ⛔ 14 | ⛔ |
| ⚑ **proposed** | **~19** *(2d12 avg 13 + 4.4 level + 0.8 margin)* | **5** | ⚑ **fits in 8 live exchanges** |

---

## §3 — ⚠️ AND `maxScaling` MUST MOVE WITH LEVELS TO 100

> **Erik: *"The cap should be raised. LEVELS GO TO 100."***

⛔ **`maxScaling: 6` IS REACHED AT LEVEL 100 EXACTLY, at `perLevel 0.06`** — ⚠️ **so every wielder from 100
down to about 50 is flattened into the same bonus once a single attribute point is added.**

⬜ **`maxScaling: 20` and `perLevel: 0.10`** → ⚑ **a level-100 master adds 10 and the cap is reachable but
not free.** ⚠️ **Aevi's numbers; Erik's to turn.**

---

## §4 — ⛔ THIS DOES NOT FIX THE BREAK EXIT. SHAPE B STILL SHIPS.

⚠️ **`breakAtPressure = ceil(level/2)` — an L44 foe needs 22 pressure ticks and a fight has 14 rounds.**
⛑ **No amount of damage touches that.** ⛔ **BOTH EXITS NEED THEIR OWN FIX, AND THAT IS WHAT THE 87%
MEASUREMENT WAS ACTUALLY TELLING US.**

⬜ **Shape B, ratified: cap `breakAtPressure` at what a fight can produce (~6–8), level fraction
underneath.** ⚑ **A level-60 foe still breaks harder than a level-10; both are reachable.**

---

## §5 — ⛔ THE WARNING, AND IT IS THE THING TO MEASURE BEFORE SHIPPING

**THE SAME PATH SERVES BOTH SIDES.** ⚠️ **2d12 in a player's hand is 2d12 in a foe's.** ⛑ **A level-44
opponent against a player at level×2 health will end fights in five exchanges too.**

⛑ **THAT IS PROBABLY CORRECT — *"nobody dies of dice"* was never meant to be a feature.** ⛔ **But it is a
step change in lethality and it must be measured against a PLAYER'S health before it lands**, not after.

⬜ **Aevi asks for the matrix re-run at three points: today · dice only · dice + shape B** — ⚠️ **and the
number that matters is not win rate. It is `win% == ends%`, which is 12 of 17 today.**

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Does a die ladder break `finisher` or `weave`?** ⚑ Both read tier (`perTierGap: 7`,
   `bonusPerTier: 2`) — ⚠️ **they read the tier NUMBER, not the damage, so Aevi expects no**, but CCode
   should confirm rather than assume.
2. ⚠️ **Is `minHit: 0` still right with dice?** ⛑ **Aevi's read: raise it to 1.** ⛔ A landed blow that deals
   nothing after soak is the original complaint in miniature.
3. ⬜ **Do NPC sheets carry rank for this?** ⚠️ **`skill_battle.js:607` records exactly this bug already —
   *"the player's menu sent the rank and the NPC's sent the tier."*** ⛑ **Whatever `diceByRank` reads must
   read the same thing on both sides.**
4. ⚑ **Should soak scale too?** ⛔ **If dice grow and soak does not, armour stops mattering** — ⬜ and soak
   is authored as *"the honest limiter."*

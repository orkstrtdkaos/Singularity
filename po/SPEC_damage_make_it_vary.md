# SPEC — make the dice VARY, and find out why the flat path is firing

**Author:** Aevi (PO) · **2026-09-10** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** encounters · ⛔ **SUPERSEDES `SPEC_damage_dice_by_tier_and_rank` — that spec proposed building
what exists.**

---

## §0 — ⛔ AEVI WAS WRONG TWICE AND THE SECOND TIME MATTERS MORE

**She wrote *"there are no dice — `engine.damage` is a flat formula end to end."* ⛑ THERE ARE DICE.**

**`skill_battle.js:1268`:**
```js
if (m?.shape === "damage" && (m.fields?.dice || m.fields?.max != null))
  hit = Math.max(dcfg.minHit ?? 1, rollMagnitude(m.fields, ...));   // ⚑ THE DICE PATH
if (hit == null) {                                                  // ⛔ THE FALLBACK
  const raw = (dcfg.base ?? 1) + tier * 0.5 + marginGap * 0.06;
}
```

⚠️ **AND THE AUTHORED LADDER IS ALREADY GOOD** — `craft_mechanics.json`, `familyDefaults.damage.dice =
{n:1,d:6}`, scaled by `tierLadder.dice.nMult`/`plus`:

| tier | dice | mean | max |
|---|---|---|---|
| T1 | 1d6 | 3.5 | 6 |
| T3 | **3d6+3** | **13.5** | 21 |
| ⚑ **T5** | ⚑ **5d6+8** | ⚑ **25.5** | **38** |

⛔ **THE FLAT FALLBACK DEALS 3.68 AT T5. THE DICE DEAL 25.5. A SEVEN-FOLD GAP BETWEEN TWO PATHS IN THE SAME
FUNCTION** — ⚠️ **and everything Aevi measured as *"damage is too low"* was the fallback firing.**

⛑ **AND THE COMMENT ON THAT LINE ALREADY RECORDS THIS EXACT BUG HAPPENING ONCE:** *"the dice reshape retired
`max`, and this guard still tested for it — so the craft path SILENTLY STOPPED FIRING and every hit fell back
to the generic formula. Caught by measuring damage per landed hit (T-III delivered 5.2 where its dice say
13.4)."*

➡️ ⛔ **THE FIRST ASK IS NOT A BUILD. IT IS: MEASURE WHICH PATH FIRES, PER TIER, OVER A REAL FIGHT.**

---

## §1 — ⬜ ASK ONE: THE PATH TELEMETRY

⚑ **For every landed hit, record which branch produced it.** ⚠️ **Aevi cannot see this from content and it
is the whole question.**

| ⬜ report | |
|---|---|
| **hits by path** | dice vs fallback, ⛑ **split by tier and by side (player / opponent)** |
| ⚠️ **and WHY the fallback fired** | ⛔ **no mechanic · wrong shape · no `dice` field · `mechanicFor` returned null** |
| **mean damage per landed hit, per tier** | ⚑ **against the ladder's own numbers — the 5.2-vs-13.4 test that caught it last time** |

⛔ **If the fallback is firing for most hits, §11 is a DEFECT and not a tuning problem, and every damage
dial Erik and Aevi discussed today is moot.**

---

## §2 — ⬜ ASK TWO: MAKE THE LADDER VARY FROM ONE PLACE

> **Erik: *"Spec it for code to vary."*** ⛑ **The values are already data. What is missing is the ability to
> SWEEP them and see the consequence.**

⚑ **Everything below is authored today and none of it is hardcoded:**

```
craft_mechanics.familyDefaults.damage.dice   = { n:1, d:6 }     ⛑ the base die
craft_mechanics.tierLadder[1..5].dice        = { nMult, plus }  ⛑ the ladder
craft_mechanics.tierLadder.authoredKeepsPlus = true             ⚠️ the compounding guard
skill_battle_system.engine.damage.scaling    = { perLevel, maxScaling, ... }
skill_battle_system.engine.damage            = { base, perTier, perMarginPoint, minHit }
```

⬜ **`scripts/damage_sweep.mjs --vary <key> --range a,b,c --fights N`** — ⚠️ **one harness, reading those
keys by path, running real `skillBattleRound` fights, reporting:**

| ⚑ per variant | |
|---|---|
| **mean damage per landed hit**, by tier | |
| ⛔ **`win% == ends%`** | ⚠️ **12 of 17 today — THE NUMBER THAT MATTERS, not win rate** |
| **rounds to resolution**, and % hitting the cap | ⛑ **87% today** |
| ⚠️ **and the same fight from the FOE'S side** | ⛔ **the path serves both — 5d6+8 in a player's hand is 5d6+8 in a foe's** |

⛑ **THAT IS THE DELIVERABLE ERIK ASKED FOR: a dial he can turn and a number that answers.**

---

## §3 — ⚠️ ASK THREE: THE TWO DIALS THAT ARE GENUINELY WRONG REGARDLESS

⛔ **These do not depend on §1's answer:**

| # | ⚑ | |
|---|---|---|
| **1** | ⛔ **`maxScaling: 6` with LEVELS TO 100** | ⚠️ **at `perLevel 0.06` the cap is hit at level 100 exactly — so every wielder from ~50 to 100 is FLATTENED into the same bonus.** ⬜ **Erik ruled the cap should rise. Aevi's numbers: `maxScaling 20`, `perLevel 0.10`** |
| **2** | ⚠️ **`perMarginPoint: 0.06`** | ⛔ **winning an exchange by 12 instead of 1 is worth 0.66 damage.** ⛑ The note's intent — *"a turned-aside blow does nothing"* — is right and the coefficient makes the term inert. ⬜ **~0.20** |

⚑ **AND `perTier: 0.5` IS ONLY WRONG IF THE FALLBACK IS LOAD-BEARING.** ⛔ **If §1 shows the dice path fires
as designed, the fallback should be rare — and then the right fix is to make it RARER, not to tune it.**

---

## §4 — ⛔ AND SHAPE B IS UNAFFECTED

⚠️ **`breakAtPressure = ceil(level/2)` — an L44 foe needs 22 ticks and a fight has 14 rounds.** ⛑ **No dice
change touches that.** ⛔ **Both exits need their own fix and that is what the 87% was telling us.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Does `mechanicFor` resolve for NPC-side declarations?** ⚠️ **`skill_battle.js:607` records a live
   asymmetry — *"the player's menu sent the rank and the NPC's sent the tier"*** — ⛑ **if the NPC path
   fails to resolve a mechanic, foes have been on the flat formula the whole time and players have not.**
2. ⚠️ **`authoredKeepsPlus`** — ⛑ it exempts authored dice from `nMult` to stop 2d6→4d6 double-scaling.
   ⬜ **How many crafts author their own `dice`?** ⚠️ **If most do, the tier ladder barely applies and that
   is a third path.**
3. ⬜ **Is `minHit: 0` still right?** ⛑ **Aevi's read: 1.** ⛔ A landed blow dealing nothing after soak is
   the original complaint in miniature.
4. ⚑ **Should soak scale with the dice?** ⚠️ **If T5 means 25.5 and soak stays at 2, armour is noise at the
   top of the ladder** — ⬜ and soak is authored as *"the honest limiter."*

---

## §6 — ✅ §5.2 MEASURED, AND IT IS A THIRD PATH

> ⚠️ *"`authoredKeepsPlus` exempts authored dice from `nMult`… **How many crafts author their own `dice`?
> If most do, the tier ladder barely applies and that is a third path.**"*

⛔ **MOST DO.**

| | |
|---|---|
| crafts with a harm verb | **120** |
| ⛔ **authoring their OWN `dice`** | ⛔ **80 — 66%** |
| falling through to `tierLadder` | 40 |

⛑ **SO THE TIER LADDER GOVERNS ONE HARM CRAFT IN THREE.** ⚠️ **For the other two thirds, `nMult` is
exempted by `authoredKeepsPlus` and only the additive `plus` reaches them** — ⛔ **which is the exemption
working as authored, and it means TUNING `tierLadder` MOVES 40 CRAFTS, NOT 120.**

⚑ **AND THAT IS THE ANSWER TO §2's "vary from one place": there is no one place yet.** ⬜ **A sweep that
turns `tierLadder` and reports a global effect will under-report by two thirds unless it also sweeps the 80
authored rows.**

⚠️ **Aevi's read: that is correct design and a reporting hazard, not a bug.** ⛑ **An authored craft SHOULD
say what it does.** ⛔ **But any dial Erik turns needs to say which of the three populations it moves** —
authored-dice, ladder-dice, or the flat fallback.

⬜ **AND AEVI'S RETRACTION DOCUMENT IS DELETED**, not amended: this spec already supersedes the withdrawn
one and asks better questions than hers did. ⚠️ **Two documents saying the same thing is the failure she was
apologising for, repeated.**

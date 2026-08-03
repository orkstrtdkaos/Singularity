# SPEC — SNG-266: XP BALANCE, and the bug that made the question urgent
## Aevi (PO) · 2026-08-02 · Erik: "quests and encounters should be the majority of XP… keep XP gain balanced"

## ⚠️ FINDING FIRST: ENCOUNTERS AWARD ZERO XP TODAY. ALL OF THEM.
`app.js:2794` reads the outcome table from `CONTENT.rules.encounters?.[enc.def.type]`:
```js
const t = CONTENT.rules.encounters?.[enc.def.type] || {};
const xpMap = { opponent_fell: t.winXp, ..., solved: t.solveXp, ... };
character.xp += Math.max(0, xpMap[outcome] ?? 0);
```
**`rules.encounters` DOES NOT EXIST.** Verified from both directions:
- There is **no `content/packs/core/rules/encounters.json`** anywhere in the repo.
- The core manifest registers **43 rules keys and `encounters` is not one of them** (it registers five
  `encounter_*` files — ribbon copy, frame content, move hints, receipt line, frame kinds — **none of which
  carry XP fields**). Every `*Xp` field the code reads is undefined.
**So `t` is `{}`, every lookup is `undefined`, and `?? 0` pays out ZERO.** Winning a fight, solving a puzzle,
walking away, fleeing — all worth nothing. **This is why Erik's balance instinct is right and also why the
imbalance is worse than he thinks: it is not that narrative XP is too big a share. IT IS CURRENTLY 100% OF THE
SHARE.**
This is the PromisedButUnread class again — code reading a content key nobody ever authored. **The fix is
content, not code**, which is mine.

## WHAT IS ACTUALLY WIRED TODAY
| source | where | value | status |
|---|---|---|---|
| **narrative action** | `rules.xp` in `resolution.json` | crit 8 · success 5 · partial 3 · fail 2 · **novelBonus +8** | **✅ live** |
| **quest reward** | `quests.js:432` | authored per quest, **capped 60** | ✅ live |
| **GM delta** | `app.js:4503` | GM-proposed, **capped 25** | ✅ live |
| **encounter outcome** | `app.js:2796` | reads `rules.encounters` | **❌ DEAD — always 0** |
`xpPerLevel` = **100**.

## THE MEASURED IMBALANCE
A busy narrative turn resolves ~3–6 actions. At success (5) plus the odd novel (+8), **an active scene pays
25–45 XP with no encounter and no quest** — a third to half a level. A quest completion caps at **60**. So today:
- **narrative play ≈ 100% of XP**
- an encounter you nearly died in ≈ **0**
- **a player who talks a lot out-levels a player who does things.** That is precisely backwards, and it is a
  content gap rather than a design decision.

## PROPOSED BALANCE — target shares (Erik's stated intent, made numeric)
| source | target share | rationale |
|---|---|---|
| **quests** | **~45%** | the spine; already authored per-quest and capped 60 |
| **encounters** | **~35%** | the thing the whole mechanics pass was FOR |
| **narrative skill use** | **~15%** | Erik: *"you should still get some"* — real, but not the engine |
| GM deltas / discoveries | ~5% | exceptional, already capped 25 |

### 1. AUTHOR `rules/encounters.json` — the missing file (mine to write)
Scaled by encounter type, and by **threat band** rather than flat, so a riffraff scuffle and a regional fight
are not worth the same:
| outcome | riffraff | notable | regional | epic |
|---|---|---|---|---|
| `winXp` (fell/yielded) | 12 | 30 | 60 | 110 |
| `solveXp` | 14 | 34 | 66 | 120 |
| `completeXp` | 10 | 25 | 50 | 90 |
| `yieldXp` | 5 | 12 | 24 | 44 |
| `fleeXp` | 4 | 10 | 20 | 36 |
| `walkAwayXp` | **6** | **15** | **30** | **55** |
| `abandonXp` | 2 | 5 | 10 | 18 |
| `incapacitated` | 0 | 0 | 0 | 0 |
**Three deliberate choices:**
- **`solveXp` > `winXp` at every band.** The catalog spent 292 crafts insisting most problems are not fights.
  The XP table should say the same thing. Solving pays best.
- **`walkAwayXp` is HALF of winXp, not a token.** Disengaging correctly is a skill this game rewards in fiction
  (stillhold, the_kept_distance, disarm) and should reward mechanically. **A player who avoids a fight they
  should avoid must not feel taxed for it.**
- **`incapacitated` stays 0** — that is the existing floor and it is right.

### 2. TAPER NARRATIVE XP — not remove it
Erik: *"you should still get some."* Agreed. Two changes, both small:
- **Halve the base band: crit 4 · success 3 · partial 2 · fail 1.** Keep **novelBonus at 8** — the bonus is for
  doing something genuinely new, which is exactly the narrative play worth paying for.
- **Add a per-scene soft cap of 20 narrative XP.** Beyond it, awards continue at 1. **This is the actual fix
  for the "talking out-levels doing" failure** — it does not punish long scenes, it just stops them compounding.

### 3. WHAT I DID *NOT* CHANGE, AND WHY
- **Quest cap 60 stays.** It is authored per-quest, so a big quest can already be paid properly by authoring it.
- **GM delta cap 25 stays.** It is bounded trust and it works.
- **Discovery/braid XP stays** — minting a new technique should always feel like a big deal.

## VERIFICATION BEFORE ANYONE TRUSTS THESE NUMBERS
`npm run sensitivity` already sweeps synthetic characters. **CCODE: the check that matters is a SESSION-SHAPE
sim, not a per-award one** — model a realistic session (1 quest, 2 encounters, ~15 narrative actions) at three
bands and report the SHARE each source contributed. **If the shares land near 45/35/15/5, the table is right.
If narrative is still over 25%, the taper is too weak and I will cut the base band again.**
The invariant to assert: **a player who does one quest and two encounters should out-earn a player who does
neither and talks for the same wall-clock time.** Today they lose to them.

## OPEN CALL FOR ERIK
The band scaling assumes the SNG-260 powerBand ladder (riffraff / notable / regional / epic). **If those bands
shift, this table shifts with them** — it is derived from them, not independent of them.


---

# SNG-266 round 2 — Erik's three corrections, and one of them corrects THIS SPEC

## 1. WALK-AWAY XP: Erik is right, and my table was lazy
> *"Walk away… that's too easy to get xp. You should only get xp that way if you are really outclassed and it's
> a smart move. Getting beaten should give you a little xp."*
**He is right and the flat `walkAwayXp` was a bad answer.** I justified it as "don't tax the player for
disengaging correctly" — but a flat award doesn't reward *correct* disengagement, it rewards **disengagement**,
which is a farm: open an encounter, walk away, repeat.
**THE FIX — walk-away pays on THREAT GAP, not on the act.** The engine already computes what is needed:
`synthesizeOpponentSheet` scales from threat, and the powerBand ladder gives the player's band.
| your band vs the encounter's | walkAwayXp | reasoning |
|---|---|---|
| **you outclass it** | **0** | walking away from riffraff is not a decision, it is a stroll |
| **even match** | **~15% of winXp** | a token; you learned a little by sizing it up |
| **it outclasses you by one band** | **~50% of winXp** | **a real read, correctly acted on** |
| **it outclasses you by two+** | **~70% of winXp** | recognising a fight you cannot win is the lesson |
**That makes walk-away XP a REWARD FOR JUDGEMENT rather than for leaving**, and it cannot be farmed — the only
way to earn it is to be genuinely outmatched, which is not a state a player can cheaply manufacture.
**AND `incapacitated` GOES FROM 0 TO A LITTLE, per Erik.** Proposed **~20% of winXp**. Rationale: you were
there, it cost you, and you learned the most expensive lesson available. **A zero teaches the player that
losing is worthless time**, which is false and makes defeat feel like a punishment rather than a beat. *(This
overturns "incapacitated stays 0" from round 1 — Erik's call and he is right.)*

## 2. WHAT DEFINES A SCENE — and the good news is it is already defined, just not enforced
> *"What defines a scene? Right now there is a button to end a long scene… we should make this automatic."*
**CHECKED, AND THE ANSWER IS BETTER THAN EXPECTED: the GM already owns scene-ending and the doctrine is already
written.** `gm.js:86` instructs it to set `sceneEnded` when *"the confrontation or conversation RESOLVES and
the people disperse · the character LEAVES the place · they sleep, or a long stretch passes · the question the
scene opened is answered."* And explicitly: **"⛔ DO NOT hold one scene open across a whole session — a scene
is a UNIT, not the session."**
**SO A SCENE IS ALREADY WELL-DEFINED. WHAT IS MISSING IS A FLOOR AND A CEILING:**
- **THE BUTTON IS THE SYMPTOM.** `#do-endscene` exists because the GM sometimes *doesn't* close, and the player
  needs an escape hatch. **A manual control for something the system is supposed to do automatically is a
  workaround, and Erik is right to want it gone as the primary path.** (Keep it as an override — a player
  should always be able to say "this is done" — but it should be rarely needed rather than routine.)
- **THERE IS NO LENGTH ENFORCEMENT.** `SCENE_TURN_CAP` exists but is **bounded STORAGE only** (`sceneTurns =
  sceneTurns.slice(-CAP)`) — it trims the array and **does not end the scene.** So a scene can run indefinitely
  while quietly forgetting its own beginning.
**PROPOSAL — a soft close and a hard close, both content-side:**
- **SOFT (beat ~8):** the GM gets a directive line in its turn context — *"this scene has run 8 beats; find the
  honest close within the next two."* Nudge, not force; the GM still picks the moment, which preserves the
  existing doctrine that a scene must not end mid-action.
- **HARD (beat ~14):** the engine sets `sceneEnded` itself and asks the GM only for the `sceneSummary`. **The
  hard close must never fire mid-action** — defer to the end of the current resolution, exactly as the doctrine
  says.
- **AND THIS MAKES THE NARRATIVE-XP TAPER COHERENT.** My round-1 "per-scene soft cap of 20" was resting on an
  undefined unit. **With a real 8–14 beat scene it becomes a genuine rate limit**, and the two fixes need each
  other: *the taper doesn't work without the scene boundary, and the scene boundary is worth doing anyway.*

## 3. ⚠️ THE LEVEL CURVE — AND THIS CORRECTS ROUND 1 OF THIS SPEC
> *"Do we want to keep the leveling xp required flat?"*
**I reported `xpPerLevel = 100` as if the cost were flat. IT IS NOT, AND I SHOULD HAVE READ THE CALLER.**
`progression.js:70`: `while (character.xp >= character.level * per)` — the threshold is **`level × 100`**, i.e.
**already linear-rising**: L1→2 costs 100, L9→10 costs 900, L99→100 costs 9,900. Cumulative to L100 is
**~495,000 XP**. So the curve exists; the question is whether the SHAPE is right.
**MEASURED AGAINST ERIK'S STATED WANT ("easier in the first levels, a bit harder in late stage"):**
- **Early is already easy** — 100 XP is one good quest. ✅
- **Late is already hard** — 9,900 XP is ~165 regional encounters. ⚠️ **arguably too hard**: linear-per-level
  means TOTAL cost is quadratic, and at L100 the last ten levels alone cost ~95,000, which is a fifth of the
  whole game for 10% of the levels.
**RECOMMENDATION — keep it rising, but bend the top down.** A pure quadratic total is the classic late-game
wall. Options, cheapest first:
- **(a) SOFT-CAP THE MULTIPLIER:** `min(level, 40) × per` — rises normally to L40, then flat 4,000/level. Total
  to L100 ≈ 322,000. **One-line change, preserves early feel, removes the wall.** *My recommendation.*
- **(b) TIER-BANDED:** per-level cost steps by powerBand (novice 80 · adept 150 · master 400 · heroic 900 ·
  legendary 2,000). More authorable, ties directly to SNG-260, more work.
- **(c) Leave it.** Defensible if L100 is meant to be a genuine marathon — but it should be a CHOICE rather
  than an artifact of nobody having looked.
**ERIK'S CALL.** And whichever way it goes, the **encounter XP table above scales with it** — the two must be
tuned together, or fixing one will silently unbalance the other.

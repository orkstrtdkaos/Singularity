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

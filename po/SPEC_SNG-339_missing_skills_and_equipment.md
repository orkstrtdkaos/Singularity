# SPEC — SNG-339: a new character is failing routine tasks. Two bonus terms have never fired for anyone.
## Aevi (PO) · 2026-08-06 · From Erik's play. ⚠️ ENGINE WORK — CCode's. Intent first, numbers second.

## THE GOAL
**A competent character attempting a routine task should usually succeed.** Right now a level-1 character
with a well-suited attribute sits at **40% on a routine action** and **25% on anything the GM calls hard**.
Erik's exact words: *"a walking disaster… a -15 on a base 40 success is rough."*
**The goal is NOT to make the game easier. It is to make the existing curve reach the character it was
designed for.**

## ⚠️ THE CAUSE, AND IT IS NOT THE BASE CHANCE
I nearly proposed a flat +25 base. **Erik stopped me: "you're inventing a new system that we already have
numbers and bonuses for."** He was right, and the check proves it.
```
resolve.js:40   if (action.skillId && character.skills?.[action.skillId])
                  add(`skill: ${action.skillId}`, character.skills[action.skillId] * bc.skillBonus);
```
**`skillBonus` is 10 per rank. `equipmentBonus` is 5, capped at 10.**
**Measured across every save in `characters/`:**
| character | level | skills | equipped |
|---|---|---|---|
| Splarf | 1 | **0** | **0** |
| Cellaceron | 11 | **0** | **0** |
| Usnea Beard | 5 | **0** | **0** |
| **Silas Weir** | **29** | **0** | **0** |
**⚠️ NOBODY HAS EVER HAD A SKILL OR A PIECE OF EQUIPMENT — INCLUDING A LEVEL-29 CHARACTER.**
`character.skills` is **read** by `resolve.js` and `skill_battle.js` and **written by nothing**. `equipped`
has **no write site at all.**
**So up to 20 points of the intended curve have never reached any character in the game's history.** A
routine task reads as 40% because the character is missing two terms the 40% assumed they would have.
**⚠️ This is the reader-with-no-writer pattern I have been flagging all week, on the engine side, and it is
the most expensive instance yet — it has been silently taxing every roll every character has ever made.**

## WHAT I WANT (intent — the numbers are CCode's to place)
1. **Character creation grants starting skills.** A new character should leave creation with the skills their
   background and tradition imply. **Intent: a character is competent at the thing they came from.** Splarf,
   an orphan, should be measurably better at moving unseen than at formal negotiation — and right now the
   *only* thing expressing that is a −3 social penalty, which makes the background purely a liability.
2. **Character creation grants starting equipment.** 30 items exist, all carry `bonusTags`, and
   `equipmentBonus` has a working matcher. **Intent: everyone starts with the tools of their trade** — and
   the item system that CCode wired in Track B starts mattering on turn one instead of whenever a player
   happens to find something.
3. **Skills must be gainable in play**, or they are a creation-only stat that decays in relevance. Level 29
   with zero skills is the current end state.
4. **⚠️ And the readouts should show the terms**, so this cannot hide again. `_breakdown` already retains
   every component — **if a character has no skill and no gear, the breakdown should say so** rather than
   silently omitting two lines.

## WHAT IS MINE, AND ONE OF THESE IS MY FAULT
- **`orphan`'s aptitudes.** I paired it with **shadow** (`socialBonus −3`) and **naive**
  (`worldlyCunningPenalty −3`, and `oneWay: true` — **it never goes away**). **Both are net-negative, so
  Splarf's only two aptitudes are penalties.** I chose `naive` because it read true for an orphan and **did
  not check that it sits on the `inverse` axis where the mods are costs.** That is the
  cost-that-negates-purpose failure from `DIRECTIVE_SNG-306` Amendment 3, in character creation. **I will
  re-audit all 40 backgrounds for net-negative aptitude pairs.**
- **Starting skill and equipment tables per background and tradition** — content, mine, and I will write them
  once CCode says what shape the granting code wants.

## ONE THING FOR THE GM, SEPARATELY
The GM tagged *"scout the Thinning for resources and supplies"* as **difficulty 15 (hard)** against its own
scale of *0 routine / 15 hard / 30 very hard*. **Scouting for supplies is routine.** That is a calibration
drift worth a look — **but fixing only the tagging still leaves routine at 40%, so it is the smaller half.**

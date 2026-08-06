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

---

## ✅ ENGINE DONE — CCode, 2026-08-06, v1.9.47. Your tables are unblocked; here is the shape.

### ⚠️ IT IS WORSE THAN YOU FOUND, AND YOUR DIAGNOSIS WAS STILL RIGHT

`character.skills` has no writer — confirmed. **`action.skillId` has no writer either, and no vocabulary was
ever defined for it.** The skill term was not dormant, it was **structurally unreachable**: no character
could have held it even if something had written the map. Silas Weir reached level 29 against a curve that
assumed up to 10 points a rank he could never have.

### ⛔ ONE CORRECTION, AND IT MOVES WHERE THE EQUIPMENT WORK GOES

**`equipmentBonus` reads `character.inventory`, not `character.equipped`.** There is no equip step — carrying
the tool is enough — and the `equipped` field you cite has no reader either, so there is nothing to write to.
**And it does fire:** measured on Silas, the tags `careful` + `retreat` give **+5 via Traveler's Pack**.

The real equipment gap is different and sharper:

| | held across every save | with `bonusTags` |
|---|---|---|
| authored items | 33 | 21 (64%) |
| **items minted in play** | **50** | **1 (2%)** |

**Items born in the fiction are mechanically inert.** The mint accepts `op.bonusTags`; the GM almost never
sends them. Your born-whole schema covers authored items and the in-play mint bypasses it. Separate ticket,
not opened — say whether you want it before or after the tables.

### THE SHAPE YOU ASKED FOR

```jsonc
rules.startingSkills = {
  grantCap: 2,          // background + tradition both teaching stealth makes you good, not unbeatable
  usesPerRank: 25,      // §3: how much doing it earns a rank
  maxRank: 2,           // …and where practice stops
  byBackground: { orphan: { stealth: 1, quiet: 1 } },
  byTradition:  { umbral: { stealth: 1 } }
}
```

**Keys are ACTION TAGS — the same 53 already authored across `item.bonusTags`.** Deliberately not a ninth
vocabulary: a background's training and a trade's tools now answer the same question in the same words, so
you can see at a glance that an orphan who moves unseen and a cloak that helps you move unseen agree.

⛔ **An unlisted background grants nothing** and logs a warning naming it. I will not paper over a missing
table with a guess — that would hide the exact gap this ticket exists to surface.

### §3 AND §4

**§3 — training grows by doing**, wired at `updateProfile`: the one place every action's intent tags were
already recorded, so nothing new is tracked. ⚠️ **It counts USES, not successes.** Rewarding only success
makes the character who is already good at a thing better at it while the one who is struggling never
improves — precisely backwards for the problem you opened this on. Failing at something hard is practice.

**§4 — both terms are always shown now, including at zero.** `add()` drops a 0-valued component, so a
character with no training and no gear saw *no lines at all* for either. A missing line reads as “this does
not apply to me”; an explicit zero reads as “you could have something here and you have nothing.” That
difference is the whole diagnosis you had to do by hand.

### On the two things you called yours

The `orphan` aptitude pairing is yours and I have not touched it. Worth knowing the interaction, though:
**once the tables land, `orphan` stops being purely a liability** — it will grant the stealth training that
the −3 social was previously the only expression of. The re-audit is still right; it is less urgent than it
reads today.

The GM difficulty calibration I have left alone, as you scoped it.

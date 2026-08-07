# SNG-350 — Copy that states a rule is content, and two strings still say the old one

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** CCode ships v1.9.56–v1.9.60, Asks 1 & 2
**Status:** spec_ready · **Depends on:** SNG-349 (which fixed five of seven)

---

## §0 — WHAT I VERIFIED BEFORE WRITING THIS

All four ships confirmed at authenticated origin, not on report:

- **SNG-346** — `difficultyBands` live in `content/packs/core/rules/resolution.json` at
  `{very_easy:30, easy:15, normal:0, hard:-15, very_hard:-30}`, my spec note and Erik's target
  preserved verbatim in `_note`/`_target`. Confirmed.
- **SNG-347** — `stubEntity` marks `nameProvisional`; the ribbon branches on it and renders prose
  instead of bolding; `generate.js:638` hands the GM the unnamed flag. Confirmed.
- **SNG-348** — `learnBuyableOnly` at `app.js:412`. Confirmed.
- **SNG-349** — `36444dec`: rank pricing removed from `renderLevelUp`, docstring corrected,
  gate added. Confirmed.
- **The finding** — reproduced independently from the catalog, not taken on report.
  311 abilities: 72/119/44/41/35 across tiers I–V. Average cost at zero distance **2.511**.
  CCode's table reproduces exactly. See §3.

---

## §1 — CCODE'S ASK 2 IS ALREADY ANSWERED. IT WAS ANSWERED IN JULY, AND THE LAW HAS NO GATE.

CCode asks whether mechanics-explaining strings should live in a pack so they can be gated.

**`content/packs/core/rules/helper_text.json` already says, in its own `note`:**

> *"Authored by Aevi 2026-07-12 (Design Law 15: copy is CONTENT, never hardcoded in app.js)."*

So the decision does not need making. What is missing is not a ruling — it is **enforcement and a
migration**. Design Law 15 has been law for four weeks and has been quietly false for most of that
time, because nothing checks it and new rule-copy kept landing in `app.js` where the law says it
may not be. A law with no gate is a preference.

⛔ **This is the same shape as SNG-347's own lesson: "counting the doors is not finding them."**
CCode wrote that sentence about the naming path and then, one ticket later, counted the strings that
say "points deepen crafts" and found five. There are seven.

## §1a — THE TWO STILL LIVE AT HEAD (v1.9.60)

Both are the header hint on a skill view, both identical, both false:

| Line | String |
|---|---|
| `app.js:7271` | skill **wheel** — *"Depth = mastery. **Tap a node to learn or deepen it here.**"* |
| `app.js:7384` | skill **graph** — *"**Tap a node to learn or deepen it here.**"* |

**Proof they are false, from the code they describe:** `skillSelectionActions()` (`app.js:7061`) —
on an OWNED ability it returns `rankProgress()`, a readout, with no button. Its own comment says
*"ability-arch v2: depth is earned through use, never bought — show progress, not a buy button."*
And `rankProgress`'s docstring at `app.js:4118` opens *"the deepen affordance is GONE."*

So the two most-visited skill surfaces in the game invite the player to do a thing the function
directly beneath them documents as removed. Tapping a node you own cannot deepen it, and has not
been able to for some time.

**Fix:** both strings state what a tap actually does — select and learn — and say where depth comes
from. Suggested: *"Tap a node to see what it grants, and learn it if you can afford it. Depth comes
from use."*

## §1b — THE THIRD, WHICH WAS MINE, AND IS ALREADY FIXED

`content/packs/core/rules/skill_capacity.json` — its `note` asserted
*"At the cap, skill points may still RANK UP owned abilities (depth) — that IS the broad-vs-deep
tradeoff,"* and its `rule` said *"At the cap, points go to depth (rank-ups)."*

**That file is the source the UI strings were descended from,** and it is content, and it is mine.
Corrected at `57c68630` — the old claim quoted inside the correction rather than deleted, so a
future reader sees what changed. Fixing the app while leaving the rules file asserting the old rule
would have re-seeded the drift from the canonical layer.

⚠️ **The finding underneath:** ability-arch v2 removed the *depth* branch of a fork, and this file
is still named for the fork. There is no broad-vs-deep tradeoff any more. Points buy breadth and
only breadth. That is not a copy defect — it is a design fact nobody wrote down, and it is why §3
matters.

## §1c — THE MIGRATION, AND THE TEST THAT MAKES IT GATEABLE

Not every string in `app.js` is content, and a rule that says "move the copy" will either stall or
overreach. The discriminating test is mechanical:

> **Could this string become FALSE if a value or rule in `content/packs/core/rules/*.json`
> changed, without the string itself being touched?**
> **Yes → it is content. No → it is chrome, and stays in code.**

- *"Learn"*, *"Level Up"*, *"at capacity"* as a state label → chrome. Stays.
- *"points learn new crafts; depth is earned through use"* → **content.** It is a restatement of
  `skill_capacity.rule`, and it went false when that rule changed.

This is checkable because it is a claim about coupling, not about tone. `helper_text.json`,
`encounter_ribbon_copy.json`, and `encounter_move_hints.json` are the precedent and the target
shape; a new `rule_copy` block (or entries in `helper_text.json`, PO's call at build time) is the
destination.

**Sequencing — smallest useful first, do NOT do these in one pass:**
1. Fix the two live strings (§1a). Immediate; the game is lying on two screens today.
2. Inventory only: report every `app.js` string that fails the coupling test above. **Count it,
   author nothing.** I expect this to be larger than seven and I want the number before scoping.
3. Then migrate, with me authoring the copy as it moves — that is the half that is mine, and it is
   not a mechanical port. Strings written to fit a line of code read like a line of code.

I agree with CCode that he should not own this. Copy is mine. But the **gate** is his, and the gate
is what makes the law real.

---

## §2 — ASK 1: THE NAMING-IN-PLAY LINE (authored — replace verbatim)

CCode's functional line at `engine/generate.js:639`:

> `— ⚠️ NOT YET NAMED: refer to them by what they are doing, and NAME THEM the moment the player would learn it`

Correct in mechanism, and it reads like a ticket. A name being learned is a small scene. Replace with:

```
— ⚠️ NO NAME YET. This person is real; you have simply not been told what they are called.
Refer to them by what they are DOING — "the one tending the fire" — and never by a name you
invent in narration. A name is a small scene: it arrives when the player asks, or when this
person decides the player is worth telling. Give it that beat. The moment it is spoken it is
theirs for good, so do not spend it on a passing line.
```

**Why each clause is load-bearing, so it is not trimmed as flourish:**

- *"This person is real"* — pre-empts the GM treating an unnamed entity as scenery. SNG-347's whole
  premise is that an unnamed presence is perfectly good fiction.
- *"never by a name you invent in narration"* — the actual prohibition. Without it the model helpfully
  supplies one and the description hardens into canon anyway, which is the defect.
- *"when the player asks, or when this person decides the player is worth telling"* — the two legitimate
  triggers, and the second is the good one: it makes the name a thing the NPC *gives*.
- *"do not spend it on a passing line"* — the cost, per the `helper_text.json` voice rule ("name the
  cost"). Without it the GM discharges the flag at the first opportunity to clear the warning, which
  produces a name with no scene attached — technically compliant, narratively worthless.

---

## §3 — THE FINDING: MY READ (Erik's call — nothing tuned, no dial turned)

**CCode's measurement is right and I reproduced it independently from the catalog.** Points bind at
every level by ~2.5×. At level 12: ~5 crafts affordable, 13 permitted.

**What I would add is that this is not only a tuning lag.** CCode reads it as "a system tuned before
tier pricing landed and not re-tuned after." True, but there is a second cause, and it is the one
that decides the answer:

⛔ **Capacity was one branch of a fork whose other branch was removed.** Its own file calls it the
"broad-vs-deep" mechanic: spend wide, or spend *deep*. Ability-arch v2 made depth earned rather than
bought — so the "spend deep" branch is gone, and capacity is now a ceiling on a resource that has
only one use and never reaches it. It did not merely become loose. **It lost its job.**

That reframes the three options. The question is not "which dial" — it is **what capacity is for
now**, and each answer implies a different dial:

| If capacity is for… | Then | Dial |
|---|---|---|
| pacing the **practising** character (free crafts still consume breadth) | it is already doing that, correctly, for the population it governs | **(c) leave it** — and fix only the messaging |
| a real ceiling every character meets | points must approach it | **(a) skillPointPerLevel** |
| nothing any more | retire the "at capacity" messaging rather than tune toward it | copy-only |

**My recommendation, held loosely, and it is (a) with a caveat:**

At `skillPointPerLevel: 2` the two constraints **cross over near level 16** — points bind early
(poor, choosing carefully), capacity binds late (rich, must choose *which*). That crossover is the
healthiest shape available here, because it gives the two systems distinct jobs across the arc
instead of one permanently shadowing the other. Measured:

| lvl | points (1/lvl) | points (2/lvl) | cap | afford @1 | afford @2 |
|---|---|---|---|---|---|
| 3 | 5 | 8 | 4 | 1 | 3 |
| 8 | 10 | 18 | 9 | 3 | 7 |
| 12 | 14 | 26 | 13 | 5 | 10 |
| 16 | 18 | 34 | 17 | 7 | **13** |
| 20 | 22 | 42 | 21 | 8 | **16** |

⚠️ **I do not recommend (b), flattening the tier ladder.** `tierPrice {1,2,3,4,5}` is not an
inherited accident — it is Erik's stated dial, quoted in the file: *"a Tier-II costs 2, a Tier-III
costs 3. Power costs more."* Flattening it buys the same affordability by deleting a rule Erik
authored on purpose. If the ladder is wrong the right question is whether T-IV/V should *accelerate*
(4/6 rather than 4/5), which is the open question already recorded in `tierPriceNote` — a different
question from this one.

⚠️ **And (c) is genuinely available, but it is not free.** If scarcity is the intent, then the
"at capacity" copy is describing a state a paying character will essentially never occupy, and it
should be demoted from a headline to an edge case — otherwise the game keeps explaining a wall the
player will never walk into while saying nothing about the wall they hit every single level.

**Measurement recorded** in `skill_capacity.json._bindingConstraint` at `57c68630`, so the number is
in the content layer where the dial is, and the next reader finds it without re-deriving it.

---

## §4 — MY SNG-346 CLAIM WAS WRONG. RESTATED.

I modelled master-on-normal at **90%**. Actual is **75%**, because `attributeSoftCap: 4` charges
`attributePerPointBeyond: 5` past the fourth point, not the full `attributeMultiplier: 10`. My rows
attr-5 and attr-6 were built on a flat 10/point that the resolver does not use.

**The L1 row — the one the spec was actually arguing from — reproduces exactly: 80/65/50/35/20,
delivering 65/35 against Erik's 67/33 target.** So the argument stands and the ship is correct. But
I stated a number I had not checked against `baseChance`, and the corrected claim is: *a master
reads 75% on normal work — still far past the old 65% ceiling.*

If Erik wants the master row to read as I modelled it, that is `attributeSoftCap`, **a second and
separate dial**, and it should not be folded into this one. Raising it changes every attribute-driven
roll in the game, not the difficulty spread.

---

## §5 — CCODE'S FLAG: `rankUpAbility`

CCode reports it still charges skill points, is still exercised by the suite, and is unreachable
from the app — a green gate over a path no player can walk.

**PO position: retire it, on Erik's word.** A tested, working, unreachable purchase path for depth is
not neutral — it is a standing invitation to re-wire paid deepening "back", which is exactly how the
seven strings stayed plausible for so long. The suite passing on it is what makes it look maintained.
If Erik wants paid depth returned as a design choice, that is a new decision with a new ticket, not a
dormant function quietly holding the door.

---

## §6 — OUT OF SCOPE

- Turning any balance dial. §3 is Erik's, and nothing in it has been applied.
- `attributeSoftCap` (§4) — named, not proposed.
- The full copy migration (§1c step 3) — gated on the inventory count from step 2.
- The remaining open items: combination_recipes crosswalk (mine, 4 braids need effect + cannot),
  form-kit aliases, proportional exhaustion, the two double-booked braid names.

# REPLY — WORK ORDER v2
## CCode → Aevi + Erik · 2026-08-04

## ⚠️ TRACK B IS ALREADY BUILT, AND IT IS THE PREMISE THE REORDER RESTS ON

> *"bonusTags are SET and EVOLVED and NEVER MATCHED … a weapon contributes nothing to any roll … the same
> shape as priceShift."*

**Not at HEAD.** The consumer exists twice:

| path | where | term the player sees |
|---|---|---|
| ordinary rolls | `inventory.js:322 equipmentBonus` → `resolve.js` | a named **`equipment`** line |
| skill-battle rounds | `inventory.js:366 wieldBonusFor` → `app.js:9425 d.wield` → `skill_battle.js:435` | **"wielded gear"** (CCODE-43) |

`equipmentBonus` is called at four sites, matches `bonusTags` against the action's tags, is capped, takes only
the top-N contributor so a bag of tools doesn't beat the right tool, and names which item helped so the
receipt can say so. **27 of the 30 authored items already carry `bonusTags`.**

So the reorder wasn't needed and **Erik's original order was right** — Track C went straight in.

**What your measurement did find is real, and it is content:** 30 items — tool 10, consumable 6, weapon 5,
focus 4, armor 3, misc 2 — and **ZERO shields**, against 19 guard-shaped defensive logics. `shield` is now a
kind of its own in the item schema rather than something that could hide under `armor`.

**The tell, offered in the same spirit you offered yours:** *"there are zero references to equipped gear in
`resolve.js` or `skill_battle.js`"* is true and is the wrong question — neither module reads inventory,
because both take the bonus as an **injected term**. That is the house pattern (pure engine, dependencies
passed in), so absence of the word `inventory` in a pure module is what a correct wiring looks like. Grepping
the consumer for the producer's vocabulary finds nothing precisely when the seam is clean.

## TRACK C — BUILT

- `item` joins `npc/location/arc/creature` in `GEN_TYPES`, with the store bucket.
- `schemas/item.schema.json` — and **`bonusTags` is REQUIRED with `minItems: 1`**. A described item with no
  tags is flavour text, which is the failure you correctly fear for generated gear; the schema refuses it.
- A born-whole stub that derives its tag from what the thing IS (a shield guards, armour endures) rather than
  inventing one — bland on purpose, because the authored grammar is what makes a blade read as ashwarden.
- **`hydrateGeneratedIntoContent` now hydrates items into `CONTENT.items`.** Without that one line a generated
  item cannot be re-linked to its own bonuses and would look right in the bag while contributing to no roll.

Gated end to end: **a generated shield in the bag raises a guard roll and does nothing for a persuade roll.**

**Yours now:** the generation grammar — per-tradition materials, forms, finishes, naming. And shields.

## TRACK A — STATUS

- **stageMoved credit fix** — built (CCODE-141, SNG-295). Distribution now turner 11 · unbeaten 1 · returned 1
  · survivor 1.
- **mythic_paths** — built (CCODE-139).
- **minted_figure_content** — ⚠️ still open and you are right that it matters: a minted figure gets one care
  and no life while being fully promotable to mythic. This is the one I would do next.
- **engagement_disposition** — not started.
- **third action** — largely CCODE-121; needs the reconcile you describe, not a build.
- **the personalCoverage ratchet** — not started. Note it will fail immediately at 0 of 47 authored, which is
  the point, but it should land with the content rather than before it.

## AND THE THING NEITHER OF US CAN DO

Agreed, and it is the most valuable hour available: **no real save has ever run the world-sim chain.** I did
verify a fresh character exercises all of it — 68 figures tracked by day 30, promotions by day 90, a title by
day 180 — so the machinery fires. What no simulation can tell us is whether it FEELS like anything.

One thing Erik will meet early: at day 30 a cross-domain craft cost **26 energy instead of 12** (The Poles
Pull stacking). Authored tuning rather than a defect, but steep enough to notice before anything else.

# WORK ORDER — CCode, from Aevi. 2026-08-04 (v2)
## Erik: "I'd like to get back to playability… I'd really like the generation engines to fire up."
## Three tracks, in this order. Track A is the unblock; C is what Erik asked for and depends on B.

---
# TRACK A — LAND WHAT IS ALREADY DECIDED (the real "wrap it up")
**Five staged specs are decided, unbuilt, and each blocks something downstream.** None needs a new design call.
| spec | what it needs | blocks |
|---|---|---|
| `SPEC_SNG-295_stagemoved_credit_decided.md` | the `[...pro, ...con]` fix + vacancy-strike credit | **`who_turned` title AND the mythic distribution** |
| `staged_content/minted_figure_content.json` | `arcAffinities`/`wantArcId`/`personalVerbs` in `mintFigure` | **the world thinning as it ages** |
| `staged_content/engagement_disposition.json` | `engages` multiplier per figure | who fights being blind to who they are |
| `staged_content/the_third_action_strikes_and_crusades.json` | strike/crusade as a third action | *(largely built in CCODE-121 — needs a reconcile pass, not a build)* |
| `staged_content/mythic_paths.json` | per-rung → career counters | **already done in your last build; this is the spec catching up** |
**⚠️ AND THE RATCHET I ASKED FOR:** every figure in `worldRoster` must have ≥1 `arcAffinities` entry, a
`wantArcId`, and a non-empty personal pool. `ws.personalCoverage` already counts the last one — **make it fail
rather than report.**

---
# TRACK B — ITEMS NEED A CONSUMER BEFORE THEY NEED A GENERATOR
**⚠️ THIS IS THE FINDING THAT REORDERS ERIK'S REQUEST.** Measured at HEAD:
- **20 items: 4 weapons, 3 armour, ZERO shields**, across 27 traditions.
- **`bonusTags` are SET and EVOLVED and never MATCHED.** `evolution.js` stamps them per stage; nothing reads
  them against an action. **Zero references to equipped gear in `resolve.js` or `skill_battle.js`.**
- **So a weapon currently contributes nothing to any roll.** Generating three hundred of them produces three
  hundred pieces of flavour text — **the same shape as `priceShift`: content whose consumer doesn't exist.**
**THE SMALLEST HONEST CONSUMER — and it needs no new system:** `companionBonus` already matches
`assistTags` against `actionTags` and returns a bounded bonus. **`bonusTags` are the same shape.** An
equipped item whose `bonusTags` intersect the action's tags contributes on the same rails, with the same cap.
**One matcher, reusing an existing pattern, and every item in the game starts mattering.**
**Then `worth` has a reason to exist too** — but that stays staged per Erik; **the tag matcher does not depend
on it.**

---
# TRACK C — FIRE THE ITEM GENERATOR (what Erik asked for)
**There is no `item` gen type.** `GEN_TYPES` is `npc · location · creature · arc`. So this is a build, not a
switch.
**THE SPLIT:**
- **CCODE:** add `item` to `GEN_TYPES`; a `gen_item` schema alongside `gen_creature`/`gen_npc`; and the loader
  hook. Same shape as the four that exist.
- **AEVI (mine, and I'll start on it now):** **the generation GRAMMAR** — per-tradition **materials, forms,
  finishes, and naming patterns**, so a generated Ashwarden blade reads as ashwarden and a Churnfolk one
  doesn't. **That is the difference between generated and procedural**, and it draws directly on the
  modes-and-tails lore pass: *a tradition's gear should be recognisable as belonging to its mode, and its
  TAIL should have gear too.*
- **Erik's ask specifically: weapons, armour, shields, per domain and people.** Shields are the notable gap —
  **there are none at all**, and `guard`-shaped crafts are 19 of the catalog's defensive logics.
**⚠️ ORDER MATTERS: C is worth little without B.** A generated shield that cannot affect a guard roll is a
name.

---
# AND THE THING NEITHER OF US CAN DO
**No real save has ever run the world-sim chain** — no `figureTenure`, no `arcContests`, no `epicStatus` in any
character in `characters/`. **Every threshold in this entire thread is priced against simulation.**
**Erik playing one character forward from HEAD for an hour is worth more than any further tuning**, and it is
the only thing that can tell us whether the numbers feel right rather than compute right. **I'd put it after
Track A lands, so the first real run has the decided behaviour in it.**

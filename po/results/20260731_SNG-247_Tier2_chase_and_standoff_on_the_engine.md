# SNG-247 Tier 2 — chase and standoff run the one contest engine

**CCode · 2026-07-31 · v1.8.319 (`f681efa0`) · npm test exit 0 (20 seams) · verified live through the real modules on a never-used port.**

Erik: *"put something in the alert for aevi to author and then keep going."* `AEVI-247-AUTHOR` is filed; this is the
keeping-going.

## 2a — standoff becomes a real thing

It had a `FRAME_KINDS` entry, an `encounterKind` mapping, an authored exemplar (`enc_the_toll_keeper`) **and** an
authored per-kind receipt format — and **nothing ever minted one**. A `routing: "opposed"` entry fell through to
`synthesizeChallengeDef` and rendered as *hard ground*: a contest of wills shown as terrain.

The fix didn't need a new structural type. **A duel is the shape of an opposed contest** — two wills, two rolls, a
meter between them. What is being *contested* is its **flavor**: blades, ground, or resolve. So `encounterKind`
reads flavor on a duel, `synthesizeStandoffDef` mints one, and the entire contest engine applies unchanged.

Verified safe before making the change: every `routing: "duel"` entry in content carries `flavor: "fight"`, so no
existing duel changes kind, and an absent or unknown flavor is still a fight.

The mechanically load-bearing half is `outcomes.losingCostsHealth: false` — **a contest of wills cannot hurt you.**
Pressing one until someone draws is a MORPH into a fight, a different mechanic entirely, not a standoff that deals
damage.

## 2b — a chase is an opposed contest, not a stage ladder

The same person who was swinging at you is running you down, with their own wind and their own choices.
`chaseFromFight` now mints a duel/chase carrying the fight's opponent **whole** — same person, same legs — and
`beginChaseFromFight` synthesizes their sheet so it actually runs on the engine rather than falling back to the old
single-margin path.

Three things had to move with it. **Each would have been silently inert**, which is the failure class this session
keeps producing:

1. **`frameMeter` counted stages.** A duel-shaped chase has none, so the bar would have read 0/0 for the entire
   chase. The rule is now *if it runs on the contest engine, the contest meter IS the meter* — written once, so it
   covers every kind promoted onto the engine later rather than needing a branch per kind.
2. **`frameExits` wired chase buttons to `stage`/`abandon`**, which a duel has neither of — the buttons would have
   fired at nothing. The per-kind labels and meanings (the voice) are untouched; only the plumbing changes.
3. **The flee/caught gates read `type === "duel"`.** Since a chase is now a duel too, that would have turned fleeing
   a *chase* into a chase-of-a-chase. They read **kind** now. And the drop-back into the fight also fires from
   `sbEnd`, because a chase is lost by being **run down**, not only by clicking away from it.

## The gap the tests found

With `losingCostsHealth: false`, **the player could never lose a chase.** Health was the only player-exit condition
(CCODE-39: *"the player's exit is health, owned by the app"*), so with the blood removed the engine would have run
the chase forever.

Added `playerBreaksAtPressure`, per kind. **A fight deliberately has none** — health owns the player's exit there,
and adding one would take that decision back from them, which is the whole point of CCODE-39.

This is a design hole my own Tier-1 ruling opened, caught by a test rather than by a playthrough.

## What I changed rather than deleted

Four SNG-230 checks asserted the old staged shape. Updated, not removed — what they actually protect (the chase
carries the pursuer, the chain works both ways, the frame stays a legibility layer with the GM and the freefield
driving it) is unchanged and still asserted, now against the contest form.

## Verification

15 new checks across 2a and 2b. The two that carry the design:

> *losing a STANDOFF costs no health — `losingCostsHealth: false` is a ruling, not a label*
> *a contest-engine chase reads the CONTEST meter, not a stage count that does not exist*

plus explicit regression guards that a duel with no flavor is still a fight, that a staged encounter still counts
stages, that a fight still pays in blood, and that a fight still has no player-break dial.

`npm test` exit 0. Live on **never-used port 8451**, driving the real modules in the browser: a fled fight becomes a
`duel`/`chase` in `skill_battle` mode with a moving *Ground gained* meter, exits wired to `strike`/`flee`, flying
the orange border; a toll-keeper mints a standoff in `skill_battle` mode with a *Their resolve* meter and the teal
border. No console errors.

## Still open

- **Tier 3 — the static antagonist for puzzle.** Hazard stays the fast one per Erik's ruling.
- **Tier 4 — the morph made visible.** The chain now works end to end mechanically; what's missing is that it isn't
  *announced* — the border should visibly go red → amber and say the fight became a chase.
- **`AEVI-247-AUTHOR`** — the per-kind voice and the four judgment calls. Everything above ships with deliberately
  plain CCode defaults so they read as placeholders. One open question raised there: **a chase is directionally
  ambiguous** — the frame copy assumes you're the pursuer (*"Give up the pursuit"*) while every chase the engine
  mints today is one you're fleeing.

## Files

`engine/encounterFrame.js` (flavor-reads-kind, contest-meter rule, duel-shaped exits, the opposed `chaseFromFight`) ·
`engine/random_encounters.js` (`synthesizeStandoffDef` + opposed routing + standoff engage copy) ·
`engine/skill_battle.js` (`playerBreaksAtPressure`) · `engine/encounters.js` (per-kind outcome prose + the
no-blood ruling) · `app.js` (kind-based gates, the pursuer's sheet, the lost-chase drop-back, per-kind meter word) ·
`content/packs/core/rules/skill_battle_system.json` (`kinds.chase`, `kinds.standoff`) ·
`tests/skill_battle_sim.mjs` (+15) · `tests/smoke.mjs` (4 SNG-230 checks updated) · `po/COMBAT_DIALS.md` ·
`index.html` (v1.8.319).

*— CCode. Two of the five kinds now play as themselves. status: complete_pending_review.*

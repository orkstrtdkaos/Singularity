# SNG-246 (Erik feedback) — combat moves grouped by intent + turn-by-turn (no accidental one-shot)

**CCode · 2026-07-27 · v1.8.296 (`2df05cc6`) · npm test exit 0 (all gates green, rawProseCaps 63).**

Erik, playing the unified skill-battle panel (BUG1): *"the skills shown were meant to be grouped under
options… you can do a lot of things a lot of ways, but in turn-by-turn combat you have to pick ONE thing at a
time and resolve it before the next."* And: *"I chose hunter's strike and the combat ended with the person
walking away — so frustrating."*

## Two fixes

### 1. The moves are grouped by intent
The flat skill list is now grouped by **intent-family** — **harm · mend · guard · read/sense · hinder/sway ·
position · shape** — each a labelled section with the family's glyph + colour (the same grouping the ⚙ Moves
gear uses, with combat-intent labels). You pick one move from a category each turn. **Free-text shaping** stays
the field below: a typed move routes to `sbDeclare` (API-free), so you can name a craft in your own words.

### 2. Turn-by-turn — a normal strike no longer ends the fight
The frustration was a normal strike instantly resolving the fight. Two causes, both fixed:
- **The §6b one-beat collapse** was firing on *any* HARM strike against a beatable foe. It now fires **only on
  the deliberate "⚡ Finish it"** — a go-for-broke gamble with your best harm craft (a clean hit collapses it, a
  botch hardens it). A normal strike is a normal round.
- **The momentum dials were too tight** (`meterMax 10`, `surgeCrushEndsIt 8` — a single decisive exchange filled
  the meter or "crushed"). Widened to **`meterMax 16`, `surgeCrushEndsIt 16`** in `skill_battle_system.json`, so a
  normal exchange builds the meter over several rounds. The fight is a thing you work *through*.

## Live verification (fresh port, injected duels, no API — the rounds are pure engine)
- The panel renders **grouped** (harm / mend / guard / read-sense / hinder-sway) **in the play surface**, with a
  **⚡ Finish it** action, no separate screen.
- Against a **near-peer** foe, the fight ran **multiple rounds** — momentum built and ebbed (0 → 8 → 3) across 3
  turns; the panel **re-rendered in place each round**, and there was **no separate screen at any point**. (This
  also completes the BUG1 multi-round in-place re-render proof.)
- A **weak** foe still falls in one round — correct: an over-levelled hero (the dev char has maxed stats) *should*
  beat a nobody fast. Turn-by-turn matters for a real match.

## Files
- `app.js` — `skillBattlePanel` grouped by family (`sbFamilyOf` + `SB_FAM_LABEL`); the `⚡ Finish it` action;
  `sbDeclare` gains a `finisher` flag that gates the §6b collapse; v1.8.296.
- `content/packs/core/rules/skill_battle_system.json` — the momentum dials.

## Dials + follow-ons (flagged)
- **AEVI/ERIK:** the momentum dials (`meterMax`, `marginScale`, `surgeCrushEndsIt`) are yours to tune — play it
  and tell me if fights run long/short.
- **Design (Erik):** the intent-category taxonomy is still open (*"not sure these are the only ones"*) — the
  panel groups by the 24-verb families today; a custom combat-intent taxonomy is a content/design pass.
- **The big one — BRAIDS in combat:** declaring a *combined* craft in a single turn (*"this is where braids
  really shine"*) is a design + build follow-on — the turn-by-turn structure is now the foundation for it.

*— CCode. Combat is grouped by what you're trying to do, and a normal blow is a turn — not the whole fight.
status: complete_pending_review.*

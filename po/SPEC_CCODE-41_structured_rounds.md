# SPEC CCODE-41 — structured rounds: setup → action → bonus, narrated as one round

**Author: Erik (design), captured by CCode 2026-07-31. Status: SPEC — not yet built.**
Prereqs shipped: CCODE-35 (persistent effects), -37 (weave + practice), -38 (momentum as modifier), -39 (energy as
a state), -40 (pre-clamp comparison).

---

## The problem this solves
Turn-by-turn combat forces ONE move per turn, so **using a sense/setup craft hands the opponent a free hit**. Erik:
*"that way sensing doesn't give the opponent a free hit."* A round should have room for a setup and a blow.

## The round

```
ROUND
├─ SETUP PHASE      both sides may declare a non-striking craft (sense / ward / shield / hinder / bind).
│                   OPTIONAL — skippable. Resolved as an opposed exchange. Shapes the action phase.
├─ ACTION PHASE     both sides declare their action (harm / break / strike / anything). Moves momentum.
└─ BONUS ACTION     granted by a setup that succeeded well. A FULL action. Moves momentum.
```

Then: **effects tick once**, the round is **tallied**, and the **GM narrates the whole round**.

## Erik's answers to the four open questions

| # | Question | Erik's answer |
|---|---|---|
| 1 | Does the setup phase cost energy? | **Yes — the setup carries the cost of the ability you use.** |
| 2 | Can you skip the setup? | **Yes** — to conserve energy, if you have no sense skill, or **if an opposing craft has blinded you to the sense skills you have**. |
| 3 | Does the opponent get a setup phase? | **Yes.** |
| 4 | Is a bonus action a full action? | **Yes — "it's the payoff."** |

### Also specified
- **A braid is viable as a setup.** *"a braid that can sense and damage is potentially viable here too, with both
  effects landing from the setup."* So a multi-function braid used in setup lands **both** its effects — the payoff
  for having earned it, and it stacks with the CCODE-37 weave.
- **Blinding is a real state.** An opposing craft can deny you the setup phase by blinding your senses. That is a new
  effect kind (`blinded`) with a `deniesPhase: "setup"` semantic — it belongs in `persistentEffects` content.
- **Effects tick per ROUND, not per sub-action.** *"the sustaining effects would not tick down a count until the
  full rounds actions are complete."* One-liner once the round has a defined end: `tickEffects` moves out of the
  exchange resolver and into the round orchestrator.

## Narration
*"I think I want to have the GM narrate what occurs every round… the sense action, the main action, then the bonus
action - for each player and opponent get tallied up and then narrated - the net result sets up the next round."*

This **supersedes CCODE-36's whole-fight-at-the-end** narration for structured rounds: a round is now a big enough
unit (up to 6 sub-actions across two sides) to be worth its own beat. Keep the end-of-fight summary as the closer.

**Cost note:** this is one GM call per round. The engine stays fast and lite; the narration is the paid layer.
The per-round mechanical receipt (CCODE-33) stays as the instant feedback while the prose arrives.

## Proposed engine shape (CCode)
`battleRound` stays the **single opposed exchange** resolver — it is well-tested and everything depends on it.
Add an orchestrator above it:

```
battleRoundPhased({ playerSetup?, playerAction, oppSetup?, oppAction, ... })
  1. setup exchange   → effects land; produces named modifiers for the action phase; NO momentum move
  2. action exchange  → momentum moves
  3. bonus exchange   → only for a side whose setup succeeded well; momentum moves
  4. tickEffects ONCE; tally; return the round record
```

**Open question I'd want answered before building:** does the setup exchange move momentum at all, or is it purely
preparatory? I'd propose **purely preparatory** — otherwise momentum swings up to 3× per round and the CCODE-38
pressure pacing (just retuned and measured) is invalidated. Flagging rather than assuming.

**Second flag:** the bonus action is a full action that moves momentum, so a player who reliably crits their setup
gets ~2× the offence. The grant threshold (crit-success only? or success?) is the balance lever, and it needs the
same simulation treatment CCODE-34/38 got — I will measure before choosing.

## Also queued (Erik, same session — separate tickets)
- **CCODE-42 · Finish it is not a free choice.** *"The Finish button isn't a player choice unless you have a
  finishing potential move."* Hunter's Strike has the potential but a low chance to end it outright **unless the
  damage output would exceed the enemy's HP — then it IS a finishing move.** Cut the Thread is an **opposed roll**:
  ~50/50 vs a healthy equal-level foe; **near-certain vs a run-down opponent when you hold the momentum**; low with
  momentum against you or vs a high-level foe. So the button must (a) only appear when you own a finishing-potential
  craft, and (b) show honest, situational odds.
- **CCODE-43 · Items in combat.** Dagger vs axe, metal vs energy shield; throw a chemical, drink a potion.
  Independent of round structure. `equipmentBonus` already exists for normal play and combat simply doesn't read it.

## Build order
**CCODE-41 (this spec) → CCODE-42 (finish) → CCODE-43 (items).** 42 and 43 are both independent of 41 and can be
pulled forward if Erik wants something playable sooner.

*— captured by CCode. Erik's answers are verbatim above; the two flags are mine and want a ruling before I build.*

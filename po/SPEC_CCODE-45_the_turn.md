# SPEC CCODE-45 — The Turn: sense → action → bonus, with two GM calls

**Design: Erik. Captured + engineering decisions: CCode, 2026-07-31.**
**Supersedes `SPEC_CCODE-41_structured_rounds.md`** (same design, but Erik's turn-flow message reframes the UI and
folds the weave in, so the ⋈ arm-then-pick gesture is replaced rather than patched).

---

## Why

Two problems, one shape:
1. **A sense costs you the exchange.** Erik: *"that way sensing doesn't give the opponent a free hit."*
2. **The weave is not intuitive.** Erik: *"The weave mechanic is not intuitive… we need to update some of the
   mechanics so it's simple to understand."* The ⋈ arm-a-craft-then-pick-another is a modal gesture bolted onto a
   flat list. It stops being strange the moment braiding is just *a choice within a step*.

## The turn (Erik's words, structured)

```
TURN
├─ SENSE STEP            optional
│    choose: no skill · one skill · TWO skills to braid
│    plus: free text shaping THIS step
│    → [Proceed to Action]  ⇒ GM CALL #1
│         narrates what you sensed AND what the opponent did
│         ⇒ THE SENSE STEP IS NOW LOCKED — no editing back into it
├─ ACTION STEP           required
│    same choice shape + its own free text
├─ BONUS STEP            only if the sense step earned it
│    same choice shape + its own free text.  A FULL action — "it's the payoff."
└─ [Edit] or [Execute]
     Edit    → revise ACTION and BONUS (never SENSE — already narrated)
     Execute → resolve mechanically ⇒ GM CALL #2 narrates the whole turn
               effects tick ONCE, here. Net result sets up the next turn.
```

### Erik's rulings (verbatim intent)
| Question | Ruling |
|---|---|
| Setup/sense energy cost | **Carries the cost of the ability you use.** |
| Skip the sense step? | **Yes** — conserve energy, no sense skill, or **blinded** to your senses by an opposing craft. |
| Opponent sense step? | **Yes.** |
| Bonus action size | **A full action — "it's the payoff."** |
| GM calls per turn | **Two.** |
| Edit back into sense after its GM call? | **No — locked.** |
| Braid in a step | **Yes** — *"click the braid button for the skills you want to try to braid"*; a braid that senses **and** damages lands **both** effects. |
| Effects tick | **Per turn**, not per step. |

## Engineering decisions (mine — Erik has not ruled; all are content dials)

| Decision | Choice | Why | Dial |
|---|---|---|---|
| Does the sense exchange move momentum? | **No — purely preparatory** | Otherwise momentum moves up to 3× per turn and the CCODE-38 pressure pacing (measured over 1200 fights/level) is void. | `turn.senseMovesMomentum: false` |
| What does a good sense buy? | A **named contestMod on the action roll**, scaled from the sense margin | Consistent with every other modifier this session: if it isn't a line in the breakdown, it isn't real. | `turn.setupBonusScale`, `turn.setupBonusMax` |
| What earns the bonus step? | **crit_success on the sense step** | A full extra action is a large grant; "any success" would roughly double offence. Will be **simulated** before final tuning, as CCODE-34/38 were. | `turn.bonusOnDegrees` |
| Does the opponent get a bonus step? | **Yes, same rule** | Symmetry; otherwise the player gains free tempo. | — |
| Sense vs sense | Both sides' sense resolve as one opposed exchange | It is a contest of reads; the loser learns less. | — |

## Engine shape — additive, nothing existing changes

`battleRound` **stays the single opposed-exchange resolver.** It is well-tested and everything depends on it. Two
additive options:

- `phase: "sense" | "action" | "bonus"` (default `"action"` — existing callers unchanged)
  - `sense` → no momentum move, no pressure; lands effects; returns `setupBonus` + `bonusEarned`
- `tickEffects: boolean` (default `true` — existing callers unchanged)
  - the turn orchestrator passes `false` on sense/action and `true` on the last step, so effects tick **once per turn**

Turn state lives on the encounter as `state.turn`:
```
{ phase, senseDone, senseResult, setupBonus, bonusEarned, steps: { sense, action, bonus }, locked }
```

**app.js owns the orchestration**, because the GM calls are async and sit *between* steps. The engine stays pure.

## Build order
1. **Engine + tests** — phase-aware exchanges, setup bonus, bonus-earned, per-turn ticking. Additive and inert
   until the UI uses it, so it is safe to ship alone.
2. **Simulate** the bonus threshold + setup-bonus scale (the CCODE-34/38 treatment).
3. **UI** — the stepped panel, per-step free text, the braid-as-a-choice replacing ⋈.
4. **GM calls** — #1 sense narration, #2 full-turn narration.

## Verification discipline (from today's CCODE-44 miss)
I shipped v1.8.303/.304/.305 on unit gates alone and only later discovered a boot break in uncommitted work.
**Every step of this build gets a live boot check on a fresh origin before push**, not just `npm test`.

*— CCode. Spec'd from Erik's design + his six rulings; my five engineering calls are named as mine and are all
content dials, so none of them is a decision he can't reverse without code.*

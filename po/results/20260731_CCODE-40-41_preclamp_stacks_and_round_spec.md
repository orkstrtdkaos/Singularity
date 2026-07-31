# CCODE-40 + CCODE-41 — stacks compare before the clamp; structured rounds fully specified

**CCode · 2026-07-31 · v1.8.304 (`35be2fd0`) + v1.8.305 (`68aaff6e`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams).**

## CCODE-40 — the clamp was eating every modifier

Erik, with exact arithmetic: *"All of the bonuses and penalties need to be stacked and compared PRIOR to a clamp.
If I have +35 due to abilities and skills and the enemy has +25 but has also landed a bind on me (-15) the net
difference would be (-5) to my roll."*

He found a real bug. `rollSide` computed:

```js
margin = res.chance - res.roll     // res.chance is CLAMPED at the 95% ceiling
```

So once a capable character hit the ceiling, **every further term was silently discarded** — a bind laid on them, a
woven craft, momentum, a standing guard — and a contest between two strong sides read as *a tie of two 95s*.

**I had already seen the symptom and not followed it through.** The live popovers earlier the same day printed
`clamped (from 98)` and `clamped (from 99)`; I noted the disclosure was working and moved on, without asking what
the discarded 3-4 points were doing to the *contest*. Erik's example made it obvious.

### The fix keeps both truths
- **DEGREE** still uses the clamped chance — the ceiling exists so your own action can always fail (that 5% tail is
  the point of it).
- **The CONTEST margin** now uses the RAW pre-clamp stack, so every named term reaches the comparison.

```js
const rawChance = res.breakdown?.clampedFrom ?? res.chance;
margin = rawChance - res.roll;
```

Surfaced too: when the ceiling bites, the receipt says so — *"your stack totalled 113 before the 95% ceiling — the
contest is decided on the full stack, so every bonus and penalty counts."* Otherwise "95 vs 95" reads as a tie.

**This retroactively makes CCODE-35's effects and CCODE-37's weave bonus matter for high-level characters — the
exact players for whom they were doing nothing.** It is the most consequential of today's combat fixes.

### Tests — 7 checks around Erik's scenario
Including the **precondition** (both sides genuinely above the ceiling, so the bug could actually manifest), that a
−15 bind now moves the contest *at all*, and that its **full −15** reaches the margin undiluted.

**One of my own assertions failed first, and it was mine that was wrong, not the code:** I asserted the player would
still be clamped *with* the bind applied. They aren't — the −15 drops them back under the ceiling, which is exactly
the point: the penalty now bites. Rewritten to assert the real invariant (`margin === rawChance − roll` on both
sides).

---

## CCODE-41 — structured rounds, fully specified

Erik answered all four open questions, so this is now a real spec rather than a sketch:
`po/SPEC_CCODE-41_structured_rounds.md`.

| # | Question | Answer |
|---|---|---|
| 1 | Setup phase energy cost? | **Yes — it carries the cost of the ability you use.** |
| 2 | Can you skip setup? | **Yes** — conserve energy, no sense skill, or **blinded to your senses**. |
| 3 | Opponent setup phase? | **Yes.** |
| 4 | Bonus action = full action? | **Yes — "it's the payoff."** |

Plus: **a braid that senses AND damages is viable as a setup, with both effects landing**; effects tick **per
round**, not per sub-action; and the **GM narrates the whole round** (sense + main + bonus, both sides, tallied),
with the net result setting up the next — which **supersedes CCODE-36's whole-fight-at-the-end** for structured
rounds.

### Two rulings I want before building (flagged, not assumed)
1. **Does the setup exchange move momentum?** I propose **purely preparatory**. Otherwise momentum swings up to 3×
   per round and the CCODE-38 pressure pacing — which I only just measured — is invalidated.
2. **The bonus-action grant threshold** (crit-success only, or any success?) is the balance lever. A player who
   reliably crits their setup would get ~2× the offence. I'll simulate it the way CCODE-34/38 were measured rather
   than guess.

### Built now — phase denial (the one self-contained piece)
An effect may carry `deniesPhase`; `phaseDenied(effects, side, phase)` reads it. Content declares `conceal_deep` →
*"senses blinded"* with `deniesPhase: "setup"`, so a craft can lock an opponent out of their setup. This is the
counterplay to a setup-heavy build, and the reason skipping setup must be first-class rather than an error state.

**The load-bearing test is the third:** `deniesPhase` must be **copied from the content def onto the live effect**
in `effectFrom`, or `phaseDenied` reads `undefined` on every effect and the counterplay is **inert while still
advertised in content** — the same producer/consumer failure class as `seam_battle_effects_roundtrip`.

---

## Also queued as specs
- **CCODE-42 — Finish it is not a free choice.** *"The Finish button isn't a player choice unless you have a
  finishing potential move."* Hunter's Strike has the potential but low odds to end it outright **unless the damage
  would exceed the foe's HP — then it IS a finishing move**. Cut the Thread is an **opposed roll**: ~50/50 vs a
  healthy equal-level foe, **near-certain vs a run-down one when you hold the momentum**, low with momentum against
  you or vs a high-level foe. The button must only appear when you own such a craft, and must show honest,
  situational odds.
- **CCODE-43 — items in combat.** Dagger vs axe, metal vs energy shield; throw a chemical, drink a potion.
  Independent of round structure; `equipmentBonus` already exists for normal play and combat simply doesn't read it.
  **Buildable with no further spec — I can take this next while the two CCODE-41 rulings are pending.**

## Files
- `engine/skill_battle.js` — `rawChance` + the pre-clamp margin; `phaseDenied`; `deniesPhase` copied in `effectFrom`.
- `content/packs/core/rules/skill_battle_system.json` — `conceal_deep` / blinded, `phaseDenialNote`.
- `app.js` — the raw-stack note on the round receipt; v1.8.305.
- `style.css` — `.sb-raw-note` · `tests/skill_battle_sim.mjs` — 10 new checks · `po/SPEC_CCODE-41_structured_rounds.md`.

*— CCode. Every bonus and penalty now actually reaches the exchange, and the round redesign is specified in Erik's
own words with my two open rulings named rather than guessed. status: complete_pending_review.*

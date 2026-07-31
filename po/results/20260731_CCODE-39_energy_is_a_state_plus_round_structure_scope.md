# CCODE-39 — an empty energy pool is a state, not a verdict + the round-structure design, scoped

**CCode · 2026-07-31 · v1.8.303 (`b31ca93c`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams).**

Erik sent a substantial combat-design message. I built the one piece that was contained and unambiguous, and
scoped the rest honestly rather than half-building a redesign.

## Built: energy no longer ends a fight

*"If energy is depleted it shouldn't stop a fight cold… that is a yield option, but people can fight on with simple
strikes and defends, or use an item to restore energy."*

Energy exhaustion no longer resolves the contest for either side. Instead:

- **A spent side's crafts stop answering.** `degradeIfSpent` falls the declaration back to a plain effort in the
  same spirit — a guard stays a guard, everything else becomes a bare strike; tier 1, conserve, no weave. You fight
  on, you just fight *without your crafts*.
- **The state is surfaced, with yield named as a choice:** *"You are spent — your crafts will not answer. Steel and
  wit still will… This is the moment to Yield by choice, or use something that restores you — the fight no longer
  ends itself here."* The opponent's spent state shows too (*"swinging on will alone — press it"*).
- **Yielding while spent still works**, and is still the player's call.

The old SNG-098 test asserting *"a side that runs out of energy forfeits the contest"* was **rewritten, not
deleted** — attrition still bites (the pool empties, crafts stop) but no longer hands anyone the win.

### The risk of removing an exit — measured
1200 fights per threat level, 60-round cap: **0% unresolved everywhere**, so fights still terminate. Outcome mix is
now `opponent_yielded 76-84%` / `player_down (health) 16-24%` — health is genuinely the player's exit.

**Cost, flagged:** the peer-fight **p90 tail grew from ~20 to ~41 rounds** (median 14-16). If that annoys in play,
the one-number lever is `breakAtPressure` (2 → 1) in content.

---

## Not built: the round restructure — scoped, needs your call

The rest of the message is a **real redesign of the round**, not a fix. Building it blind while you're mid-playtest
would be reckless, so here's the honest shape of it.

### A. Structured rounds — setup phase → action phase
*"each round could allow a choice of non-striking ability, sense, ward/shield, hinder/bind etc… Then the action
choice - harm/break/strike"* — so **sensing no longer gives the opponent a free hit.**

This is the biggest change and the best one. It fixes a real unfairness: today a read costs you the exchange.

- **Engine:** a round becomes two declarations resolved together, with the setup resolving *first* and its result
  feeding the action's roll. `battleRound` currently takes one decl per side — this changes its signature and every
  caller.
- **Opponent:** needs a setup phase too, or the player gets a free extra move every round.
- **UI:** the panel becomes two-stage — pick a setup, see what it bought, then pick the action.
- **Effects:** *"the sustaining effects would not tick down a count until the full rounds actions are complete"* —
  a one-line change once the round has a defined end (`tickEffects` moves to the end of the full round).

### B. Bonus action on a successful setup
*"a successful feint on an opponent's strike could give you a bonus action… a reward for a great setup that
succeeded."*

Clean and very much in the game's spirit. Depends on (A) existing — the bonus is granted by the setup's degree
(crit-success → bonus action; success → the normal modifier). Cheap once the phase structure is there.

### C. Items in combat
*"do I use my dagger, or my axe… my metal shield or my energy shield? … throw a chemical at them or drink a potion."*

Independent of A/B, and it's where **inventory becomes functional** rather than a list.

- Weapons/shields as **equipment that modifies** a declaration (a dagger and an axe are different strike profiles).
  The equipment bonus path already exists (`equipmentBonus` feeds normal play) — combat just doesn't read it.
- Consumables as a **move type**: throw / drink is an action that spends an item. This is also the answer to "spent"
  from the energy work above — a potion is the honest way out of an empty pool.
- Needs a small content pass: combat-relevant fields on items (a strike profile, an energy restore).

### Recommendation
**A → B → C**, and **A deserves a spec from you or Aevi before I build it** — it changes the shape of every round,
and I'd rather implement your intent than my guess at it. Specifically I'd want your call on:

1. Does the **setup phase cost energy**, or is it free (with the action carrying the cost)?
2. Can you **skip the setup** and go straight to an action (a simple round), or is setup mandatory?
3. Does the **opponent** get a setup phase too? (I think yes, or the player gains a free tempo advantage every round.)
4. Is a bonus action **another full action**, or a restricted set (no finisher)?

C (items) I can build without a spec — it's additive and doesn't touch round structure. **Say the word and I'll take
items next while you decide on A.**

## Files
- `engine/skill_battle.js` — `degradeIfSpent`, the spent state, energy removed as a resolution.
- `engine/encounters.js` — spent through the seam, the degrade event lines.
- `app.js` — the spent bars (yours and theirs); v1.8.303.
- `style.css` — `.sb-spent-bar`.
- `tests/skill_battle_sim.mjs` — 6 new checks + the rewritten attrition rule.

*— CCode. Being out of energy now means your crafts go quiet and the choice is yours, not the engine's.
status: complete_pending_review.*

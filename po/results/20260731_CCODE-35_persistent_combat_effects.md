# CCODE-35 (Erik) — persistent combat effects: a landed move leaves something standing

**CCode · 2026-07-31 · v1.8.299 (`0687ec17`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams).**

Erik: *"Each action should produce something that could persist, such as raising a shield at the beginning, or
gaining a sense/insight gives you bonuses to defense or striking."*

## The rule that makes it honest

An effect is **not a hidden fudge**. It enters the next round's roll as a **named, signed contestMod on the
SNG-106 self-summing breakdown** — so `guard up +4` sits in the same math as the matchup and intensity terms,
and the player can open the roll breakdown and see exactly why the number moved. **If it isn't in the breakdown,
it isn't real.** That constraint drove the whole design.

## Engine — `engine/skill_battle.js` (pure, rng-injectable)

| function | what it owns |
|---|---|
| `effectMods()` | the contestMod lines standing effects contribute to one side's roll |
| `effectFrom()` | what a **landed** move leaves behind — a miss leaves nothing (a botched guard is not a raised shield); partial lands at half value; a crit buys an extra round |
| `tickEffects()` / `addEffect()` | expiry, same-kind **refresh** (no infinite stacking), per-side cap |

An effect **never modifies the round that created it** — it enters state, and bites from the next round on.

**Definitions are CONTENT** (`skill_battle_system.json` → `engine.persistentEffects`), 13 functions mapped to
`{kind, label, value, rounds, applies, target}`:
- `applies`: **whenAttacked** (it answers incoming harm — guard/ward/brace/conceal) · **whenAttacking** (it sharpens
  your own blow — empower) · **always** (knowledge and hindrance cut both ways — insight/bind/hamper/sway/misled)
- `target`: **self** (a boon on the actor) · **opponent** (a hindrance laid on the other side)

Code owns *when* effects land, apply and expire; content owns the numbers. Tune freely without touching code.

## The seam — where this would have silently died

`skillBattleRound` rebuilds its state object **field by field**, so `effects` had to be named in **both** the
inbound state literal *and* the outbound `s`. Miss either and the effect is dropped — and the failure mode is the
worst kind: **the panel advertises "guard up +4" while the roll never sees it.** A feature that lies.

Fixed both directions and **declared it** as `seam_battle_effects_roundtrip` (ledger now 18 seams), so the contract
is machine-checked forever rather than living in my memory of having been careful.

## Visible in three places
- **Panel** — "on you / on them" chips carrying the exact signed value + rounds left, hover for what it does and when.
- **Receipt** — names what stuck: *"…· you gain guard up +4 for 2 rounds"*.
- **Machine log** — `effectsApplied` (what modified **this** roll), `effectsLanded`, `effectsStanding`. This is the
  part that makes "why did that roll land?" answerable from a pasted log.

## Also fixed: "Read them" declared the wrong function
The 👁 read was declaring `function: "shield"` (chosen so the scout round played safe), which under the new system
would have left a **raised guard** — the opposite of Erik's ask. A read **is** a reveal, so it now declares `reveal`:
it leaves an **insight** standing, and the matchup term becomes honest (reveal beats conceal).

## Tests — 10 new sim checks
The load-bearing one: **a standing guard REACHES THE ROLL as a named contestMod.** Also: effects are content not
code; a landed shield lands on the actor; an effect doesn't modify its own round; whenAttacked does *not* fire when
the opponent isn't attacking; a missed move leaves nothing; effects expire; and the round-trip seam holds.

**The test caught a real subtlety.** An effect can push a strong character past the d100 ceiling, so
`sum(components) === total` is *false* when the clamp bites — the honest invariant is
`sum === (clampedFrom ?? total)`, and the breakdown must **disclose** the clamp rather than swallow the difference.
Both are now asserted. (My first version of the test asserted the naive form and failed — correctly.)

## Live verification (fresh port 8363, pure-engine rounds, no API)
- A **read** landed `insight +3 (2r)` — shown in the receipt *and* as an "on you" chip — and `effectsApplied` for
  that round was **empty**, proving it did not modify its own round.
- The **next strike** applied it: `effectsApplied.you = ["you have their measure (2 rounds) +3"]`, standing ticked 2r → 1r.
- A **guard** landed `+4 (2r, whenAttacked)`; chip, receipt and state all agree.
- No console errors.

## Files
- `engine/skill_battle.js` — the effect lifecycle + `rollSide` fxMods param; `battleRound` applies → ticks → adds.
- `engine/encounters.js` — the round-trip seam (effects in *and* out of `skillBattleRound`).
- `content/packs/core/rules/skill_battle_system.json` — `engine.persistentEffects` (the whole tuning surface).
- `app.js` — the standing-effect chips, the receipt's "what stuck" clause, the machine-log fields, the read→reveal fix; v1.8.299.
- `style.css` — `.sb-fx-row` / `.sb-fx` (boon/bane).
- `tests/skill_battle_sim.mjs` — 10 checks · `tests/seams.json` — the declared seam.

## Flagged
- **AEVI/ERIK — the values are content and untuned by play.** Guard +4/2r, insight +3/2r, bind −4/2r are first
  estimates. With `marginScale 0.20` a typical round's margin gap is ~6-7, so a +4 is a real but not dominant
  thumb on the scale — roughly "worth two-thirds of an average exchange." Play it and move the numbers.
- **Stacking is deliberately shallow** — same kind refreshes rather than stacks, cap 3 per side. If you want a
  guard-then-ward-then-brace turtle build to be viable, that cap is the dial.
- **The opponent gets effects too** (their policy declares shields and binds), so a foe who guards is genuinely
  harder next round. That's new pressure — watch whether defensive foes now feel too sticky.
- **Braids in combat** remains the big unbuilt one; the effect system is a natural substrate for it (a braid could
  land two effects at once).

*— CCode. A raised shield is now a raised shield: it stands for two rounds, it shows on the panel, and it is a
line in the next roll's math. status: complete_pending_review.*

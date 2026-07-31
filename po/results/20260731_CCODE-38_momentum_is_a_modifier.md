# CCODE-38 (Erik) — momentum becomes a modifier, not the exit + four playtest fixes

**CCode · 2026-07-31 · v1.8.302 (`c7ac0351`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams).**

Erik, decisive: *"The momentum mechanic is ending fights it shouldn't… i took one hit - still tons of energy and
health… so that's too clamped. momentum should be a modifier mechanic not the primary exit encounter metric."*

He was at **37/45 hp and 90/115 energy** and the fight ended. Beaten by a meter while holding every real resource.
He's right, and this was the correct call — CCODE-34 tuned *how fast* the meter filled, which was treating the
symptom. The disease was the meter being an exit at all.

## 1. Momentum no longer ends anything

It now does two things instead:

- **MODIFIER** — whoever is ahead carries a named roll bonus (`momentum (you have the advantage) +5`), the side
  behind carries the penalty, capped at ±8. Zero momentum adds no line (no zero-value noise in the breakdown).
- **PRESSURE** — filling the meter is a pressure **event**, not a death. The dominated side takes real attrition
  (the player loses health, the opponent loses energy/composure), a pressure counter ticks, and the meter **resets
  to 35%** — driven back, still in it. A crushing single blow is heavy pressure too, not an instant end.

A fight now ends only on what the player can **feel and manage**: health gone, energy gone, the opponent breaking
after `breakAtPressure` pressure events, mutual exhaustion, or a deliberate exit (Yield / Break away / Finish it).

### Re-measured on the real round path
The CCODE-34 harness rolled `battleRound` directly and never tracked player health — which is now a live exit. So
I rebuilt it around `skillBattleRound` with health tracked exactly as `app.js` does, 1500 fights/dial:

| dials (meterMax / breakAt / oppEnergyLoss) | median | p10 | p90 | outcomes |
|---|---|---|---|---|
| 16 / 3 / 14 (first cut) | 20+ | 17 | 20+ | overcome 72%, yielded 22% |
| **10 / 2 / 22 (chosen)** | **15** | **5** | 20 | **yielded 68%, overcome 32%** |
| 8 / 2 / 22 | 11 | 4 | 20 | yielded 83%, overcome 9% |
| 8 / 2 / 30 | 11 | 4 | 19 | yielded 92%, overcome 5% |

**No configuration ends a fight by a meter any more** — every outcome is health, the opponent breaking, or mutual
exhaustion. Chose **10 / 2 / 22**: vs a peer, median 15 rounds with a genuine **32% player-loss rate**; vs weak
foes 3-5 rounds. Shorter dials existed but pushed the player to 90%+ wins — **danger beat brevity**, and the sim's
player is deliberately dumb (fixed tier-2 strike, no effects, no weave, no intensity management), so real fights
run meaningfully shorter than this floor.

## 2. A craft appears under EVERY function it has

*"I can use harmonic voice to mend… that might be a rank 3 add on though… will it show up in the mend options?"*

It couldn't — `playerBattleSkills` read `functions[0]` only. **Harmonic Voice is `command + empower + heal`**, so
it was hidden from mend entirely, as was every secondary use of every multi-function craft. Now each craft is
listed under **each** of its functions and declares with *that* function, so picking it from MEND actually mends.

**Answering the rank question directly: there is no rank gate in the data.** All three of Harmonic Voice's
functions are available to you now. Live: `Sonic Resonance` → bind/break/move/strike, `Stillness Field` →
bind/conceal/resist/ward. The move list went 8 → 15 entries, which is why the categories now collapse.

## 3. The opponent is not a metronome

*"they seem to always just strike btw… might want to make the opponent more complex."* Exactly right:
`opponentPolicy` took `skills[0]` unless a tendency was known, and `skills[0]` is a strike for nearly every
synthesized sheet. Options are now **scored** — matchup edge, a situational lean (behind → press, ahead →
consolidate), and an **anti-repetition** penalty — with a round-varying tiebreak. Still **fully deterministic**
(no rng), so duels stay reproducible and PvP stays symmetric. Live: `strike, guard, strike, guard, guard, strike…`

## 4. Collapsible categories + Loki's backfill
Move families are `<details>`, open by default, with counts; the fold state **persists across round re-renders**
so a fight doesn't keep re-expanding what you just folded away.

**Loki (authorised).** His ledger was direct evidence of the CCODE-37 gap: `hunters_strike`, `the_false_target`
and `umbracraft` all sat at **zero uses** — and the first two are the crafts his own pasted combat logs show him
fighting with. Credited those two with **8 uses** each (the practice bar for rank 2 — exactly the progress those
fights earned and the ledger dropped). **`umbracraft` deliberately NOT credited**: no evidence of use, and
inventing progress is worse than under-crediting.

## Live verification (fresh port 8366)
- Momentum swung `3.2 → 3.5 → −0.5 → −3.5 → 6.1 → −0.9 → 2.7 → −9.5 → 5.1 …` against a cap of **10** and **the
  fight continued every time**.
- Pressure ticked and cost real resources: player pressure 1 → 2 with hp `30 → 27 → 24`.
- The fight ran **13 rounds and ended on ENERGY** — not a meter.
- Opponent moves varied; families collapsed and stayed collapsed; multi-function crafts listed correctly.
- No console errors.

## Tests — 9 new sim checks
Including Erik's exact scenario (*a full meter pressures instead of ending*), the momentum modifier appearing as a
named line (and **not** appearing at zero), pressure costing real health through `skillBattleRound`, pressure
surviving the round-trip seam, opponent variety, and the policy staying deterministic. The old test that encoded
"meter fills → fight ends" was **rewritten**, not deleted — it now asserts the new rule.

## Files
- `engine/skill_battle.js` — `momentumModifier`, the pressure block, the scored opponent policy.
- `engine/encounters.js` — pressure through the seam, the pressure health loss + event text, `lastOppFn`.
- `content/packs/core/rules/skill_battle_system.json` — `asModifier`, `pressure`, retuned `meterMax`.
- `app.js` — multi-function skill listing, collapsible families (`sbOpenFams`); v1.8.302.
- `characters/player-s9z9u1/char-mrum8y4d.json` — Loki's backfill (4-line diff).
- `tests/skill_battle_sim.mjs` — 9 checks.

## Flagged
- **The p90 tail is still ~20 rounds vs a peer.** Median 15 is fine; the tail isn't. If long fights annoy you in
  play, the cheapest lever is `breakAtPressure` (2 → 1 halves the domination needed) — one number in content.
- **"The engine's text could use some tweaking"** — I did not act on this; it was the one item I couldn't pin to a
  specific line. Tell me which phrasing grated (the receipt? the interaction clause? the pressure lines?) and I'll
  rewrite it.
- **`umbracraft` left at zero** — say the word if you did fight with it and I'll credit it too.

*— CCode. A meter can no longer beat you while you're standing. It presses you, it costs you, and then you decide
what to spend to get out. status: complete_pending_review.*

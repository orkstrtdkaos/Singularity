# CCODE-36 + CCODE-37 — the rolls behind each round, the whole fight narrated, and braids in combat

**CCode · 2026-07-31 · v1.8.300 (`30c1f337`) + v1.8.301 (`8071994b`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams).**

Three asks from Erik's playtest of the persistent-effects build, all shipped.

---

## CCODE-36 §1 — "let the player see the rolls and modifiers"

*"…this could be similar to the normal play rolls, but be a popup off of the action you chose."*

Each round's receipt now carries its two rolls, opening the **same breakdown popover normal play uses**. Your own
math is always yours; **their** math stays behind the existing fog gate — unrevealed it reads *"their math is
fogged — 👁 read them to see it"*, which teaches the fog instead of hiding a number.

Verified live, clicking `⚄ your roll 52/95 · success`:

```
physical 6                          +80   ← your base
physical mastery (beyond 4)         +10
ability rank 1                       +5
you have their measure (2 rounds)    +3
clamped (from 98)
────────────
total                                95%
```

That screenshot also **proves CCODE-35's contract in the live UI**: a persistent effect is a named line in the
roll, and the clamp is disclosed rather than swallowed — exactly the case the CCODE-35 test predicted.

## CCODE-36 §2 — "it didn't narrate the whole fight, just the last move"

*"if we're going to make the engine very fast and lite - like it is now, then we need to have the entire narration
at the end."* Agreed, and it's the right trade: the rounds resolve silently as numbers, so the one narration owes
the player the **whole fight**.

`sbDeclare` now accumulates a plain-language round-by-round record on the encounter state (`sbFightBeat` — who did
what, how well, who gained ground, what stuck; capped at 24). `sbEnd` hands the GM the **full transcript** with an
explicit instruction: narrate every round in order as one continuous scene, *"the player watched this resolve as
bare numbers; the prose is where they finally SEE it. Do not summarize it as 'you fought and won' and do not
narrate only the last exchange."* A 1-round fight keeps the old single-beat prompt (no transcript to tell).

**Honest limit:** the end-of-fight *prose* needs an API key, so what's verified here is the transcript (its input),
which accumulates correctly round by round. Erik's next real fight exercises the narration itself.

---

## CCODE-37 — braids in combat

### The gap underneath the ask
**A skill-battle round never recorded practice.** `recordUse` — the single counting site — was called only from
the classic-choice path and the gambit runner. `sbDeclare` called it nowhere. So **every craft used in a fight
counted for nothing**: no rank progress, no co-activations, no braid progress. Combat, where you lean on your
crafts hardest, was invisible to the ledger. *That* is the real reason braids never showed up there.

Fixed: `sbDeclare` records use for the craft(s) actually used (`_strike`/`_guard` are steel-and-wit fallbacks, not
abilities, and are excluded).

### The weave — two crafts in one turn
Turn-by-turn forces one move per turn, so the reward for having practised two crafts together is **beating that
limit**. **⋈** on any real craft arms it; the next craft you pick is woven in:

- the second craft is its **own named line in the roll** (`woven: Prism Sight +4`), scaling with its tier
- **both crafts' persistent effects land** — one turn, two things standing. *That's the payoff.*
- it costs energy for **both** (1.8×) — weaving is a real price, not a free upgrade
- it records a **co-activation**, so weaving a pairing enough times ripens it into a real minted braid — at which
  point it's **one craft at one craft's price**

That's the whole arc: **weave by hand and pay double, until the braid makes it one move.** Dials are content
(`engine.weave`: `bonusPerTier`, `maxBonus`, `energyMultiplier`).

### Live verification (fresh port 8365, pure-engine, no API)
Armed `Sonic Resonance` ⋈ picked `Prism Sight`:

| check | result |
|---|---|
| co-activation recorded | `prism_sight+sonic_resonance: 1` |
| practice recorded | both crafts' `uses` incremented (the gap, fixed) |
| energy | 100 → 91 = **9e** (vs 5e normal) |
| **both effects landed** | `opponent: bound −4 (2r)` **and** `player: you have their measure +3 (2r)` |
| receipt | *"You bind with Sonic Resonance ⋈ woven with Prism Sight…"* |
| roll popover | `woven: Prism Sight +4` |

6 weave buttons rendered — only on the real crafts, correctly excluding the 2 fallbacks. No console errors.

### Tests — 6 new sim checks
The payoff (one woven turn lands both effects), the price, that an **unwoven round is byte-unchanged** (the weave
is additive, never a tax on normal play), and the **full arc** — weaving `BRAID_RIPEN_AT` times makes the pairing
mintable via `mintableBraidsFor`.

---

## Files
- `app.js` — `sbLastRoundRolls` + the receipt's roll links; `sbFightBeat` + the transcript; `sbEnd`'s whole-fight
  prompt; `sbWeaveArmed` + the ⋈ button, weave bar and two-craft declaration; the `recordUse` fix; v1.8.301.
- `engine/skill_battle.js` — `wovenBonus`, the woven roll line, the woven effect, weave energy cost.
- `content/packs/core/rules/skill_battle_system.json` — `engine.weave`.
- `style.css` — `.sb-rolls`, `.sb-weave-*`, `.sb-skill-row.weaving`.
- `tests/skill_battle_sim.mjs` — 6 weave checks.

## Flagged
- **AEVI/ERIK — weave dials untuned by play.** `bonusPerTier 2` (cap 8) and `energyMultiplier 1.8` are estimates.
  The energy price is the important one: too cheap and weaving is always correct; too dear and it's never worth it.
- **Backfill question for Aevi:** existing characters have fought many rounds that recorded no practice. Their
  ledgers under-count reality. `engine/backfill.js` already has a co-activation estimator — worth a pass to credit
  combat history, or worth deliberately leaving as "it starts counting now"? Erik's call.
- **A braid still mints through the existing flow** (`mintableBraidsFor` → the mint path); I did not add an
  in-combat mint moment. Ripening mid-fight surfaces afterward, which seems right — minting a new craft mid-swing
  would break the turn.
- **The one-round fight** still skips the whole-fight narration by design (nothing to tell). If Erik wants even a
  single exchange told richly, that's a one-line change to drop the `transcript.length > 1` gate.

*— CCode. Combat now counts toward who you're becoming, and a practised pair can be spent in one turn — twice the
cost, twice the effect, and one step closer to the braid that makes it free. status: complete_pending_review.*

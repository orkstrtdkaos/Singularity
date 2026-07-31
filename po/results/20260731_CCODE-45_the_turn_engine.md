# CCODE-45 — The Turn: spec'd in full, engine layer built

**CCode · 2026-07-31 · v1.8.306 (`dce2c7ed`) · npm test exit 0 (all gates, rawProseCaps 63, 18 seams) · boot verified live.**

## The spec
Erik ruled on the last two open questions — **two GM calls per turn**, and **the sense step locks once narrated**
(no editing back into it) — so the design is complete. `po/SPEC_CCODE-45_the_turn.md` **supersedes**
`SPEC_CCODE-41`: his turn-flow message reframes the UI and folds braiding in, so the ⋈ arm-then-pick gesture gets
**replaced rather than patched**. That matters — *"The weave mechanic is not intuitive"* is not a polish note, it's
a sign the gesture was wrong. Braiding stops being strange the moment it's just *a choice within a step*.

```
TURN
├─ SENSE   optional · costs the ability used · skip to conserve energy, if you have no
│          sense craft, or if a craft has BLINDED you  →  GM CALL #1  →  LOCKED
├─ ACTION  required
├─ BONUS   only if the sense earned it — a FULL action, "it's the payoff"
└─ Edit (action/bonus only) or Execute → GM CALL #2 narrates the whole turn
   effects tick ONCE, here
```

## Built: the engine layer — additive and inert
Nothing in the live game changes on this commit. `battleRound` stays the single opposed-exchange resolver and
gains three options, **all defaulting to today's behaviour**:

| option | default | what the turn orchestrator does with it |
|---|---|---|
| `phase` | `"action"` | `"sense"` → no momentum, no pressure, no round advance |
| `tickEffects` | `true` | `false` on every step but the last → effects tick once per **turn** |
| `setupBonus` | `0` | what the sense bought, applied to the action roll |

**A sense step no longer costs you the exchange** — that's the whole point of the redesign. And what the sense
buys reaches the action as a **named line** (`you read them first` / `they read you first`, signed against the
opponent), because the rule I've held all session is: if it isn't in the breakdown, it isn't real.

11 new sim checks, including an explicit **backward-compatibility** assertion that the new options leave existing
callers byte-identical.

## My five engineering calls — named, and all content dials
Erik hasn't ruled on these, so I made them and wrote them down as mine. Every one is a number in content, so none
is a decision he can't reverse without touching code:

1. **`senseMovesMomentum: false`** — otherwise momentum swings up to 3× per turn and the CCODE-38 pressure pacing
   (measured over 1200 fights per threat level) is invalidated.
2. **`setupBonusScale` / `setupBonusMax`** — the sense margin → action bonus curve.
3. **`bonusOnDegrees: ["crit_success"]`** — a full extra action is a large grant; "any success" would roughly
   double offence. **To be simulated before final tuning**, the way CCODE-34 and -38 were.
4. **The opponent gets the same bonus rule** — symmetry, or the player gains free tempo every turn.
5. Both sides' sense resolve as **one opposed exchange** — it's a contest of reads; the loser learns less.

## Next
Simulate the bonus threshold → the stepped UI (per-step free text, braid as a choice) → the two GM calls.

---

## Process note — I got this wrong today, and it cost real time

I shipped **v1.8.303, .304 and .305 on `npm test` alone**, with no live boot check. Then a boot failure appeared
and I misdiagnosed it **three times**:

1. Blamed the stale module cache — then "disproved" it by using a fresh port, which *should* have been clean.
2. Blamed `conceal_deep`, an invalid verb I'd invented in CCODE-41, and "fixed" it on that theory. It still failed —
   and the committed CCODE-41 boots *with* `conceal_deep` present, so the theory was wrong.
3. Blamed my own uncommitted CCODE-44 work and **reverted it. That code was working.**

**The actual cause:** the preview browser's ES-module cache is **cross-port**. My own standing note says "verify on
a fresh port" — that is *not sufficient*; only a **never-used** port is. Proof: identical code failed on 8366,
8367, 8368 and 8369, and booted on 8411 and in a git worktree. The boot card saying *"failed to download"* is
misleading — it's a JS throw, and `import('/app.js?probe=1')` names the real missing export in one call.

Two corrections I'm holding to:
- **A live boot check on a never-used port before every push**, not just green gates.
- **CCODE-44 (the pre-fight appraisal — relative craft, relative prowess, disposition, threat band) is worth
  rebuilding.** It was never broken. It's the read that makes "back away" a decision instead of a coin flip, and
  rule 18 offers a lethal fight rather than imposing it — a decline you can't inform isn't a real choice.

## Files
- `po/SPEC_CCODE-45_the_turn.md` (new, supersedes SPEC_CCODE-41)
- `engine/skill_battle.js` — `phase` / `tickEffects` / `setupBonus`; sense-step exemptions; `setupBonus` + `bonusEarned`
- `content/packs/core/rules/skill_battle_system.json` — `engine.turn` dials
- `tests/skill_battle_sim.mjs` — 11 checks · `app.js` / `index.html` — v1.8.306

*— CCode. The turn is specified in Erik's words with my calls flagged as mine, and the engine underneath it is
built, tested, and inert until the UI arrives. status: complete_pending_review.*

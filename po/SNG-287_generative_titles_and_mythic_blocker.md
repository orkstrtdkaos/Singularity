# SNG-287 — GENERATIVE TITLES, and a blocker the sweep exposed
## Aevi (PO) · 2026-08-04 · Erik: "consider generative titles like in tether. also use current saves to test"

# PART 1 — ⚠️ THE SWEEP EXPOSED AN UNSATISFIABLE CONDITION, NOT A TUNING PROBLEM
`tests/deed_ladder_sweep.mjs` (CCode, built to my spec) reports:
- **40-hour test: 5.7 rises, 0.3 falls — PASSES** my ≥3-rises target at every candidate.
- **180-hour test: `mythic in 0/6 worlds` — at EVERY candidate ladder**, including 60-deep and 190-deep gates.
**That the answer is identical across every candidate is the tell: the deed gate was never the binding
constraint.** The rung is `legendary: { years: 0.60, deeds: 170, unbeaten: true }`, and losses **do** reset on
promotion — so a fresh legendary starts clean and still never makes it.
### THE ARITHMETIC
170 deeds ≈ **45–55 scoring events**, most of them contests. CCode measured a favourite winning **325 of 400 —
81%**.
| win rate | P(zero losses across 40 contests) |
|---|---|
| 70% | 0.00006% |
| 81% (measured) | **0.02%** |
| 90% | 1.5% |
**`unbeaten: true` at a 170-deed gate is not a high bar. It is an unsatisfiable one.** A legend must fight
~forty times to accrue the deeds, and the same fights are what make a perfect record impossible.
### OPTIONS — and note A is arguably a bug fix, not a design change
- **A. Drop `unbeaten`, keep 170.** Mythic = a very long **career**, not a perfect one.
- **B. `maxLosses: 2`.** ⚠️ **My recommendation.** `unbeaten` is doing real narrative work — *"the ones who were
  never brought down"* — and a cap of two keeps that meaning while making it **a bar rather than a wall.**
- **C. Keep `unbeaten`, lower the gate to ~60.** A short brilliant run. **I'd argue against it:** it makes
  mythic reachable *early and by luck*, which is the opposite of what the rung should mean.
**Erik's call. But something must change, or `mythic` is decorative — and half the point of the tier work was
that a rung empty at world-start gets occupied by someone the world made.**

# PART 2 — GENERATIVE TITLES (the Tether pattern)
The fixed list in `titles.json` is the wrong shape on its own. **Tether's move is that the name comes from the
material, not from a menu** — and the deed record already carries everything needed.
## THE TEMPLATE MODEL
A title is `pattern + slots`, and **every slot is filled from a real record — never invented:**
| slot | filled from | example |
|---|---|---|
| `{ARC}` | `ws.arcContests` — the arc they moved | *the Bleed* |
| `{PLACE}` | `deed.communityId` where the pattern concentrated | *Thornwake* |
| `{ROAD}` | the route guarded most | *the Medicine Road* |
| `{CRAFT}` | the craft most used in the qualifying deeds | *the Grey Hand* |
| `{FOE}` | the highest-band figure they beat | *the Ashen Wyrm* |
| `{COUNT}` | how many | *Nine* |
| `{PEOPLE}` | the tradition whose members named them | *the Ashwardens* |
**PATTERNS:**
- `Who Turned {ARC}` → *Who Turned the Bleed*
- `{PLACE}'s {ROLE}` → *Thornwake's Mercy* · *Thornwake's Knife* — **same pattern, and which noun lands is
  decided by the deed weights, not by approval** (per `DIRECTIVE_SNG-280`)
- `Warden of {ROAD}` → *Warden of the Medicine Road*
- `Who Came Back for {COUNT}` → *Who Came Back for Three*
- `{FOE}'s End` → *the Ashen Wyrm's End*
- `The {CRAFT}` → *the Grey Hand* — **a person named for the craft they are known by**
- `Whom {PEOPLE} Named` → *Whom the Ashwardens Named* — ⚠️ **the domain-scope pattern, and the best one: it
  says nothing about what you did and everything about who is talking.**
## THE TWO-LAYER ANSWER
**Fixed titles stay for the ARCHETYPES** — Grave-Caller, Silencer, the Maw, the Reacher. Those are the world's
*existing* words and a player earning one is joining something.
**Generative titles cover everything else** — and they're the majority, because most of what a player does is
**specific**: this road, this arc, this town, this foe.
**⚠️ THE RULE THAT KEEPS THEM HONEST: a generative title may only use slots the deed record can fill.** If no
arc was moved there is no `{ARC}` title. That is what makes them true rather than flattering — **the same
discipline as BOUNDARY-1: prose alone is not a consequence.**

# PART 3 — ON TESTING WITH CURRENT SAVES
**I can't reach them: saves live in browser `localStorage`, not the repo** — `state.js` uses `LS.playerKey`,
and there are no exported fixtures or character JSON anywhere in the tree.
**Two ways forward, and the second is better:**
1. Erik exports a save (or pastes one) and I test the title thresholds against a real deed history.
2. **⚠️ BETTER: `deed_ladder_sweep.mjs` already IS the harness.** It runs the real `advanceGeneratedOffscreen`
   against real content. **A title sweep is the same shape** — run the sim, then ask *which titles would have
   fired, at what scope, for whom.* That tests the thresholds against **hundreds** of synthetic careers instead
   of one real one, and it needs no save at all.
**A real save is still worth having for one thing the sim can't check: whether a long-played character has
enough recorded deed HISTORY for any title to fire at all.** If deeds were only recorded recently, every
existing character starts title-less regardless of what they've done — and that's worth knowing before this
ships.

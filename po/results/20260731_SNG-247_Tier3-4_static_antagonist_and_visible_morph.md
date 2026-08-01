# SNG-247 Tier 3+4 — the static antagonist, and the morph made visible

**CCode · 2026-07-31 · v1.8.320 (`56c60898`) + v1.8.321 (`ebead0ae`) · npm test exit 0 (20 seams) · verified live through the real modules on a never-used port.**

## Tier 3 — the static antagonist

A sealed door has no turn. Giving it a sheet that **chooses** would mean inventing an agent — the same error class
as inventing a fight target in SNG-246 A. But `rollSide` produces a **margin**, and a fixed margin is exactly what a
DC is. So an unopposed thing is a side that **never chooses** (`opponentPolicy` returns early) and **never rolls**
(`rollSide` returns its standing resistance).

It stays honest under SNG-106 because its resistance enters as a **named contestMod** on the same self-summing
breakdown as every other term — a bind laid on the door still weakens it, visibly, and the player can see that it
did.

Returning early from `opponentPolicy` is the point, not a shortcut. Running the scoring loop on a door would give it
tactics it does not have, and the anti-metronome term would make it *vary* its response to being read — which is a
lie about what a sealed thing is.

**A puzzle given a static sheet runs the contest engine** — turn structure, priced moves, persistent effects, items.
Its hint state rides *along* rather than being replaced: `puzzleHints`/`puzzleUnlocks` are pure over the def, so
understanding still accumulates and still renders. And per Erik's per-kind weighting — *"a puzzle's sense step is
the whole game"* — **winning the read buys a layer.** That is what makes a puzzle play differently from a fight on
the same engine rather than being a reskin of it.

A puzzle with **no** sheet stays on its classic attempt path, so the two authored precursor puzzles are never
stranded by this.

Also centralised `contestSheetFor(def)` — the `isSB` derivation had been hand-copied at four call sites, and a fifth
divergence is how a kind ends up half-promoted (engine here, classic path there).

## Tier 4 — the morph made visible

Frames have chained since SNG-230 — flee a fight and you *are* dropped into a chase — **but nothing ever said so.**
The border silently changed colour and the player was left to infer that the rules had changed under them.

Both chain points now stamp `_morphedFrom`, and the frame renders the transition in **both kinds' own icons and
words**, over a gradient running from the hue it was to the hue it became: struck-through *⚔ The Contest* → *🏃 The
Chase*, with the reason ("you broke from the raider — now it is ground, not blades").

## The follow-on: Aevi's library landed mid-build

She pushed the non-combat encounter library while I was working — standoff and puzzle went from 2 seed exemplars to
8. I checked her shapes against the routing I had just written.

**Standoffs: fine.** Only **one** of her four carries `routing: "opposed"`; the other three are
`routing: "challenge"` with `kind: "standoff"`. The Tier-2a rule reads either signal, so all four mint correctly.

**Puzzles: not fine.** All four carry `kind: "puzzle"` with `routing: "challenge"`, which fell through to
`synthesizeChallengeDef` and rendered as **hard ground** — exactly the toll-keeper gap I had just closed, one kind
over, with four real encounters behind it. A sealed precursor mechanism shown as terrain.

`synthesizePuzzleDef` now mints a real puzzle, and its engage choice is **mental/insight** rather than
physical/agility — you do not work a sealed thing by being fast. **Her stage beats become the hint ladder**: a beat
is exactly *what you would understand at this layer*, so the authored understanding survives without her writing
`hintTiers` twice.

The three new checks read her **staged file directly** rather than a copy of it, so they track the content as she
extends it.

> **Handoff note:** her library lives in `po/staged_content/encounter_frame_kinds.json` (8 exemplars) while
> `content/packs/core/rules/encounter_frame_kinds.json` still has 2. **The promotion step is not mine and has not
> run** — until it does, the six new encounters are authored but not loadable.

## Verification

15 new checks across Tiers 3, 4 and the follow-on. The load-bearing ones:

> *a static antagonist never CHOOSES — same declaration every round, whatever it is shown*
> *the door's resistance is a NAMED line on the self-summing breakdown, not a hidden number*
> *a bind laid on the door still WEAKENS it — the static side is not immune to the contest, only unmoving*
> *a puzzle with NO sheet stays on its classic attempt path — an authored puzzle is never stranded*

`npm test` exit 0. Live on **never-used port 8462** through the real modules: the door never chooses and never
rolls, its resist is a named **+20** on the breakdown, a winning sense buys a layer (*"A layer gives — you
understand it better than you did"*), and both morph directions render with the right hues. No console errors.

## SNG-247 is complete

All four tiers shipped. **Five kinds, five colours, five exit rules**, and three of them (chase, standoff, puzzle)
now play as themselves on the one contest engine. **Hazard stays the fast one** per Erik's ruling — a three-stage
cliff turned into three five-step turns is worse pacing, not better.

What remains is **`AEVI-247-AUTHOR`** (the per-kind voice and the four judgment calls; every default I shipped is
deliberately plain so it reads as a placeholder) and the **staged→live promotion** of her encounter library.

## Files

`engine/skill_battle.js` (`synthesizeStaticSheet`, static `rollSide`/`opponentPolicy` paths, `staticDegree`) ·
`engine/encounters.js` (puzzle on the engine, the sense-buys-a-layer rule, the missing-`opponent` normalization) ·
`engine/encounterFrame.js` (duel+flavor puzzle) · `engine/random_encounters.js` (`synthesizePuzzleDef` + routing +
mental engage) · `app.js` (`contestSheetFor`, the morph stamps and render) · `style.css` (the morph line + free-
standing hue vars) · `content/packs/core/rules/skill_battle_system.json` (`kinds.puzzle`, `staticAntagonist`) ·
`tests/skill_battle_sim.mjs` (+15) · `tests/smoke.mjs` (the §6a guard now asserts the morph stamp too) ·
`po/COMBAT_DIALS.md` · `index.html` (v1.8.321).

*— CCode. Every kind now plays as itself. status: complete_pending_review.*

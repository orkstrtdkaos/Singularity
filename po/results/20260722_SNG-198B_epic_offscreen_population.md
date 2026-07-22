# SNG-198B — the world turns for everyone the player knows, and for the great figures he's heard of

**CCode · 2026-07-22 · v1.8.190 (`89019423`) · suite green.** The population half of SNG-198, built on 198A's state machine. This completes SNG-198 (only the heard-of tier is deferred, and its marker now exists for free).

---

## ROUND 2, answered by the build

- **Q1 (extend, not merge) — held.** Path A (delegated work) keeps its distinct contract; 198B added a POPULATION RESOLVER in front of the generated-lives path, not a merge of the two.
- **Q3 (heard-of marker) — it now exists for free.** SNG-199 made *meeting* someone write the registry. So a **codex person-node with no registry entry** is exactly "heard of, not met." I deferred the heard-of tier itself (to keep this bounded), but the marker Aevi worried didn't exist is now a one-line filter away, courtesy of the 199 work.
- **Q4 (epic pacing) — cooldown + rare roll, stateful.** Epic figures stir only when the cooldown (`minEpicGapDays`) is clear AND a rare roll passes; when one moves, `worldState.lastEpicOffscreenDay` is stamped. Rarity is real state, not just a per-tick coin flip — "when big things happen," per Erik.

## What shipped

`offscreenPopulation()` unifies the three sources §1 kept apart into one `{id, name, kind, descriptor, source}` the 198A state machine advances:

- **Met NPCs (§3.1)** — any registry person with a want the world can carry (their authored catalog `wants`, else role/standing). Authored-vs-generated no longer decides whether a life continues; dead/departed are out. A met NPC with **no `_gen` record** advances countable state (`worldState.wantProgress`) and its "while away" development lands on the codex node SNG-199 gave it — the two tickets compose exactly.
- **Epic / legendary (§3.3, the gap Erik named)** — `worldtick.js` had **never read `legend.tier`** (a POWER axis, distinct from `_gen.tier` engagement; conflating them silently drops every epic the player hasn't befriended, which is all of them). The great figures now stir offscreen, rarely, gated as above. Only legendary/epic tiers move (a riffraff cutpurse is not a world-mover). The evolve prompt marks a great figure as "a rare, weighty stirring, not a small errand" so its development reads at the right scale.
- **Generated + arcs** — unchanged, still ride the same path.

## Verified

8 new tests (met NPC in scope + dead/departed out; epic on a rare roll + riffraff excluded + cooldown holds; a met NPC advancing state and landing on its codex; a legend stamping the cooldown). The refactor is **non-regressing** — every existing Phase-2 (`2a:`) and 198A test still passes. Full suite green; boots clean on a fresh port at v1.8.190; 0 mojibake.

## SNG-198 is complete

198A gave the offscreen world an *underneath* (a thread ripens measurably and resolves); 198B gave that machine **everyone the player knows and the great figures he's heard of**. The one deferred piece — the heard-of tier — is now a small follow-on (its marker is free), not a build.

*— CCode. The epic figures of the valley have lives again, and they move when it matters, not every day. Only-Aevi-closes; Erik's leg: play across a real-time gap and watch the away-digest carry a great figure's stirring, rarely.*

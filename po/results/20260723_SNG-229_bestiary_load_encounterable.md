# SNG-229 §2a+§2b — the bestiary is LOADED and ENCOUNTERABLE (the fight pool has monsters)

**CCode · 2026-07-23 · v1.8.241 (`69292c1b`) · suite + wiring-audit green · live-verified on a fresh port.**
`status: complete_pending_review` (§2a/§2b — CCode's parts) · §2c-e (the fear/want/quest weave) is Aevi's,
now UNBLOCKED

Your question: *"Did the monsters get incorporated — not just authored, but woven into the lore, what people
fear, want, quests?"* Verified state: the bestiary was authored but **staged and inert** — 0 loaders, 0
encounter refs, 0 mentions in the living world. My half (CCode) is the prerequisite: load it, make it
fightable.

## §2a — LOADED (the prerequisite)
Moved `bestiary.json` out of `po/staged_content/` into the valley pack, whitelisted it on the manifest
(`provides.bestiary`), and added a loader → **`CONTENT.bestiary`** (6 creatures, riffraff→epic, each with its
`look`, `danger`, and the function-family `pressures` that answer it). Now a creature can be referenced by id
— the fear/want/quest weave (§2c-e) resolves against these.
*Live: `[loadContent] … bestiary=6`.*

## §2b — ENCOUNTERABLE (the fight pool finally has a monster source)
`random_encounters.js` **`bestiaryEncounters(bestiary)`** turns each creature into a **danger-gated DUEL
encounter entry**:
- **tier → danger + threat:** riffraff danger-1 (common nuisance) … epic danger-4 (rare, deadly). The danger
  gate (SNG-225) does the placement — a riffraff turns up in ordinary places, an epic only where danger is
  high.
- **region-free** (SNG-225 §4c) so a creature appears anywhere its danger admits;
- offered as a **DUEL with a decline/flee path** (SNG-002b — a hazard is a *choice* to fight, not a trap);
- the creature's **look + danger + pressures** ride on the entry, so the GM narrates it and the player knows
  which crafts answer it.

`loadContent` merges these into the encounter pool — so the fight/dangerous rolls (SNG-225, which had **no
source of monsters**) finally have one. This closes the loop with the encounter-eligibility fix: the pool is
un-starved *and* now stocked with the bestiary.
*Live: `beastEncounters=6`; a synthesized riffraff is eligible at an ordinary danger-2 place.*

**Design law held:** these stay HAZARDS, not villains — no grievance, a clean decline path, a clean kill (the
bestiary's own rule).

## ROUND 2 — answered
- **Q1 (generative vs hand-authored encounters):** generative synthesis — one function turns the whole roster
  into pool entries; less content, and it directly feeds SNG-225's now-monster-less fight pool. A few
  hand-authored *signature* fights (the wrong stag, the unmoored choir) can still be layered by Aevi as
  content if wanted.
- **Q2 (own `provides.bestiary` type vs fold into encounters):** own type — a creature is reusable across many
  encounters *and* the fear/want/quest weave, so it shouldn't be a one-off encounter entry.
- **Q3 (the epic as an SNG-208 world-arc, not one fight):** flagged as the richer follow-on. Right now the
  unmoored choir is a rare danger-4 encounter; making a *growing* epic monster a world-arc (offscreen
  pressure, a domain-scale threat) is a design/build step on top — noted, not built.

## Aevi's remaining lane (§2c-e — now unblocked)
The bestiary loads, so the staged `bestiary_weave.json` ids resolve. Fold it into the loaded paths:
- **§2c FEARED** — the craft-specific fears into `tradition_motivations.json` (a Veilwright can't fix a
  glimmerling in the eye; a Wright dreads a hollow-pace) + location `encounterFlavor`.
- **§2d WANTED** — the wants/motivations (the wrong stag's lattice-antler; a settlement wanting the warpling
  cleared) onto traditions/NPCs.
- **§2e QUESTED** — the hunt quests into `quests.json`, bound to the giver whose craft fears/wants the
  creature. The fear → want → quest → kill chain.

## Honest bound
Tier-1 (Node suite: loaded + whitelisted, the loader/merge wiring, every creature → a danger-gated duel entry
with the right tier gate, region-free + avoidable, the seed carries look+pressures, a synthesized riffraff
eligible at a danger-2 place, empty-bestiary tolerance) + a **live fresh-port boot** showing `bestiary=6
beastEncounters=6`, all other counts intact, no errors. The *felt* experience — actually meeting a glimmerling
on the road — is your Tier-2 confirm once the encounter fires in play.

*— CCode. The monsters were on paper and nowhere else. Now they load, and every one is a danger-gated fight
the world can hand you — the fight pool that had nothing to spawn now has a bestiary behind it. The half that
makes them *feared and hunted* is Aevi's, and the ids finally resolve for her to weave it.*

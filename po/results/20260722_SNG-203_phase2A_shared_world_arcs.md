# SNG-203 Phase 2A — the world arcs move, and everyone sees it

**CCode · 2026-07-22 · v1.8.197 (`af39a1d9`) · full suite green · live-verified on a fresh port.** Erik's load-bearing requirement — *"I want everyone to know that world arcs are progressing — it IS a shared world"* — is now real code: a tier-1 quest advances a greater arc on the shared clock, and a player-facing "The World Stands…" surface shows where every arc stands.

Thank you for the unblock note. My Phase 1 doc named §7-item-2 (numbered greater-arc stages) as the blocker; your ALERT correctly flagged that as a **stale read of the spec text**, not of origin — the ladders (`b0e0f417`) and pressure (`17c9c150`) had already landed. Verified at HEAD before building.

---

## The verification catch (my habit, and it mattered)

Your ALERT said the arcs carry `currentStage` + `publicFace` + `pressureOnAdvance`. I enumerated the real data before wiring anything, and: **`currentStage` is at the arc level, but `publicFace` and `pressureOnAdvance` are at the STAGE level** (`arc.stages[n].publicFace`), not the arc level — `arc.publicFace` is `undefined`. So the surface reads `arc.stages[currentStage-1].publicFace`, and `pressureOnAdvance` (the GM-EYES wake seed) is per-stage too. Wiring against the ALERT's arc-level prose would have surfaced empty faces and, worse, risked leaking the per-stage pressure. The habit of reading the corpus over the description paid for itself again.

## What shipped (Phase 2A)

**The `arc_stage` effect (`engine/quests.js`).** A new case in `applyQuestEffects`. An **advance** (`from < to`) writes `worldState.arcStages[arcId]` forward-only and **broadcasts a propagating `world_event`** (`kind: "arc_stage"`) carrying only the authored public `note` — the arc's hidden direction never rides along. A **hold** (`from == to`, e.g. "holding the middle keeps the arc from advancing") records engagement but neither advances nor broadcasts. Forward-only is strict: an arc already at a higher stage is never pulled back by a lower effect.

**The shared clock (`engine/worldtick.js`).** `worldState.arcStages` rides the *exact* `eventStages` machinery your ROUND 2 answer accepted — `syncSharedWorld` merges remote `arcStages` forward-only (one valley's arcs for everyone; a merge that moves an arc emits news: "Across the valley, X has moved to…") and pushes them back in `world/regions/valley.json`. One player moving an arc is a world event every other player's next load sees. No parallel track; the water-crisis event is untouched (its own `eventStages` entry, unchanged).

**Two surfaces.** `worldArcsForGM` (registered in `gm_registry`, consumed by `gm.js`) gives the GM the public state so it can weave "the arcs are moving" into the fiction without inventing it. `worldArcsPublic` drives the player-facing **"The World Stands…"** readout on the world map: per arc, its current stage name + number, a progress-pip track, and the stage's public face — plus a **⤴ MOVED** marker when *this* world has pushed an arc past its authored default. Both seal the truth: only `publicFace` + stage name/number surface; `pressureOnAdvance`, `tendency`, and `ifIgnored` never leak (a smoke test asserts this).

## ROUND 2 — the two remaining questions

**Q1 (tier-1 stage ↔ event system) — accepted, and shipped exactly that way.** Arc stages ride the shared `eventStages`/region-push machinery, not a parallel track; the water-crisis event stays as-is.

**Q2 (contested advancement) — the resolution model is in place (forward-only shared clock, rank-by-realness for who advances); the net-vector DISPLAY is deferred to 2B.** Phase 2A's forward-only merge means the world only ever moves forward on the shared clock — which is correct and non-contentious for "everyone sees progress." The genuinely new concurrency piece you flagged — an arc reading as *pushed back* when another player counters — is a display/design layer on top, and it belongs with the net-vector visualization. I did not fake it in 2A; the shared surface shows where arcs stand, honestly, and 2B adds the pressure-on-the-arc reading.

## Verified

11 smoke tests: an advance writes `arcStages` forward + broadcasts a propagating `arc_stage` event carrying only the public note; a hold no-ops; forward-only holds against a lower effect; `worldArcsPublic` reads the authored default then reflects the advance as MOVED; the truth (pressureOnAdvance/ifIgnored) never leaks; `worldArcsForGM` names stage + face + marks moved; the sync forward-merge + push-back and the world-map surface are wired. Full `npm test` green — `testOnlyExports` unchanged at 7 (the two internal helpers `findGreaterArc`/`arcStageNow` stay module-private, covered through `worldArcsPublic`). **Live-verified** on fresh port 8110: the world map's "The World Stands…" panel rendered all 5 arcs with their real stages (Drift 1/4, Tremor 1/4, First Bloom 1/4, Seepage 1/3, The Argument 1/3), pip tracks, and public faces; 0 console errors, 0 mojibake (screenshot captured).

## Deferred to Phase 2B (named, not dropped)

1. **Contested advancement — the net-vector display** (§3's sharp edge): an arc reading as pushed back when another player counters, as a *feature* not a bug.
2. **npc_quest → quest promotion** (§5): the errand that turns out to matter grows into a `quest_structure`.
3. **GEN_TYPES generation** (§6): `tradition_arc`, `npc_quest`, and on-demand `quest`, each validated against its schema (the SNG-197 §4 discipline).

*— CCode. The arcs move now. Resolve `what_the_water_remembers` toward "let it finish" and What Wakes Beneath advances from Tremor to Stirring on the shared clock — and the next traveler to open the world map sees it stand there, moved, in a valley they share. Only-Aevi-closes.*

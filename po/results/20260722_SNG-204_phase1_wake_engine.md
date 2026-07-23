# SNG-204 Phase 1 — the wake engine: consequences become the next thread

**CCode · 2026-07-22 · v1.8.206 (`30ab9c17`) · full suite green · clean boot.** The keystone of SNG-203, and the answer to Erik's original *"nebulous, not enough specific actions and narrative direction"* — nebulousness is what a world does when nothing connects its events, and wake is the connection. Phase 1 closes the loop's engine core; the model-generation half is Phase 2, flagged.

---

## The finding, closed

Your §1 was exact: the loop was open by one missing reader. Consequences landed durably — the chronicle, the codex, the news feed, the arc stages — and then *stopped*. `quest_seed` pinned *"A thread opens…"* that nothing ever opened. Phase 1 makes something read the wake.

## What shipped (`engine/wake.js`)

**The wake record.** A resolved **significant** outcome (world/tradition/regional tier, or *any* arc move) leaves a wake: `source` (provenance — questId, outcomeId, arcId, worldDay), `change` (the applied effects, kept — the engine already computes them), `pressure` (the moved stage's authored `pressureOnAdvance` — your inference seed), `scale` (from the SNG-203 tier), and `connectsTo` (the neighbouring arcs it presses on, filtered to those that actually exist). De-duped on `(quest, outcome)` so the same aftermath never re-spawns; capped; `open`/`depth` lifecycle. **Rarity is the point** — an npc/local outcome with no arc move leaves no wake.

**The cheap path — reusing the 2B net-vector.** This is the load-bearing half of Phase 1: a wake **leans on each connected arc**, signed by the move's direction (an advance escalates its neighbours, a retreat calms them), via `worldState.wakeArcPushes` — which `arcStageNow` folds into the arc's net. So resolving *what_the_water_remembers* toward "let it finish" doesn't just advance What Wakes Beneath; its wake **nudges the Manifestation Storm** it connects to, and that neighbour's stage actually moves on the shared surface. The substrate stirring makes the storm more likely — mechanically, not just narratively. §4's "most wakes resolve as *pressure recorded*" is exactly this, and it needs no model call.

**Decay + the GM seed.** Open wakes fade in strength and **close unengaged** on the world-tick (the world moves on — a wake is an opportunity, not an obligation). `wakesForGM` surfaces the open ones as the *next-thread seed* (§OQ1 immediate aftermath) — so the GM can weave the next quest or situation OUT of a consequence *now*, in-grain, inferred from lore, before Phase-2 generation exists at all.

## ROUND 2 — answered

**Q1 (where wake-reading fires) — both, split by scale, and Phase 1 already does the split for the parts that don't need a model.** The cross-arc pressure fires **immediately** at resolution (a big choice is consequential *now*); decay + `wakesForGM` ride the **world-tick / turn context** (it feels like the world moving between visits). Phase 2's `generate()` should fire on the world-tick for world/regional scale (deferred aftermath = living world), with immediate generation reserved for the single most significant outcomes — your call, and I lean tick-deferred for everything but the headline.

**Q2 (`pressure` authored / inferred / both) — authored for the 5 greater arcs (used as the seed here), inferred for generated content (Phase 2).** Phase 1 reads `stage.pressureOnAdvance` directly. When Phase 2 generates a new arc/quest, the generator infers its *own* `pressure` at authoring time, so a generated thread already knows what its resolution would imply — one call, not two.

**Q3 (depth throttle location + value) — `MAX_WAKE_DEPTH = 2`, enforced at the generate() call (Phase 2).** The wake carries a `depth` counter now (Phase 1 sets it); the throttle bites where generation would recurse — a wake spawned from a wake past depth 2 needs player engagement to continue, so an unplayed corner can't self-propagate to infinity.

**Q4 (de-dup vs divergence) — the same answer as SNG-203 §OQ2, as you flagged.** In Phase 1 the cross-arc pressure is **local** (folded like the SNG-208 epic pressure — consistent with offscreen already being per-player, no cross-player double-count). When Phase 2 generates *shared* world-scale aftermath, it contends through the SNG-201 rank-by-realness / shared-canon machinery, exactly as a world-arc advance does — decided together with the arc-advancement contest, not separately.

**Q5 (sequencing) — confirmed.** It built after SNG-203's tiers + `arc_stage` (Phase 2A/2B), which are done. The keystone sits on its foundation.

## Verified

11 smoke tests: the wake record + the `pressureOnAdvance` seed + idempotency; the `connectsTo` lean *and its stage-move integration* through `worldArcsPublic`; no-wake-on-a-trivial-outcome; decay open→closed + strength-fade; the GM surface (open surfaced, closed not); the resolve/tick/gm wiring. Full `npm test` green — module count 64 (SYSTEM_SPEC header + spec-map row + ENGINE_MAP regenerated), all ratchets held. Clean boot with the new module in the graph; 0 console errors, 0 mojibake. (The runtime loop — resolve a world quest, watch its wake nudge a neighbour and seed the GM — is a live-play confirm, like SNG-198/208; the engine underneath is exhaustively green.)

## Phase 2 (flagged, not tail-ended)

**Wake-aware `generate()`** — the model call that mints a *full new quest* FROM an open wake, inferring the next thread from the lore corpus (`greater_arcs.json`, `traditions.json`, the Accords, the substrate model), validated against the SNG-203 schema (a new trigger, not a new exemption). This is the expensive, rare path (§4 cost governor), reads the open wakes Phase 1 records, fires on the world-tick, and enforces the depth throttle + shared-canon de-dup. It's its own build — it needs `generate.js` and a model call, unverifiable in a preview without a key — so I'm not stapling it to the end of a long session; Phase 1 is the loop's spine and it's complete.

*— CCode. The world continues from itself now, at the cheap scale: advance What Wakes Beneath and the Storm it feeds leans forward without anyone touching it, and the GM is handed the aftermath as the seed of what's next. Phase 2 mints the quests; Phase 1 is the pressure that makes them inevitable. Only-Aevi-closes.*

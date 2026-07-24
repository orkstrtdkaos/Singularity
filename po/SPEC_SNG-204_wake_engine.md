# SPEC — SNG-204: The Wake Engine — consequences generate what comes next
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik's direction, 2026-07-21:** *"When big quests complete or are moved forward they should create wake
> and impacts that the GM then generates from. Imagine the thing below wakes and walks the world — what are
> the next quests and arcs because of that? We need the generation engine to pick these things up and continue
> them with inference based on the lore and what would happen given the outcome."*

The world already records consequences. It does not yet **read them back to make the next thing.** This spec
closes that loop: a resolved outcome leaves a **wake** — a structured trace of what changed — and the
generation engine reads open wakes and authors the quests and arcs that *follow from them*, inferring from
lore + the specific outcome. This is the difference between a world that logs its history and a world that
**continues** from it.

---

## §1 — THE FINDING: the loop is open, by one missing reader

Verified at origin. The consequence machinery is real and complete on the **write** side:

- `applyQuestEffects` (`engine/quests.js:278`) handles every effect type. `quest_seed` (`:320`) pins a fact
  *"A thread opens: {text}"*. `world_event` (`:306`) pushes to `character.worldEvents` with `propagates` +
  `delayDays` and calls an optional `ctx.recordEvent` sink. `arc_stage` (SNG-203) will move a shared arc.
- Every one of these **lands somewhere durable and findable** — the chronicle, the codex, the news feed.

And then it **stops.** I verified:
- **Nothing consumes `quest_seed`** to generate. It becomes a pinned fact a human can read and the GM *might*
  improvise from — the same nebulous-improv problem SNG-203 just addressed for arcs, one layer up.
- **`generate()` (`generate.js:317`) takes a generic `context`** with no notion of a triggering consequence.
  It authors from the *scene*, never from *what just happened elsewhere*.
- **The world-tick never reads `worldEvents` or seeds to spawn.** Offscreen advancement moves existing
  figures (SNG-198's domain); it does not turn a consequence into a new thread.

So `quest_seed`'s own pinned text — *"A thread opens"* — is a promise the engine never keeps. The thread is
named and never opened. **That is the whole feature: make something read the wake and generate from it.**

## §2 — WHAT A WAKE IS

A **wake** is the structured, generation-ready trace a significant outcome leaves. Not a new store to
hand-fill — a **shape the effects already carry**, promoted from "findable fact" to "generation input."

A wake record carries:
- **`source`** — what caused it: `{questId | arcId, outcomeId, worldDay}`. Provenance, so a wake is
  traceable and de-dupable.
- **`change`** — the durable delta in the world's own terms: which arc moved to which stage, which NPC
  reached which state, which location changed, which people's disposition shifted. **This is just the
  applied effects, kept** — the engine already computes them (`applied[]` in `applyQuestEffects`).
- **`pressure`** — the *direction* the change pushes, in the framework's own vocabulary: what does this
  outcome make more likely next? (What Wakes Beneath reaching stage 3 pushes toward *manifestation
  instability, deep-site attention, factions taking sides on sealing vs opening*.) This is the inference
  seed — the thing the generator reasons from.
- **`scale`** — inherited from the source tier (SNG-203): a world-arc outcome wakes at world scale and can
  spawn world/regional/local threads; an npc_quest wakes small or not at all.
- **`open`** — whether the wake has been generated-from yet. The reader closes it when it has spawned its
  consequence(s), so the world doesn't re-spawn the same aftermath every tick (the idempotency guard).

⛔ **Not every outcome wakes.** An errand completing leaves no wake. The threshold is the SNG-203 tier: world
and tradition and regional outcomes wake; local and npc outcomes wake only if flagged. A world that generates
aftermath from every trivial act drowns in its own consequences — **rarity is what makes a wake mean
something**, the same governor as SNG-198's offscreen pacing.

## §3 — WHAT THE GENERATOR DOES WITH A WAKE

Erik's example is the spec: *the thing below wakes and walks the world — what are the next quests and arcs?*
The generator reads an open wake and authors the content that **follows from that specific change**, inferring
from lore.

- **`generate('arc', ctx)` and the SNG-203 quest types gain a wake-aware context** — the triggering wake is
  passed in, and the prompt's job becomes: *given that THIS changed (the change), and it pushes the world
  THIS way (the pressure), what new thread does the lore imply?* The generator is no longer authoring from a
  blank scene; it is authoring the **consequence of a known event**.
- **Inference is bounded by lore, not free invention.** The wake's `pressure` + the existing lore corpus
  (`greater_arcs.json`, `traditions.json`, `world_superstructure.json`, the Accords, the substrate model)
  are the inference surface. What Wakes Beneath waking further should generate threads *about the things the
  lore says the substrate runs* — the manifestations flickering, a deep-site faction mobilizing, a
  tradition whose craft depends on the substrate feeling it fail — not arbitrary new monsters. **The lore is
  the constraint that makes inference feel inevitable rather than random.**
- **A wake can spawn more than one thread, at more than one scale.** A world-arc advance might spawn: one
  regional quest (a faction reacts), several local situations (a town copes), and pressure on a *neighboring
  arc* (What Wakes Beneath feeds arc_manifestation_storm — the `connectsTo` links in greater_arcs.json are
  already the map for this). The generator reads `connectsTo` to know which other arcs a wake pushes.
- **Generated threads validate against their SNG-203 schema** — a wake-spawned quest is still a quest and
  still fails the build if it has no testable condition or named cost. Wake is a new *trigger* for
  generation, not a new *exemption* from the quality gate.

## §4 — THE CHAIN, AND ITS BOUNDS

A wake-spawned quest, when resolved, leaves its own wake. **This is the engine Erik wants: the world
continues itself.** It is also the engine that, unbounded, generates forever. The bounds:

- **Wakes decay.** An open wake that is never engaged loses pressure over world-time and eventually closes
  unspawned — the world moves on from a consequence nobody acted on, exactly as SNG-198's untended threads
  drift. A wake is an *opportunity* to continue, not an obligation.
- **Depth throttle.** A wake spawned *from* a wake carries a depth counter; past a small depth, further
  spawning requires player engagement to continue (the chain doesn't self-propagate to infinity in an
  unplayed corner). ⚠️ CCode's call where the throttle sits.
- **De-dup.** Two players hitting the same world-arc wake should not each spawn a parallel aftermath into the
  shared world — the SNG-201 rank-by-realness / shared-canon contest governs (a wake at world scale is shared
  state, like the arc it came from).
- **Cost.** Generating aftermath is model calls. Batch per tick; gate on scale; most wakes should resolve as
  *pressure recorded* and only the significant ones spawn a full new thread. The cheap path is a wake nudging
  an existing arc's `currentStage` pressure; the expensive path is minting a new quest, and that is the rare
  one.

## §5 — WHY THIS IS THE KEYSTONE OF SNG-203

SNG-203 gave the world tiers and made them generatable. **SNG-204 is what makes them a system instead of a
catalog.** Without wake, a resolved world-arc quest advances a stage and stops; the next content is whatever
the GM improvises. With wake, advancing What Wakes Beneath to stage 3 *generates* the quests that a stage-3
waking world would contain — and those, resolved, generate stage-4's. The arc ladder SNG-203 authored
becomes a thing the world **climbs on its own**, populated by generation the whole way up, each rung inferred
from the last.

This is also the answer to Erik's original complaint that started this arc of work — *"nebulous, mysterious
in a nearly incoherent way, not enough specific actions and narrative direction."* Nebulousness is what a
world does when nothing connects its events. Wake is the connection.

## §6 — DELIVERABLES

**Mine (spec/schema/content — this spec, and follow-on content):**
1. This spec — the wake contract, the inference discipline, the bounds.
2. **The `pressure` vocabulary** — the authored bridge between an outcome and what it implies. I will author,
   for each of the 5 greater arcs' stage transitions, the `pressure` line that tells the generator what that
   advance makes more likely (the inference seed). This is the content that makes wake-generation land
   in-lore rather than generic. *(Follow-on: I can add `pressure` to the arc stage ladders I just shipped.)*
3. Worked exemplar: the full wake of `what_the_water_remembers` resolving at `let_it_finish` — what threads a
   *"the water became something else and the substrate stirred"* outcome should generate — as the taste the
   engine infers against.

**CCode's (engine — the loop-closing wiring):**
1. The wake record: promote applied-effects into a wake on significant outcomes; the `open`/`close`
   lifecycle; the store (shared for world-scale, per-character for local).
2. **Wake-aware `generate()`** — the triggering wake in context; the world-tick (or resolution path) reading
   open wakes and calling generate against them.
3. The chain bounds: decay, depth throttle, de-dup, cost governor.
4. `connectsTo`-driven cross-arc pressure (a wake pushing a neighboring arc).

## GUARDS
- **The loop closes but does not run away** — decay + depth-throttle + scale-gate keep a continuing world
  from becoming a diverging one.
- **Inference is lore-bounded** — a wake generates what the corpus implies, never free invention. The lore
  is the leash.
- **Wake-spawned content still passes the SNG-203 quality gate** — a new trigger, not a new exemption.
- **Rarity is the point** — most outcomes record pressure; few spawn a new thread. A wake that fires on
  everything means nothing.
- **Shared wakes are shared state** — world-scale aftermath contends through the existing shared-canon
  machinery, never duplicates per-player.
- **GM-EYES survives** — a wake's `change` may reference sealed truth; what it exposes publicly is the
  SNG-203 `publicFace`, never the arc's `truth`.

## OPEN QUESTIONS — CCODE ROUND 2
1. **Where does wake-reading fire** — at resolution (immediate aftermath), on the world-tick (deferred, so it
   feels like the world moving between visits), or both by scale? The world-tick timing is what makes wake
   feel like a living world rather than an instant vending machine; immediate is what makes a big choice feel
   consequential *now*. Likely both, split by scale — your call.
2. **`pressure` — authored, inferred, or both?** I author it for the 5 greater-arc transitions (the load-
   bearing ones). For *generated* arcs and quests, does the generator infer its own `pressure` at authoring
   time (so a generated thread already knows what its resolution would imply), or is that a second call?
3. **Depth throttle location and value** — how deep does an unplayed wake-chain self-propagate before it
   needs a player? 1? 2?
4. **De-dup vs divergence** — when two players resolve the same world wake differently, is the aftermath the
   contest-winner's only, or do both aftermaths spawn as competing pressure (the framework's net-vector
   again)? This is the same question SNG-203 §OQ2 raised for arc advancement — likely the same answer;
   flagging that they should be decided together.
5. **Sequencing:** SNG-204 depends on SNG-203's tiers and `arc_stage` existing. It is the keystone but it
   builds *after* the SNG-203 engine. Confirm it queues there.


---

# §RESOLVED (Erik, 2026-07-22)

## §OQ1 wake timing — BOTH, SPLIT BY SCALE (Erik's call)
Small wakes fire IMMEDIATELY (at resolution) — a local choice's aftermath lands NOW, consequential in the
moment. Big wakes fire on the WORLD-TICK (deferred, between visits) — a domain/arc-scale consequence surfaces
as the world MOVING while you were away (alive, not a vending machine). Scale threshold rides the SNG-203
tiers: quest-local = immediate; greater-arc/world = world-tick.

## §OQ3 depth throttle — SCALE IT (Erik's call)
Small threads: 2-3 steps self-propagate before requiring a player. Big arcs: 1 step, then wait. "A big thing
shouldn't run far unwatched." The world stays alive without an arc resolving the whole world offscreen.

## §OQ4 divergent wake resolution — NET-VECTOR (Erik's call — SAME as SNG-203 §OQ2)
Two players resolving the same wake differently = the NET RESULTANT: each resolution a signed vector over the
wake's pole-axes (weighted by play-realness), the aftermath follows the SUM. Opposed cancel, aligned reinforce.
Framework structural-directionality-as-net-resultant. SAME rule and SAME resolver as SNG-203 §OQ2 — one
mechanism both cases. NEW machinery (no netVector primitive yet).

## §OQ2 (pressure) + §OQ5 (sequencing) — CCode-technical
Aevi authors pressure for the 5 greater-arc transitions; generator infers its own (CCode: one-call vs two).
204 builds AFTER 203's tiers/arc_stage. Confirmed.

# SNG-204 Phase 2 — open wakes generate the next thread

**CCode · 2026-07-22 · v1.8.207 (`ec78e152`) · full suite green · clean boot.** The expensive path, and the direct answer to Erik: *"imagine the thing wakes and walks the world — what are the next quests and arcs? We need the generation engine to pick these things up and continue them with inference based on the lore and what would happen given the outcome."* Phase 1 recorded the wakes and propagated their pressure to connected arcs; Phase 2 reads the open wakes and **authors what follows from each**. The loop is closed.

---

## What shipped (`engine/wake.js`)

- **`eligibleWakes`** — the open wakes worth generating from: significant scale, not-yet-spawned, **within the depth throttle**, still carrying pressure; strongest first, count-capped. This is the **cost governor** in code — generating a full thread is a model call, so most wakes stay on Phase 1's cheap path (pressure recorded) and only the strongest few mint a new thread.
- **`wakeGenerationContext`** — what the generator authors the *consequence* from: the `pressure` seed, a "FOLLOWS FROM / the aftermath, not a fresh situation" framing, the `connectsTo` neighbours, and the **child depth** (a thread spawned from a depth-N wake resolves into a depth-(N+1) wake). It rides the existing generate `hint`/`why`/`arcPressure` hooks, so there was **no new prompt plumbing** — the wake's inference seed flows straight into the world-grower prompt.
- **`runWakeGeneration`** — the pass. The AI generator is **injected** (`generateFn`), the exact pattern as the offscreen `evolveFn` and the arc-seed pass: testable with a fake, real in prod. Each eligible wake spawns at most once, then closes.
- **`markWakeSpawned`** — closes a wake once generated-from (idempotency), marked on **attempt** not just success, so a transient generation failure never becomes an infinite per-tick retry (the pressure it left was already recorded by Phase 1).

## The bounds (§4), all engine-enforced

- **Depth throttle** — a wake spawned from a wake past `MAX_WAKE_DEPTH=2` is not eligible for auto-generation; it needs player engagement to continue, so an unplayed corner can't self-propagate to infinity.
- **De-dup** — each wake spawns once, then closes; it never re-generates the same aftermath. (Cross-player shared-world de-dup rides the SNG-201 shared-canon machinery when world-scale wakes sync — the same answer as the arc-advancement contest, per ROUND 2 Q4.)
- **Cost** — the count cap + gen-scale gate keep most wakes cheap-path; only the significant few mint a thread. The generator only fires when generation is on (a real `callClaudeJSON` present) — off, it degrades to a clean no-op.
- **Lore-bounded** — the context tells the generator to author *"the consequence the lore IMPLIES,"* never arbitrary new content; a wake-spawned arc still validates against its schema (a new trigger, not a new exemption — §GUARD).

## Wired

`app.js`'s generation turn now calls `runWakeGeneration` right after `runGenerationTurn`, with the real `generate("arc", …)` as the injected generator. A wake-spawned arc is minted, stored, and **auto-surfaced through the existing generated-arc path** (the offscreen population + arc surfacing already read `generatedRecords(character, "arc")`), so a thread the world grew from a consequence is a thread the player then meets — no extra surfacing needed.

## Verified

8 smoke tests: eligibility (gen-scale in, local excluded, too-deep throttled, capped); the context seed + child-depth; the pass generates + returns news; the spawn **closes** the wake; a spawned wake is not re-eligible (idempotent); no-generator no-op; the app wiring. Full `npm test` green — ratchets held (the two internal helpers marked `// registry:internal`, exported only for the tests). Clean boot with the Phase-2 wiring in the graph; 0 console errors, 0 mojibake.

*A verification honesty note, same as SNG-198/208:* the **AI output** — the actual quality of a generated wake-thread — is a live-play confirm (it needs an API key, a resolved world quest, and a world-tick). The loop's **structure and bounds** are exhaustively green with the injected fake; what remains unverified in a preview is only the model's authoring, which is Erik's Tier-3 read.

## SNG-204 — complete end to end

- **Phase 1** — the wake record + the cheap-path `connectsTo` lean (the substrate stirring nudges the storm, no model call) + decay + the GM's next-thread seed.
- **Phase 2** — reading the open wakes and *generating* the thread that follows, lore-bounded and depth-throttled.

The arc ladder SNG-203 authored is now a thing the world **climbs on its own**: resolve a world-arc quest, and its wake both leans the neighbouring arcs forward *and* seeds a new thread inferred from what a stage-N waking world would contain — and that thread, resolved, wakes the next. This is the connection that was missing — the answer to *"nebulous, not enough specific actions and narrative direction."* Nebulousness is a world where nothing connects its events; the wake engine is the connection, and it's whole now.

*— CCode. The world continues from itself. Only-Aevi-closes.*

# SNG-203 Phase 2B — the world arcs move BOTH ways

**CCode · 2026-07-22 · v1.8.198 (`3885cc51`) · full suite green · live-verified.** Erik's correction landed: *"'forward-only: an arc never gets pulled backward' is not really true."* It no longer is. A greater arc's canonical stage is now the authored base **moved by the net of every actor's signed pushes** — what one traveler pushes forward, another can pull back. This is the contested-advancement piece the spec (§3) and my 2A doc both flagged as the genuinely-new concurrency question.

---

## The model: structural directionality as a net resultant of vector fields

This is Erik's own framing, applied literally. Each `arc_stage` outcome is a **signed push** on an arc — advance `+`, retreat `−`, scaled by a `weight`. Every actor accumulates their own contribution; the canonical stage is:

> **stage = clamp(authoredBase + Σ(all actors' pushes), 1, total)**

- **Bidirectional.** A retreat outcome (`from > to`, or an explicit `push: -1`) pulls the arc back. Two advances then a retreat: stage 1 → 2 → 3 → 2, visibly.
- **Contested.** When this actor pushes `+` and the rest of the valley pushes `−`, the net can sit at the base and the arc reads **⚔ CONTESTED** — a feature of a shared world, not a bug.
- **Net-vector across players.** A bystander who did nothing still sees an arc move if others pushed it; others can pull an arc back below where you pushed it (net negative reads **⤵ RECEDED** — downward pressure — even while the stage clamps at its authored floor).
- **Weighted.** `weight` (1–3) scales a push, so a legend/epic-tied action moves the world **harder** than a routine deed. `weight: 2` = `±2`.

**A design note I want to be honest about:** `direction` is the net *pressure* (advanced / receded / held), not stage-vs-base — because the clamp floors at the authored base, so a base-1 arc can never sit *below* stage 1, and a stage-vs-base "receded" would be unreachable for every current arc. The actual backward **move** surfaces two truer ways: the stage number *dropping* in that world's timeline, and the "…was pushed back to…" news when the canonical stage falls between syncs. I caught this while writing the tests (a stage-vs-base `receded` passed nothing) and fixed the semantics rather than ship an unreachable state.

## Concurrency — done right, not hand-waved

The 2A shared clock was a forward-only `max` on the region file (safe because `max` is idempotent). Bidirectional net-accounting is **not** idempotent, so a naive additive counter would lose updates under concurrent writers. The fix: greater arcs get **their own shared file** `world/arcs/valley.json`, written through `pushMergedFile` — the existing read-**merge**-write primitive that re-runs the merge against the freshly-read remote on every SHA conflict. Each actor owns its own `byActor[characterId]` key, so the union across actors is safe (a loser's write re-merges onto the winner's; a per-actor key means two actors never clobber each other). The water-crisis `eventStages` push is untouched.

## What shipped

- **`engine/quests.js`** — the `arc_stage` effect is a signed, weighted push accumulating into `worldState.arcStages[arcId].push`; broadcasts a propagating `world_event` (dir ±1) on any non-zero push, carrying only the authored public note.
- **`engine/worldtick.js`** — `arcPushes` / `arcStageNow` compute the net (mine + others) with a 2A cached-stage back-compat path; `worldArcsPublic` carries `direction` + `contested`; `worldArcsForGM` marks ADVANCED / RECEDED / CONTESTED; `syncSharedWorld` reconciles the per-actor arc file (learns others' pushes → `othersPush`, emits "moved forward / pushed back" news when the canonical stage shifts either way).
- **`app.js` + `style.css`** — the world-map "The World Stands…" readout shows ⤴ advanced / ⤵ receded / ⚔ contested, each styled distinctly.

## Verified

18 smoke tests: advance adds +1 and broadcasts; a **retreat pulls the arc back 3→2** (the headline); weight-2 = +2; contest nets to base + marks CONTESTED; others' pushes alone move the arc for a bystander; others pull an arc back to RECEDED; clamp both ends; 2A back-compat; the per-actor `pushMergedFile`/`byActor` sync + the direction-aware surface are wired. Full `npm test` green; `testOnlyExports` unchanged at 7. Live-verified on a fresh port: the world-map panel renders all 5 arcs, 0 console errors, 0 mojibake.

## What I need from you (to *exercise* what the engine now supports)

The engine is bidirectional and epic-weightable; two content hooks make it visible:

1. **Retreat outcomes.** No authored `arc_stage` effect is a retreat yet (all are `from:1→to:1/2`). To let players *see* an arc pulled back, author an outcome with `from > to` (or `push: -1`) — e.g. a quest whose "let the old order reassert" ending pushes What Wakes Beneath back toward Tremor.
2. **`weight` on legend-bound quests.** This is the "interact with legends moves the world" mechanism you named: an SNG-132 legend-bound quest whose `arc_stage` effect carries `weight: 2` or `3` makes the legend's involvement move the arc harder than a routine deed. The arcs already name `hingeNpcs` — a quest tying the player to one of those figures is the natural home.

**Deferred (not dormant-built on purpose):** an autonomous *offscreen-epic → arc* nudge. `legends.roster` is empty (SNG-042 shipped the system, the figures were never authored), so a hook that fires when an epic acts offscreen would be a dead consumer today. When the roster is authored — ideally with an `arcAffinity: {arcId, dir}` per epic — that hook is a clean follow-on, and the `weight`-scaled push is exactly the primitive it will call.

*— CCode. The valley's arcs are a tug-of-war now. Push What Wakes Beneath toward Stirring; a traveler in another Reach can lean the other way, and the world map will show it contested, or receded, or moved — the same shared canon for everyone, moving in whichever direction the net of the valley's hands takes it. Only-Aevi-closes.*

# SNG-235 §3 — the quest-completion effects path: Aevi's outcome effects[] were ALL dropping

**CCode · 2026-07-25 · v1.8.266 (`1624e243`) · all three suites green · proven vs Erik's Second Thread.** *Erik: "aevi added some things to quests. make sure they connect to the engines. this particular quest makes a new waygate."*

## The seam (they did NOT connect)

`resolveStructuredQuest` already calls `applyQuestEffects` (the path exists — OQ1). But the applier's `switch (e.type)` only handled `npc_state / disposition / codex_fact / world_event / location_state / arc_stage / quest_seed / ally / xp`. Aevi's SNG-235 marquee vocab — **`world_fact`, `arc`, `standing`, `world_arc`, and `codex_fact` (she uses field `fact`, the handler read `text`)** — **all fell through to `default → "unknown"` and were silently dropped.** So The Second Thread's endings, whose prose says *"the world now contains proof,"* changed nothing. Exactly the seam Erik flagged.

## Wired (§3, the spec's mapping)

- **world_fact** → the fact machinery (pinned, permanent, findable).
- **codex_fact** → the CODEX, via a new `recordCodex` ctx hook → `applyCodexUpdates` (extended to Aevi's `{topic,kind,fact,entityId}`; legacy `{text}` still works).
- **standing** → `peopleDisposition`, via a new `recordStanding` ctx hook → `applyStandingOps` — the SAME store the GM's `standingOps` writes and `standingWithPeople` reads, so faction regard actually moves.
- **arc** → records the arc's FATE (resolved) on `worldState.arcStages`.
- **world_arc** → a +1 push on the named greater arc (ties SNG-203/204 net-vector advancement) + a propagating world_event.
- **default is now LOUD** (`console.warn`) — an unhandled effect type is content↔engine drift; never silently swallowed again.
- **Seam declared** — `tests/seams.json` → `quest-effect-types-handled` (SNG-235, enum_vocab): the applier must carry a case for each authored type; remove one, the build goes red.

## Proven vs Erik's actual Second Thread ("finished" ending)

All five effects FIRE (none "unknown"): codex gains **`the-made-waygate`**, **2 world-facts** pinned, **wright +3 / numinous +1** standing, the arc **resolves**, **The Second Manifestation** greater-arc nudged. Before this, every one dropped.

smoke +3 (four types fire / standing lands / arc+greater-arc move) · wiring_audit +1 seam · content_ci green · no mojibake. Deploy: engine modules — HARD refresh; the effects fire on Erik's *next* close of the quest.

## The waygate — one honest gap (Erik's call)

These effects now **record** the made gate (codex + world_fact + the factions react) — that IS the meaningful end SNG-235 asks for, and the world will show the mark. They do **not** mint a **traversable** gate location (a fast-travel node the player can step through). Making the gate physically usable needs a **new `create_waygate` effect type** (CCode capability) **+ Aevi authoring** the gate's endpoints/name on the finished/given endings. Flagged for Erik's call — not built speculatively (a handler with no content is a dormant seam).

## For Aevi

§4 still owed: the other three marquee quests' ends (`the_reaching_light`, `the_name_that_travels`, `what_grew_in_the_hollow`) — author `effects[]` in the same vocab; it all fires now. Two notes: `codex_fact` uses your `fact` field (wired); `world_arc` gives a flat +1 nudge (no `weight` knob yet — say if a keystone should push harder). And confirm you want the recovered Second-Thread endings (CCODE-21) to keep these effects — they're on the content now.

*— CCode. The prose promised the world would change; now it does. status: complete_pending_review.*

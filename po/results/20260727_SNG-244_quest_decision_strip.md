# SNG-244 — Quest decision surfaces in the banner above narration

**CCode · 2026-07-27 · v1.8.287 (`a4a14abc`) · npm test exit 0 (rawProseCaps baseline 63, wiring audit all-pass).**

Erik: *"When a quest condition completes and a decision needs to be made to end it, it should present
that decision in the banner above the narration so it's obvious."*

## The gap (as the spec verified)
The decision STATE already existed — the quest detail page computes `atDecision` and shows the endings.
But a player IN NARRATION got no signal: they'd have to leave the scene and open the Quests tab to
discover the endings were ready. The most important beat of a quest — the choice it was all built toward —
was invisible at the moment it mattered.

## What I built — a decision strip in the SNG-230 integrated slot
- **Same slot as the encounter frame.** The decision strip renders in the exact integrated-strip slot
  (above the narration) that SNG-230's encounter frame uses — a new `enc-frame-decision` type. It's
  **gold-weighted** (border + title) so it reads as a *choice*, not a fight.
- **Driven by existing state only.** `questsAtDecision()` lifts the exact `atDecision` derivation the
  quest detail already computes (`awaitingResolution || all stages done`), so the strip surfaces the same
  truth the detail page does — no new decision/resolve logic.
- **Shows the roads directly** (Erik's lean, OQ1): the quest title, "decision at hand", and each outcome
  as a tappable road — its **name** + a **summary** (word-boundary clamped). Tapping a road routes to the
  resolve.
- **One resolve path.** Extracted `resolveQuestOutcome(questId, outcomeId)` — the strip AND the quest-detail
  ending buttons both call it. This de-dupes the SNG-235 ctx sink bundle (`recordEvent/Fact/Codex/Standing`,
  `createWaygate`, `recordPlaceChange`) so the strip is a genuine shortcut to the existing ending-selection,
  never a parallel path.

## Guards (all honored)
- **Encounter-first:** the strip is suppressed while `activeEnc()` is live — you resolve the fight, *then*
  the decision surfaces. Never two takeover strips. (Live-verified: with an encounter active the strip
  stayed hidden; clearing the encounter surfaced it.)
- **Persistent until acted:** it doesn't vanish on the next turn; declining the confirm leaves it in place.
- **Reuses the strip, no parallel banner** (the party-banner is a separate floating toast, no collision).
- **Plain weighty copy**, not a system toast ("Every stage is behind you — what it was all for is yours to
  decide. This is permanent.").
- **Multiple decisions** (OQ3): shows the first (primary), notes "＋ N other decision(s) also ready — on the
  Quests screen." Rare by design.

## Live verification (fresh port 8361, crafted save resumed into play)
- Strip renders: title **"⚖ The Second Thread"**, kind **"decision at hand"**, the three roads with names +
  summaries + correct `data-qdecide="test_second_thread::<outcomeId>"`.
- **Encounter-first proven:** while the dev char had an `activeEncounter`, the strip was correctly absent;
  after clearing it, the strip appeared.
- **Resolve routing proven:** tapping "Finish it" called the shared resolve with the exact confirm —
  *Resolve "The Second Thread" as "Finish it — make the gate"? This is permanent and changes the world.* —
  and declining left the strip persistent.

## Files
- `app.js` — `questAtDecision`/`questsAtDecision` predicates; `resolveQuestOutcome` shared helper; detail-page
  `[data-outcome]` handler now calls it; the decision-strip IIFE in `renderPlay` (encounter-first guarded);
  a global `[data-qdecide]` click listener; v1.8.287.
- `style.css` — `.enc-frame-decision` + `.dec-road(s)` gold-weighted styling.
- `index.html` — `?v=1.8.287`.

## Owed
- **AEVI:** the per-quest decision-strip COPY (spec OWNERSHIP — "how the decision announces itself"). A
  generic weighty template is in place until then; a `q.decisionStripCopy`-style field (or a per-quest
  override) can slot into the strip title/subtitle when authored.

*— CCode. The decision is now as unmissable as an encounter — because a resolve IS an encounter with a
choice. Ties SNG-239: the GM states the reveal (prose), the UI surfaces the decision (strip).
status: complete_pending_review.*

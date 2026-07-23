# SNG-213 — the complete repair surface (the Repair Cluster: 213 + 212 + 207c)

**CCode · 2026-07-22 · v1.8.208 (`a4af1e44`) · full suite green · clean boot.** Erik: *"I haven't seen the GM actually fix anything I've asked."* You diagnosed it exactly — two failures, and completing one without the other leaves it broken. Both are closed.

---

## A — the missing vocabulary (the 16-gap audit)

**`correctEntityField {kind, id, field, to}`** — the general repair — closes the worst gaps in one op. An NPC was **gender-fixable only**; now its `name` / `role` / `description` / `status` are all correctable, plus a location's, quest's, item's, and codex entry's text, and player fields. A **rename keeps the old name as an alias** so any reference (a quest giver, a codex entity) still resolves — that's SNG-212 (the mother, stuck as a placeholder) closed as the concrete case. **`removeEntity`** gains the missing `item` kind.

**The doctrine did not move (§GUARD).** `correctEntityField` only touches whitelisted **descriptive** fields; a numeric/earned field (rank, attribute, vital, relationship) is **refused with a pointer to its own lower-only clamped op** — so folding the field-fixes into one general op is never a power leak, exactly as you required. A repair is free; the fiction-conferred *creates* still go through `registerEstablished`/`grantStoryItem`, trace-gated. The four rungs are untouched.

## B — the GM wouldn't emit (SNG-207c — why repair kept failing)

A complete vocabulary the GM won't reach for is useless, so the prompt got the three behavioral fixes from your captured escape:

- **Every op paired with its trigger.** The repair block now maps player phrasings to ops — *"her name is actually X"* → `correctEntityField`, *"I'm actually in Y"* → `reanchorLocation`, *"she's marked here but she left"* → `correctEntityField {field: status}`. An op with no trigger example is an op the GM doesn't reach for (the shared lesson of 207c + 212).
- **The reframe is forbidden.** *"It'll fix itself next beat / that's a display thing / keep playing"* on a reported wrong value is named as a deflection — a reported wrong value **is** a repair request; emit this turn, never route around it.
- **No hallucinated limitation.** Don't tell the player you (or the panel) can't fix what you can — the answer to *"can you fix this?"* is to emit the op. Guard both directions, and the panel manifest is updated so panel and GM stay in lockstep (the 207c false claim came partly from drift).

## ROUND 2 — answered

**Q1 (generalize vs. add) — generalized, and the clamps survived.** `correctEntityField` (one op) closes the bulk of the field gaps and gives the GM one trigger-family to learn; the specialized clamped ops (`correctVital`/`correctAttribute`/`correctAbilityRank`/`correctBond`) stay untouched, and the general op *refuses* their fields with a pointer — so no clamp is lost and no power leaks.

**Q2 (per-kind field whitelist) — authored in the engine** (`CORRECTABLE_ENTITY_FIELDS`) as the safe descriptive set per kind; you can refine it as content later. `firstMet`, `relationship`, and the numeric fields are deliberately absent (relationship only via the bond/consequence path, as you flagged).

**Q3 (scene-state scope) — deferred, and when built, the desync-prone fields only** (location via `reanchorLocation` already; setting/who's-present on `character.activeScene`), not the whole object.

**Q4 (panel expands to match) — yes, done in lockstep.** `correctEntityField` is in the manifest now, so the panel-capability block the GM reads and the ops the GM emits describe the same surface — closing the drift that produced the false "can't fix location" claim.

## Verified

14 smoke tests: NPC name (with alias preserved) / role / status; player (validated), quest, item, codex fields; a numeric field refused with the pointer; unknown-kind refused; item removal; the trigger examples + anti-reframe + anti-hallucination prose in the prompt; the panel manifest. Full `npm test` green — ratchets held (`smartClamp` on every new text field; the first-pass `.slice` prose-caps caught and converted before commit). Clean boot with the new imports; 0 console errors, 0 mojibake.

## The acceptance criterion, honestly

§4's bar is *"a repair that visibly lands"* — the player asks, the GM emits, the value changes. The **engine half is exhaustively green** (every `correctEntityField` path is tested to actually change the value). The **GM-emit half** — the model actually firing the op when Erik asks, now that it has the vocabulary and the anti-deflection prompt — is a live-play (Tier-3) confirm; it needs an API turn I can't drive in a preview. What I can promise: the op now *exists* for every field Erik named, the panel and GM agree on what's fixable, and the prompt forbids the two dodges that were making it fail. The first visible successful repair should land the moment he asks.

## Deferred (flagged, not tail-ended)

**`registerEstablished`-generalization** to all kinds (item/companion/quest/codex/location creates — npc + item already exist under `registerEstablishedNpc`/`grantStoryItem`), **`correctSceneState`**, and **`correctStanding`/`correctTime`** (the two orphan systems). These are the *smaller* remaining gaps; the biggest field gaps and the emit side — the reason repair failed at all — are the highest-value slice and are done.

*— CCode. The GM can fix the name, the role, the status, the place, the quest, the item, the codex fact — and it's told, in the language the player actually uses, to just do it and never explain why it can't. The lever exists now, and the hand is told to reach for it. Only-Aevi-closes.*

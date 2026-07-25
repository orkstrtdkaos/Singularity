# SPEC — SNG-234: The generator emits COMPLETE content, and EVOLVES it over time
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** "Make sure the generator fills in complete content when it emits new things with a template. It
> should also update and evolve the content for things too."

Two fixes, one root idea: **a generated thing should be born WHOLE and grow over time — never born hollow and
frozen.** This is the general cure for the disease SNG-233 was a symptom of (Pell/Veth born without interiority).

## §1 — Verified: the generator has a schema + a repair step, but interiority isn't REQUIRED
- `handleGenerateRequests` (app.js:1929) generates against `CONTENT.genSchemas[type]` via `generate()`.
- `engine/genschema.js` HAS a `missingRequired(obj, schema)` repair step — it already re-asks for missing
  REQUIRED fields. So the machinery to enforce completeness EXISTS.
- **The gap:** interiority (personality/wants/fears/disposition) is evidently NOT in the gen schema's `required`
  set — so the generator can emit an NPC without it, born hollow. Same for a location's dangerLevel/worldPos
  (the null-field family, SNG-232). The schema permits partial births; the repair step only enforces what's
  marked required.

## §2 — Fix A: BORN WHOLE — the template completeness contract
Make the generation template REQUIRE the fields that make an entity function, so a new thing arrives complete:
- **NPC required set MUST include the interiority:** `personality`, `wants` (>=1), `fears` (>=1), `disposition`
  — the fields SNG-233 showed an NPC is dull without. A generated NPC is born with drives, not just a name +
  role. (For a MINOR NPC — a passing farmer — a LIGHT template is fine; the full interiority is for NPCs the
  generator is establishing as nameable/recurring. Gate by whether the NPC gets a stable id.)
- **Location required set MUST include:** `dangerLevel`, `worldPos{colatitude,longitude,depth}`,
  `axisVector[12]`, `poleIntensity{}` — the null-field family (SNG-225/232). A generated place is born
  encounter-eligible and map-placeable, never null-fielded.
- **Creature/arc:** the same principle — each type's required set includes the fields its CONSUMERS assume
  present (drive the required set from the SEAM LEDGER, SNG-232 — a field a reader assumes is a field the
  generator must produce).
- **Enforcement rides the EXISTING repair step:** `missingRequired` already re-asks; widen the `required` sets
  and the repair step now guarantees completeness. If generation can't fill a required field after repair, the
  mint FAILS LOUDLY (a logged gen-failure) rather than silently minting a hollow record. **A hollow birth is a
  bug, not a valid state.**

## §3 — Fix B: EVOLVES — content grows through play, doesn't freeze at birth
"It should also update and evolve the content" — an entity should ACCRETE from what happens to it:
- **NPCs deepen:** as the bond grows and the fiction reveals more, an NPC's interiority should UPDATE — a want
  fulfilled or betrayed, a fear realized, a new drive surfaced. The GM already emits `npcUpdates` (learned,
  statusNote, relationshipDelta); EXTEND it to evolve `wants`/`fears`/`disposition` when the fiction earns it
  (a mentor becomes a rival; a want is satisfied and a new one takes its place). SNG-233's interiority is the
  SEED; play is the growth.
- **Items already evolve** (`itemUpdates`, SNG — the Deathbound spear precedent): a thing grows a truer name,
  provenance, new uses through the story. Generalize that PATTERN to NPCs and places.
- **Places accrete:** `placeUpdates` already records durable change (SNG-15B place memory) — ensure a generated
  place's DESCRIPTION and character evolve too (a warded threshold becomes a known staging point becomes a
  small camp), not just its flags.
- **The principle:** born-with-a-seed + grows-through-play. A generated NPC met once is a sketch; met ten times,
  betrayed once, and reconciled, it should be a PERSON the record has thickened. The evolution ops mostly EXIST
  (npcUpdates/itemUpdates/placeUpdates) — this widens them to carry INTERIORITY growth and makes evolution a
  first-class expectation, not an occasional flavor emit.

## §4 — Why this is the keystone for "living world"
SNG-233 hand-authored interiority for 7 existing NPCs. But hand-authoring every NPC forever doesn't scale —
the GENERATOR mints most of the world. If the generator births whole (§2) and the world evolves what's born
(§3), then every NPC/place is driven and deepening WITHOUT hand-authoring each one. This is what makes SNG-233
general instead of a one-time patch: Pell and Veth got fixed by hand; every FUTURE Pell gets born right and
grows on its own. It also closes the SNG-232 null-field seam family at the SOURCE (the generator can't emit a
null a reader assumes, because the field is required + repaired).

## OWNERSHIP
- CCode: §2 widen the gen `required` sets (NPC interiority, location null-field family, driven from the seam
  ledger) + make a post-repair still-missing field a LOUD mint-failure; §3 extend npcUpdates/placeUpdates to
  evolve interiority/description, make evolution first-class. Engine.
- Aevi: the TEMPLATE CONTENT — author the generation TEMPLATE/exemplars each type generates toward (a
  "what a complete NPC looks like" reference with rich wants/fears, a complete-location exemplar), so the
  generator has a high-quality target, not just a required-fields list. And the interiority-evolution TONE
  (how a want deepens). My lane; flag when CCode's required-set shape is fixed.
- Erik: how much interiority a MINOR generated NPC needs (full vs. light template) — the passing-farmer case.

## GUARDS
- **Born whole, but scaled to role** — a recurring nameable NPC gets full interiority; a one-beat crowd figure
  gets a light template (don't burn generation authoring a farmer who says one line). Gate by stable-id.
- **A hollow birth is a BUG** — after the repair step, a still-missing required field FAILS the mint loudly;
  never silently mint a partial record (that's how Pell got born empty). Loud-fail > silent-hollow.
- **Evolution is earned, not drift** — an NPC's wants change when the FICTION earns it (a betrayal, a
  fulfilment), never randomly. Same discipline as bondStage: a real beat moves it, not time alone.
- **Don't overwrite hand-authored interiority** — where Aevi (or a content file) authored an NPC's drives, the
  generator/evolution AUGMENTS, never clobbers. Hand-authored is a floor.
- **Required set driven by the seam ledger** — a field becomes required BECAUSE a consumer assumes it (SNG-232);
  don't require fields nothing reads (bloat). The seam ledger IS the required-field justification.

## OPEN QUESTIONS — CCODE ROUND 2
1. §2 — full-vs-light template gate: by stable-id (nameable→full, anonymous→light), or by an explicit
   generateRequest flag (the GM says "this one matters")? Lean: stable-id, with a GM override flag.
2. §3 — interiority evolution: a new `npcUpdates` sub-op (evolveInteriority) vs. reuse `learned`/`note` and
   have the GM-context builder re-derive drives? Lean: explicit sub-op so the drive-change is durable + auditable.
3. §2 — when generation genuinely CAN'T fill a required field (model refusal/timeout), is a loud-fail-and-skip
   right, or a minimal-valid-default + a flag to backfill later? Lean: default + backfill-flag for non-critical
   fields, loud-fail for the ones a reader will crash on (dangerLevel, worldPos).

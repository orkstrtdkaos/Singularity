# SNG-232 Phase 2 — Aevi's 11-seam ledger, compiled + gating

**CCode · 2026-07-24 · `8f022ea7` · tooling-only, all three suites green. SNG-232 now COMPLETE.** *Aevi authored the seam ledger (11 real producer→consumer contracts) as prose + checkHints; CCode's job (per §OWNERSHIP) was to compile each into a machine-checkable seam the auditor runs.*

## Done

- **13 seams live** in `tests/seams.json` (schemaVersion 2): Aevi's 11 + my CCODE-19/CCODE-20. Kinds adopt her taxonomy (`field_presence` / `field_shape` / `cross_source` / `enum_vocab`).
- **3 new check modes** added to `runSeam`, one per shape her seams needed beyond a region scan:
  - **content** — every JSON record in a dir carries required fields (`worldPos.colatitude` non-null, `axisVector[12]` array-len). worldPos/axisVector now caught at BUILD, not late at runtime (her SNG-180 "catch earlier" ask).
  - **corpus** — scan many files at once for a whole-of-engine forbids (the aspirations top-level-path guard).
  - **coveredBy** — the seam is gated by another mature check; assert its signature is still present, so a *deleted* covering gate turns the seam red. poleIntensity→content_ci schema; bestiary→SNG-065 provides-loader; op-vocab→wiring_audit contract↔salvage parity. The seam is never silently un-gated.
- **Every seam proven falsifiable** (anti-theater): the region self-test, plus a live red-on-break for the two new modes — broke a content requireField (all 96 locations flagged) and a coveredBy signature ("no longer gated anywhere"), reverted to green.

## A real bug the integration surfaced

`sliceRegion` grabbed the first `{` after a function name — but for a signature with default/destructured params (`catalog = {}`, `{ at = null } = {}`) that's a PARAM brace, so `registerDiscoveryAbility`/`personDestination` sliced to empty and their seams false-failed. Fixed: balance the parameter parens first, then take the body brace. Robust for every future region seam.

## Mapping (Aevi's ledger → check)

| Aevi seam | mode | check |
|---|---|---|
| gen_location_dangerLevel (225) | region | `dangerOf` requires DANGER_FLOOR |
| gen_location_worldPos (180) | content | valley/locations all have worldPos+axisVector[12] |
| gen_marker_shape (216) | region | reconcile has `gen-tracking-object` normalizer |
| poleIntensity_shape (216) | coveredBy | content_ci schema check present |
| encounter_offer_source (231) | region | `listAvailableEncounters` reads `eligibleEncountersFor` |
| discovery_usable (226) | region | `registerDiscoveryAbility` writes abilities[]+customAbilities |
| bestiary_loaded (229) | coveredBy | content_ci SNG-065 provides-loader check present |
| travelTo_is_place (228) | region | `personDestination` cross-checks npcRegistry |
| aspirations_path | corpus | no top-level `character.aspirations` read |
| op_vocab_triples (190) | coveredBy | wiring_audit contract↔salvage parity present |
| traditionId_vocab (179) | region | app.js has `_opVocabMisses` + `traditionIndex` |

## Note for Aevi

Two of your seams are documentation-of-an-existing-gate (poleIntensity, bestiary_loaded) — I wired them as `coveredBy` so they gate that the covering check still EXISTS (delete SNG-065 → the seam goes red), rather than duplicating it. op-vocab is `coveredBy` the contract↔salvage parity check (the documented↔salvageable legs); the third leg (handler-set) + runtime emission stay with See-the-Machine — if you want the handler-set made a hard build gate too, say so and I'll add the set-extraction (the one kind that needs new code, not a new entry). Everything else is a real region/content/corpus check that reads your named producer/consumer.

*— CCode. The maintainer engine now knows its blind spot AND the eleven specific places it drifted. status: complete_pending_review.*

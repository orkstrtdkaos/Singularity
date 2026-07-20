# SNG-192 Phase B — Robustness readouts: coverage, common ground, braids

**CCode · 2026-07-20 · v1.8.178 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

The "robust" half of creation (§5 + §6b + §6c): what a build can and cannot DO, and where the WHOLE kit
works — surfaced at the moment of the pick, never blocked.

---

## ⚠ The `gains` verification (owed from Phase A) — Aevi's premise was wrong

Before wiring `gains` into coverage per the G1 ruling, I verified the values, as promised. **`gains` has
exactly TWO distinct values across all 779 rank-nodes: `broaden` (550) and `deepen` (229).** That is a
rank-**progression** axis — does this rank *widen* the craft's scope or *deepen* its power — **not** the
24-verb function vocabulary. Aevi's ruling ("gains looks like the 24-verb vocabulary applied at rank level…
exactly the data §5's coverage check needs") was inferred from the one-word sample `"broaden"` — the same
partial-read shape Aevi flagged three times in the audit ruling.

**So `gains` is NOT coverage data and is NOT wired to coverage.** §5 coverage uses `ability.functions` (the
real per-ability verb array) via the existing `functionCoverage`. `gains` remains a low-value field (a
binary broaden/deepen tag); if it ever earns a consumer it would be a skill-wheel rank-progression display,
not coverage — **PO's call.** This is the third wrong-premise the verify-before-build discipline has caught
this batch (after `reactsToReputation`'s heterogeneous keys and the firing-panel correction).

## §6b — the power-source common-ground window ⭐ the novel engine, and it COMPUTES

`commonGroundFor(traditions, data)` (substrate.js, pure) intersects the substrate bands of a build's
traditions into the density window where the **whole kit** works. Verified against the spec's own table on
live content:

- **ashwarden + rootkin + somatic** (all natural) → **[0.00, 0.56]** — a wide shared thin-country window. ✓
- **ashwarden + enginewright** (natural + lattice) → **NONE.** The intersection is empty: `lo 0.77 > hi 0.73`.
  Erik's warning case is not "suboptimal" — *there is no ground where both halves work*, and the engine says
  so exactly, at the pick, instead of the player discovering it at level 8. ✓

`groundAsPlace(window)` names the window as a **place, not a number** — thin / middle / dense country,
"where this character belongs," which is worth more to a player than any stat. A null window has no place —
that absence *is* the warning.

## §5 — coverage, in plain words

The ability step renders, live as you pick: *"You can ◆ harm · ◯ know · ▸ move. No way to restore, protect
— a real choice, not a mistake."* via the existing `functionCoverage` over the build (grants + picks). **No
blocking** — a character with a gap is legitimate; it must be a choice, not a discovery in front of a boar.

## §6c — braids: coherence is efficiency, divergence is generativity

The readout frames the build honestly, driven by the §6b window width:
- **Coherent** (wide window): *"strong in its own country. Coherence makes you strong here; divergence makes
  you new."*
- **Divergent** (narrow/empty window): *"weaker in any one country, and exactly where new craft comes from.
  Off-source picks are seeds; the game will offer braids you never planned. Divergence makes you new."*

**Divergence is never shown as a penalty** (§7.6) — it is a different bet: less power now, more possibility
later. §6b's numbers and §6c's framing ship together, as the spec required.

## Invariants held (§7)
- Coverage gaps and the no-common-ground case **surfaced, never blocked** (§7.4). ✓
- **Divergence never shown as a mistake** — the numbers (§6b) and the framing (§6c) ship together (§7.6). ✓

## Verification
- **9 tests**: `commonGroundFor` against the spec's table (the empty natural+lattice case, the coherent
  all-natural window, the untuned/folk case), `groundAsPlace` (thin/middle/dense/null), and the readout
  wiring (coverage + common ground + the warning + the coherence/divergence framing). Full suite **EXIT=0**;
  wiring audit + ENGINE_MAP (59/59) ok; ratchets flat.
- **Browser:** same creation-flow leg as Phase A — the engine (`commonGroundFor`) matches the spec's table
  exactly and the UI is source-verified; the gated creation **visual** is Erik's real-save test on a fresh
  load (the known stale-module cache makes the preview boot-watchdog fire, self-healing via Reload-fresh).

## Boundaries / next
- **`gains` is NOT wired** (premise wrong — see above). If the PO still wants a broaden/deepen surface, that
  is a separate, small skill-wheel ticket, not coverage.
- **Ordering the pool by source fit** (§6b's "natural crafts first, lattice folded with the reason") is a
  refinement I did NOT do — the readout tells the player the truth about the whole build; per-craft source
  reordering of the pool is a further pass if Erik wants it.
- **Phase C** (the archetype picker + loading the orphaned `class_archetypes.json`) is the last SNG-192 phase.

*— CCode. The build now tells you what it can't do before you're surprised by it, and where it belongs —
and when two crafts share no ground anywhere, it says so at the pick, not at level 8 in front of a boar.*

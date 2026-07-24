# SNG-226 — a discovery becomes a USABLE craft (Marrow's Wings can be cast now)

**CCode · 2026-07-23 · v1.8.236 (`6b0a36c4`) · suite + wiring-audit green · content loads intact, clean boot.**
`status: complete_pending_review`

Your bug, exactly: you told the GM to *"let your Marrow's Wings emerge and fly"* and it refused — *"Character
has no ability named 'Marrow's Wings.'"* You earned the craft and the game wouldn't let you wield it.

## Root cause (as the spec diagnosed)
`recordDiscovery` pushes to `discoveries[]` and stops — a recorded FACT, no usable CAPABILITY. Every system
that reads `abilities[]` (the intent-parser, the skill wheel, the roll resolver) is blind to it. Marrow's
Wings sat in `discoveries[]`, never `abilities[]`, so the parser checked the list, didn't find it, and
correctly returned `feasible:false`.

## The fix — register the discovery LIKE a braid
`braids.js` → **`registerDiscoveryAbility(character, discovery, catalog)`** (GUARD: reuse the braid
machinery, don't invent a parallel "discovered ability" type):
- **2 distinct parents resolve →** `buildBraidDef` (the richest def: unioned functions, a tree, cost,
  tradition). **Else →** a minimal braid-shaped fallback from the discovery's own name + description (never a
  dead reward).
- **Parents are deduped** (a 3-parent discovery with a repeat — "You Shall Not Pass" = boundary_stone ×2 +
  the_shielding_word — collapses to 2) and **id-drift-tolerant** (Marrow's Wings' parent `the-attended-end`
  is hyphenated and lives in `customAbilities`; `the_shadow_work` is content — both resolve).
- Registers into **`abilities[]`** (rank 1, deepens through use — the discovery IS the earning) +
  **`customAbilities`** (so `fullCatalog()` resolves it) + the **braids** provenance ledger.
- **Idempotent:** skips a discovery already usable, or one whose pairing was already braided (it's castable
  via that braid — e.g. Resonant Sight → its `braid_prism_sight_sonic_resonance`).

**Wired at two sites (`app.js`):**
- **Mint-time** — after `recordDiscovery`, so a new discovery arrives *usable and celebrated* together (§5
  with the SNG-222 moment). Narration now reads "*it's yours now, ready to use.*"
- **Load backfill** — in `migrate()` (the load-heal path), any discovery not yet in `abilities[]` is
  registered. Marrow's Wings heals the moment you next play Silas — sitting right beside the SNG-222 moment
  backfill in the same function.

**§3 is automatic:** the parser builds "Character abilities:" from `abilities[]`, so once Marrow's Wings is
there, "let it emerge" resolves to `abilityId: marrow-s-wings` instead of `feasible:false`. **Fixing the
registration fixes the parser, the wheel, and the resolver at once — they all read the one list.**

The discovery record is KEPT — `discoveries[]` stays the moment/codex source; the fix ADDS the ability.

## ROUND 2 — answered
- **Q1 (buildBraidDef vs adapter):** both — `buildBraidDef` when 2 parents resolve, a minimal fallback
  otherwise (a missing/hyphen-drifted parent or a >2-parent discovery).
- **Q2 (cost/family derivation):** automatic, from the parents at mint (union functions; cost = pricier
  parent + 2, clamped). Better for a generative system than per-mint authoring.
- **Q3 (backfill scope):** general — *any* discovery not in `abilities[]`, not just Marrow's Wings (other
  saves may carry silent-unusable discoveries).
- **Q4 (immediately usable vs practice-once):** immediately usable — the discovery is the earning; gating it
  again would blunt the reward you just felt.

## Aevi (flagged, optional)
If discoveries want a **standard function-family/cost derivation rule** (so every future discovery gets a
tuned usable shape — e.g. "flight → MOVE at the pricier parent's cost" — without per-mint authoring), that's
yours to author. The current derivation is sane but generic (it unions the parents' functions; it doesn't
infer "flight → MOVE" from the description). Not blocking — the craft is usable today.

## Honest bound
Unit-proven (8 checks: 2-parent register, customAbilities-resolvable, idempotent, 3-parent dedup,
already-braided skip, single-parent fallback, both wirings) + **code-confirmed on the `migrate()` Play path**
(the 226 backfill sits beside your verified 222 moment backfill in the same load heal; the roster **Play**
button runs `migrate` at app.js:1369). The dev-test character bypasses `migrate()` (a harness shortcut), so
the **live end-to-end — Marrow's Wings castable after you next click Play on Silas — is your Tier-2 confirm**.
Next play, tell the GM to let the Wings emerge; it should resolve to the craft, not refuse it.

*— CCode. A discovery was a diary entry the parser then refused. Now it lands in the one list every reader
trusts, braid-shaped and rank-1, usable the moment it's found — and Marrow's Wings backfills into your kit the
next time you open Silas. The earning finally comes with the wings.*

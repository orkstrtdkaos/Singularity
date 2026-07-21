# SNG-196 — The generative braid engine (co-activation earns a real, minted craft)

**CCode · 2026-07-20 · v1.8.180 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

Erik-directed, from the live diagnostic on Silas: **40 co-activations across 24 pairings, 0 braids** — because
a braid *required* an authored recipe and only 3 existed, none touching the crafts he plays. The co-activation
ledger faithfully filled a store nothing consumed. This ship makes the core **generative**: no recipe needed.

---

## What shipped — `engine/braids.js` (pure) + the Silas backfill

- **`mintableBraidsFor(character, {catalog, threshold})`** — the pairings a character has EARNED the right to
  braid: co-activated at least `BRAID_RIPEN_AT` (5) times, **both crafts still held**, not already braided.
  **No authored recipe required** — that absence was the whole gap.
- **`braidTier(character, components, catalog)`** — the braid's tier + learn-gate, **scaled to POWER**: the
  deeper parent's rank sets the ceiling. Two mastered crafts braid into a capstone; two basics, a modest craft.
- **`buildBraidDef(...)`** — a **FULL-schema ability**: id, name, tradition, levelReq, the **union** of both
  parents' functions, the **harsher** parent's harm rung, and a `tier`-deep rank tree. Takes an optional
  model-authored override (name + tree + description); the stub it falls back to is *itself a valid, playable
  craft*, so a mint never halts on a bad model reply.
- **`mintBraid(...)`** — mints into `character.customAbilities` (so `fullCatalog()` resolves it everywhere —
  rank-up, coverage, the skill wheel — with zero special-casing), adds a held-ability entry, and records a
  `braids` provenance row. Idempotent by the pairing.
- **Naming (Erik's ask):** the game suggests a name (auto from the parents, or the model's), **and the player
  can override** — `minted.namedBy` tracks `auto | gm | player`.
- **reconcile v14 — the backfill:** mints the braids a save has ALREADY earned, on load. Idempotent (never
  double-mints on a later login).

## Verified on Silas's real save
Running the engine over `char-mrhs8286.json` mints exactly the two braids he's earned:
- **`order_sense + palework`** (6×, tier 3) — a full-schema craft, 3-rank tree, functions `reveal/foresee/hinder/strike`.
- **`deathsense + order_sense`** (5×, tier 3) — **the Double Register** you named as canon.

On his next load, reconcile v14 mints both into his sheet (as playable stubs he can rename + the model can enrich).

## A finding worth recording (the same verify-before-build shape)
While building, the corpus check confirmed the gap precisely: **only 3 emergence combo recipes + 6 combination
abilities exist, all prose-only (none engine-triggerable), and the "Double Register" is NOT in the abilities
corpus** — despite a spec claiming it "was authored back into content." The generative engine is the right fix:
it stops requiring authored content for every possible braid.

## Verification
- **16 tests**: `mintableBraidsFor` (generative detection, both-held, threshold, already-braided), `braidTier`
  (power scaling), `buildBraidDef` (full schema, function union, harsher rung, player-name-wins, model-authored
  override), `mintBraid` (adds everywhere + idempotent), and the reconcile v14 backfill (mints + idempotent).
- Full suite **EXIT=0**; wiring audit + ENGINE_MAP (60/60) ok; SYSTEM_SPEC count 59→60 + module row; ratchets flat.

## This is a FOUNDATION ship — what remains
1. **Rich content (the model authors the braid):** a `"braid"` type in `generate.js` so the tree/description/
   name are model-authored (`buildBraidDef` already accepts the override) — turns the playable stub into a fully
   *written* skill.
2. **Live-play minting:** the offer → accept → name → generate → mint flow in play (so NEW braids happen at the
   table, not only on backfill) — the same engine-computed-offer pattern as SNG-194.
3. **Pell's `ironsense` — the NPC-skill path:** she's more than a normal NPC now; `ironsense` lives only as prose
   (22 mentions). The same mint path, aimed at an NPC's `kit`, gives her a real defined skill.

*— CCode. The ledger that quietly counted every time you ran two crafts together is no longer counting into a
void: run them together enough, and the braid becomes a craft on your sheet, yours to name.*

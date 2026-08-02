# AUDIT — "the content promises what the engine never reads" bug class (SNG-261 §B sweep)
## Aevi (PO) · 2026-08-02 · Erik: "what other backgrounds have a similar bug? use this as a bug type"

## The bug type, named
**PromisedButUnread:** authored content DESCRIBES a mechanical capability, and nothing in the engine READS the
field (or the fiction-flag) that would deliver it. The player is told they have something they do not have.
Found on `precursor_marked` (gmHint promised "Address-Sense comes unbidden"; `precursorAccess` stayed `[]`
because `seedInnateSubstrate` keys off `origin` and the marking lives in `background`).

## The sweep (five passes, whole rules layer)
**1. Background field surface.** All 40 records carry only: id/name/category/description/gmHint/affinity/
grantsAptitudes (+ the innatePrecursor/accessNote I just added). Engine reads: `affinity` (13 refs),
`grantsAptitudes` (2 refs — and **properly APPLIED** at app.js:3303 via `grantAptitudes` at creation),
`category`, `description`. `gmHint` is prose for the GM (0 engine refs — correct, it's narrative guidance).
**No orphaned capability field on any other background.**

**2. Capability-shaped fields across the WHOLE rules layer** (grants*/innate*/access*/unlock*/seed*/bonus*/
confers*/provides*/enables*/opens*): 20 such fields; **16 are read by the engine.** The 4 non-reads are all
benign: `accessNote` (documentation I authored), `openQuestion` (a design note in skill_battle_system),
`openSlots` (PROSE in schools.json — "deliberately incomplete… room, not gaps"), `openByDefault` (one unused
sub-key of `collapsedMoves`, which IS consumed at app.js:2613/10054). **No second capability orphan.**

**3. Prose-promise test on backgrounds** — does the description/gmHint NAME a real capability? 3 hits:
- `precursor_marked` — named **Address-Sense** explicitly → THE BUG (fixed).
- `survivalist` ("always knows the exits, the water") — GM roleplay guidance, not a named craft. Fine.
- `lineage_taught` ("carries the family's reputation") — a social hook; standing IS handled by
  `seedStandingAtCreation` at creation. Fine.
**Only one background ever named an actual ability.**

**4. Same test on ORIGINS** — 3 flags, all FALSE POSITIVES (prose uses the words "radiance"/"descent"/"ascent"
naturally; they collide with ability ids). **Reverse check clean: every seeded id (`innatePrecursor`,
`innateLivingCurrent`, `wildCurrent`) exists in the catalog with a valid powerSystem — no broken seeds.**

**5. The sibling fiction-gated systems.** living_current and wild_current unlock the same way as precursor:
  - innatePrecursor → origins abyssal, seraphic + **background precursor_marked** (the fix)
  - innateLivingCurrent → origin rootkin only
  - wildCurrent → origins churnfolk, abyssal only
**No background is the fiction-marking for living/wild current** — and that's CORRECT: those are about what
people you're FROM (origin), not a mark you acquire. **Precursor was the ONLY system with a background-based
marking, which is exactly why it was the only one to fall through origin-keyed seeding.** The bug was unique,
not systemic.

## Conclusion
**The bug class exists but has exactly one instance, and it is fixed** (content half authored; CCode's half is
the one-line background seeding call). The rules layer is otherwise well-wired: capability fields are read,
seeds validate, and prose-only fields are prose by design.

## The GUARD (so it can't recur) — recommended to CCode
A content-CI check for the PromisedButUnread class, in two cheap parts:
1. **Seed validity (already implicit, make it explicit):** every id in `innatePrecursor`/`innateLivingCurrent`/
   `wildCurrent` on ANY record must exist in the catalog with the matching `powerSystem`. (Passes today —
   baseline it so a typo can never create silent false access.)
2. **Reachability:** every record carrying an innate-access key must be reachable by the seeder — i.e. the
   engine must actually call `seedInnateSubstrate` with that record TYPE. Today: origin ✅, background ❌ (until
   CCode's fix). This is the check that would have caught the precursor bug the day it was authored: a record
   that carries access nobody reads should FAIL CI.
Same shape as the inert-pair and registered-but-unloaded ratchets — the recurring lesson of this session is that
a system nobody exercises is a system that silently doesn't work.

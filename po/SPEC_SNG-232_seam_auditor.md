# SPEC — SNG-232: The Seam Auditor — extend the maintainer engine to catch SEAM failures
## Aevi (PO) · 2026-07-22 · Erik-directed (a maintainer engine that checks updates against how the game works)

> **Erik:** "This is complex code. Would it make sense to build a maintainer engine that keeps everything
> wired properly and checks new updates against how the game works?"

## §1 — The honest finding: a maintainer engine LARGELY EXISTS. The gap is a SPECIFIC bug class.
Verified at origin. The integrity layer is already substantial:
- **`wiring_audit.mjs`** (33KB) — THE maintainer engine Erik describes: "every capability declares the path a
  player reaches it; verify the declared registry against the code." Even watches its OWN escape hatch
  (`registry:internal` marker) because a ratchet-with-a-lever gets pulled under pressure. Mature.
- **`content_ci.mjs`** (37KB) — content-schema gate (caught every one of Aevi's content mistakes this session —
  the system WORKING).
- **`smoke.mjs`** (740KB), `skill_battle_sim`, `balance_sim`, `parse_probe`, `live_gm` — behavioral + sim suites.
- **See-the-Machine (SNG-179/190)** — RUNTIME integrity: "a built op the model never reaches" detector,
  op-emission counts, vocab-miss capture.
So Erik ALREADY has a maintainer engine. Recommending "build one" would duplicate mature tooling. The real
question: what class of bug still SLIPS THROUGH all of it?

## §2 — What slips through: SEAM failures (the bug class of ~80% of THIS session)
Every wiring_audit + content_ci check answers "is each thing WIRED and SCHEMA-VALID?" — brilliantly. Today's
bugs ALL PASSED those gates and were a DIFFERENT class: **two systems each individually valid that don't AGREE
about the same data.** The seam between them fails.
- **SNG-216** — generated locations mint `_gen: true` (boolean); a reader expects `_gen: {}` (object). Both
  ends valid; they disagree on the shape. → crash.
- **SNG-225 / 226 / 228 / 231** — the pool fires HERE, the GM reads THERE; the discovery records HERE, the
  ability-list reads THERE; travelTo is set HERE, the person-check is absent THERE; the encounter offer reads
  `encounterSeeds`, the pool lives in the table. Each end valid; the SEAM doesn't connect.
- **The null-field family** (dangerLevel/worldPos/axisVector null) — the writer omits a field the reader
  ASSUMES present. No schema catches it because null is "valid"; the SEAM assumption is unstated.
**None of these are orphan-exports or schema fails. They're SEAM-CONTRACT failures** — an unstated agreement
between a producer and a consumer that drifted. That's the gap in the maintainer engine.

## §3 — The proposal: a SEAM AUDITOR (extend wiring_audit, don't replace it)
Add a seam-contract layer to the EXISTING maintainer engine. A "seam" = a place where system A writes data
that system B reads. Each declared seam asserts the CONTRACT both ends must honor:
- **Field-shape seams:** where a producer writes a field and a consumer reads it, assert they agree on
  TYPE/SHAPE. (`_gen` is boolean-or-object → the reader's guard must handle both; a location writer that omits
  `dangerLevel` → the reader must floor it, or the writer must fill it. The auditor flags a reader that
  assumes a field a producer can omit.)
- **Cross-system-reference seams:** where system B reads ids/records that system A produces, assert the SOURCE
  is the one B expects. (The GM-offer path reads `encounterSeeds` but the POOL is the intended source →
  SNG-231; the intent-parser reads `abilities[]` but discoveries land in `discoveries[]` → SNG-226. The
  auditor flags a consumer reading a source that a related producer doesn't feed.)
- **Enum/vocab seams:** the model-facing op vocab vs. the handler set vs. the prompt contract must be the SAME
  set (See-the-Machine already surfaces emission; the auditor makes "documented op with no handler" or
  "handler with no prompt-doc" a BUILD failure, not a runtime discovery).

## §4 — How it stays cheap + real (not a boil-the-ocean rewrite)
- **Declared seams, not inferred.** Like wiring_audit's registry: a `seams.json` (or inline `// @seam`
  annotations) DECLARES each known producer→consumer contract. The auditor checks the declared seams; it does
  NOT try to discover all seams magically (that's undecidable + noisy). Start with the seams that BROKE this
  session — the null-field family, the encounter sources, the discovery/ability path, the op vocab. ~10 seams
  covers most of today.
- **Grows by incident.** Every future seam bug adds ONE seam declaration + its check — so the auditor learns
  the game's actual failure modes over time. A bug caught once becomes a bug caught forever. (This is the
  ratchet philosophy wiring_audit already uses, applied to seams.)
- **Runs in the same gate.** It's a new section of the wiring_audit/CI chain, not a new tool to remember — the
  build already fails on wiring; now it also fails on a broken seam contract.

## §5 — Why this is the right shape (and what it is NOT)
- It is NOT "build a maintainer engine" — one exists. It's "teach the existing maintainer the ONE class of bug
  it's blind to."
- It targets the VERIFIED highest-frequency failure (seam disagreement = most of this session's tickets).
- It's incremental + declared, so it can't become a noisy undecidable mess. Ten declared seams that broke this
  week, each a build gate.
- The deepest value: it moves the "generated content skips a field the reader needs" family from "found in
  live play by Erik" to "caught at build." That family alone (216/225/231 + the null-field trio) was a huge
  share of today.

## OWNERSHIP
- CCode: the seam-auditor section in wiring_audit.mjs + the `seams.json` declaration format + the first ~10
  seam checks (the ones that broke this session). Engine/tooling.
- Aevi (PO): author the SEAM LEDGER — enumerate the producer→consumer contracts from this session's tickets
  (the null-field family, encounter-source seams, discovery/ability, op-vocab) as the first declared seams, so
  CCode implements checks against a real list. This is PO/spec work, my lane; flag when CCode's format is set.

## GUARDS
- **Declared, not inferred** — the auditor checks DECLARED seams only; no magic whole-codebase seam discovery
  (undecidable, noisy, would rot). The registry philosophy: declare the contract, gate on it.
- **Grows by incident, never speculative** — add a seam when a seam BREAKS (or is knowingly load-bearing), not
  a pre-emptive audit of every data handoff. Ten real seams > a hundred theoretical ones.
- **Extends, does not replace** — this is a wiring_audit SECTION; do NOT build a parallel tool. One gate.
- **A seam check that can't fail is theater** — each declared seam must have a way to actually go red (a real
  producer/consumer pair it reads), or it's a comment pretending to be a test (the `registry:internal` lesson).

## OPEN QUESTIONS — CCODE ROUND 2
1. Declaration format: a `tests/seams.json` (data) vs. inline `// @seam producer→consumer: contract`
   annotations at the code sites (co-located, harder to drift)? Inline is closer to the code but harder to
   enumerate; JSON is auditable in one place. Lean JSON with a code-site backref.
2. Field-shape seams: can the auditor statically read a producer's written shape + a consumer's assumed shape
   (AST/regex on the field access), or does it need runtime samples (a fixture save)? Static for type/presence;
   a fixture for value-range.
3. Sequence: does the seam-auditor depend on the seam LEDGER (Aevi) existing first? Yes — CCode builds the
   mechanism against ~3 example seams, Aevi authors the full ledger from the session's tickets, then the checks
   fill in. Parallel-ish.

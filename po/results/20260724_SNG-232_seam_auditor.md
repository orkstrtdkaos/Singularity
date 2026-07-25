# SNG-232 Phase 1 — The Seam Auditor (mechanism + 3 seams; ledger is Aevi's)

**CCode · 2026-07-24 · `3661fe1a` · tooling-only, all three suites green.** *Aevi's spec: a maintainer engine largely EXISTS; the gap is the SEAM-contract bug class (two valid systems that disagree about the same data — ~80% of this session). Build a seam-auditor SECTION of wiring_audit + the `seams.json` format + the first checks. OQ3: CCode builds the mechanism against ~3 example seams, Aevi authors the full ledger.*

## Shipped (my lane, per §OWNERSHIP + OQ3)

- **`tests/seams.json`** — the declaration format. A seam = a producer writes data a consumer reads under an unstated contract. Entry shape: `id · incident · kind (field-shape | cross-ref | enum-parity) · contract · producer{file,note} · consumer{file,region?} · assert{requires[],forbids?[]} · canFail`. Fully self-documenting `_doc` header carries the discipline (declared-not-inferred, grows-by-incident, anti-theater).
- **`tests/wiring_audit.mjs` §5 `runSeam`** — loads the ledger, scopes to the consumer region (brace-balanced `sliceRegion`, or whole-file when the patterns are unique), asserts the contract via static regex, and reports through the existing `check()`/exit gate. **One gate, not a parallel tool** (GUARD honored).
- **3 real, falsifiable seams** — each BROKE this session:
  - `danger-level-null-floor` (SNG-225, field-shape) — `dangerOf` must floor a missing `dangerLevel` (`DANGER_FLOOR`), never null→0.
  - `encounter-offer-reads-pool` (SNG-231, cross-ref) — `listAvailableEncounters` must read `eligibleEncountersFor`, not seeds-only.
  - `new-encounter-engage-reachable` (CCODE-19, cross-ref) — `applyTurn` must inject an engage choice for a GM-invented encounter (registering the def ≠ starting the fight).

## Anti-theater — proven, not asserted

The spec's core GUARD: *"a seam check that cannot fail is theater."* Three teeth:
1. **The matcher self-tests** it goes RED on a missing-required pattern and GREEN on a present one, *before* any real seam is trusted (a printed `ok` line, run every build).
2. **A stale/renamed consumer region FAILS loud** — a seam pointing at a function that no longer exists reports red, never a vacuous green.
3. **PROVEN by breaking a real seam:** I `sed`-broke the CCODE-19 seam's contract in `app.js` → `FAIL — missing required: encounterId: nd.id`, then reverted → green. The gate bites real code.

Plus `smoke.mjs` **guards-the-guard** (the section, its self-test, and the ledger must all remain present + well-formed) — durability is the entire point of SNG-232, so silent deletion of the section is itself a build failure.

## Round-2 OQ answers (format is SET — author against this)

- **OQ1 (declaration format):** `tests/seams.json` (data) with code-site backrefs — your lean, agreed. Auditable in one place; inline `// @seam` annotations drift and can't be enumerated. `producer`/`consumer` carry `{file}` (+ optional `region`) backrefs.
- **OQ2 (static vs runtime):** **static** regex for type/presence (implemented). Value-range checks that need a fixture save are deferred — declare them later with a `fixture` field once a range seam actually breaks.
- **OQ3 (sequence):** mechanism built against 3 example seams (done); **your ledger fills in the rest.** Add a seam by appending one object to `seams.json` — no code change needed unless a new *kind* is introduced.

## For Aevi — author the ledger (§OWNERSHIP, your lane)

Enumerate the session's remaining producer→consumer contracts as `seams.json` entries. Highest-value candidates:
- **The `_gen` boolean-vs-object seam (SNG-216)** — I deliberately did NOT ship this: the codebase has dozens of *legitimate* raw `_gen.prop` accesses on always-object entities (art/canon/chronicle/generate), so a blanket scan is noise. It needs the PRECISE producer/consumer pair where the shape disagreed — you know the SNG-216 site. Declare it as a scoped `field-shape` seam (consumer `region` + a `forbids` on the unguarded access).
- **The null-field family beyond dangerLevel** — `worldPos`, `axisVector` (SNG-216-adjacent): same shape as `danger-level-null-floor` — a consumer that assumes a field a producer can omit.
- **discovery→ability (SNG-226)** — the intent-parser reads `abilities[]`; a discovery must register there, not only in `discoveries[]`. A `cross-ref` seam on the parser's ability source.
- **op-vocab enum-parity** — the `enum-parity` kind is scaffolded in the format but has no example yet; if you want it, declare the documented-op-set ↔ handler-set contract and I'll add the set-extraction logic for that kind (the one kind that needs new code, not just a new entry).

## Verified

All three suites green (smoke +3 SNG-232 guards / wiring_audit +5 seam checks incl. the self-test / content_ci). Falsifiability demonstrated live (CCODE-19 seam red-on-break, green-on-revert). No app change, no version bump.

*— CCode. The maintainer engine now sees its blind spot; the ledger grows by incident from here. status: complete_pending_review.*

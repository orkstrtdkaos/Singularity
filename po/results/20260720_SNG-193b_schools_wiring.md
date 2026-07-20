# SNG-193b — Schools wiring: band resolution reads the SCHOOL

**CCode · 2026-07-20 · v1.8.172 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

Reads with `po/SPEC_SNG-193b_schools_wiring.md` and `SPEC_SNG-193_schools.md`. Content was already at
HEAD (67 schools, 24 traditions, 19 marked affinities); this is the engine that makes it fire.

---

## The load-bearing thing (§3.3), and it holds at ONE seam

**A tradition is a root; a school is what it reaches WITH — and the reach sets the substrate band.** Two
practitioners of one tradition, in different schools, now get **opposite best-grounds**: the Reaching Mind
(inherent extension) is full in thin, still ground and impaired in dense machine-country; the Instrumented
(lattice extension) is the exact reverse. That is the whole feature, and it lives at the single seam §5 Q1
asked about — `substrateVerdict → bandForSchool` in `engine/substrate.js`. **There was no prerequisite
refactor** (`bandFor` is called in exactly one place; `bandForRenown` in recurrence.js is unrelated).

- `SOURCE_BAND` — a source's characteristic band: **material → a flat floor** (no band, never starved),
  inherent/natural → low centre (thin is best), lattice → high centre (dense is best), wild → widest.
- `bandForSchool(traditionId, school, data)` resolves the band from the school's **extension**. A pure
  school (extension null) or an unmodelled source falls through to the tradition's own authored band — so
  **an un-schooled save resolves byte-identically to before.**

## The floor is the root's (§4)

`substrateVerdict` now takes the tradition's `root`. A **material** root — or a **material-extension**
school — is never *starved*: `materialFloor` (0.7) holds the starved side up, so an augmented craft in
wrong ground **degrades toward its pure form rather than failing** (`side: "floored"`). A non-material
root has no floor unless a school supplies one — which is why *"the material school is the one that
travels."* Interference from abundance still applies; the floor only catches starvation.

- Tested end to end: a material-root lattice craft in thin ground floors at 0.7 and is never `off`; a
  material-extension school on an **inherent** root stays full at density 0.02; an inherent-root **lattice**
  school in that same dead-thin ground correctly starves toward zero (no floor to save it).

## The rest of §3

1. **Load (§3.1)** — `state.js` `loadRule("schools")` → `CONTENT.schools`. It's `kind: "rules"`; the L4
   wiring gate that exists *because a rules file shipped orphaned two days ago* now sees it reached. Its
   own test is green.
2. **`character.schools` (§3.2)** — a `{traditionId → schoolId}` map. Seeded per practised domain at
   creation (`defaultSchoolsForDomains`, to the pure/root school), backfilled onto old saves by **reconcile
   v13** (silent, idempotent — §5 Q3). The one validated write-seam is `setCharacterSchool`, which
   **refuses a school that isn't of that tradition** so a hallucinated id can never become a dead reference
   the band silently falls through.
3. **CI gate (§3.5)** — `smoke.mjs` walks every ability file: **all 19 `schoolAffinity` refs resolve to a
   school of their own tradition.** A bad affinity is invisible in a diff; now it fails the build.
4. **The GM knows the school (§3.6)** — `schoolsDetail` GM-context row names the current school per domain,
   what it's joined to, and its best-ground, and lists sibling schools. The GM describes the craft as *this
   school* does it, and knows what a teacher of that people would open.

## How a character actually GETS a non-pure school — the reachability question

The feature would be inert if every character were stuck on the pure default. The change-path is the
**`adoptSchool` GM op** — `{tradition, school}`, in `SALVAGEABLE_OPS` + the contract + a `turn.adoptSchool`
dispatch (the L5 op-wiring gate enforces all three). This is deliberate: schools.json's own canon is
*"changing is possible, hard, and a story,"* so a school change is a **story-earned** GM move (a teacher's
long training, a hard turning) — never a menu toggle. The GM block instructs it as such, and the op
validates through `setCharacterSchool`, so the model cannot corrupt the map.

## Answers to §5

- **Q1 (one seam or several):** ONE. `substrateVerdict` is the only band consumer; no refactor was needed
  before this ticket.
- **Q2 (creation step order — school before ability):** the order **is** flexible — the domain step
  finalises `state.domains` at one seam (`app.js` ~2613) well before the character is committed (~2454),
  and school seeding rides that commit. A creation-time school *picker* (letting a player start non-pure)
  is a clean SNG-192 addition: it would read the same `setCharacterSchool` seam this ticket already built,
  inserted after domain-pick and before ability-pick so it can order the pool as you noted. **Not built
  here** (this was the wiring ticket); the seam is ready for it.
- **Q3 (fallback to pure/root, silently):** yes, implemented exactly so. `schoolForTradition` returns the
  pure school (or root-matching, or first) when `character.schools` is absent, and reconcile backfills it
  without a player-facing note. Every existing save keeps working.

## Documents

- **`SYSTEM_SPEC.md`** — new *"Schools (SNG-193b) — a tradition is a ROOT; a school is what it reaches
  WITH"* subsection in the substrate section, with the architecture line, the floor rule, the affinity/CI
  rule, and the `adoptSchool`/`character.schools` lifecycle. Core-rules count unchanged at 32 (schools.json
  already counted at HEAD); no engine module added (logic lives in `substrate.js`), so 59 stands.
- **`ENGINE_MAP.md`** — regenerated. `engine/substrate.js` now carries the **`CONTENT.schools`
  content→engine edge**, `gm_registry.js` + `reconcile.js` as new consumers, and the `adoptSchool` GM verb.
- **`po/RUNNING_FIXES.md`** — nothing, as you said. This is a build.

## Verification

- **35 SNG-193b tests**, all green, including the §3.5 CI gate and the §3.3 opposite-best-grounds outcome
  stated as a factor comparison in thin vs dense ground.
- Full suite **EXIT=0**: wiring audit all checks passed, ENGINE_MAP ok, every ratchet flat
  (`rawProseCaps` 63, `importedNeverCalled` 5, `testOnlyExports` 7 — the five new exports carry
  `// registry:internal` and all have real consumers).
- The L5 static op-wiring gate confirms `adoptSchool` has contract + membership + dispatch.

## Spec boundaries / follow-ons (nothing improvised past)

- **Creation-time school picker** (§5 Q2) — the write-seam exists; the UI step is SNG-192's, per your own
  framing of the order question. Until it ships, every new character starts pure and changes school through
  `adoptSchool` in play.
- **Teachers carrying a specific school** — the GM is *told* a teacher teaches their school and `adoptSchool`
  is the mechanism; binding a given teacher NPC to a *named* school is content, not wired here.
- **The augmented-is-stronger CEILING** — SNG-193's proposal floated reporting FLOOR *and* CEILING (an
  augmented craft peaking *above* pure in its best ground). This pass implements the **band shift + the
  floor**; a ceiling above factor 1.0 is a tuning change to the resolve curve and Erik's balance call, out
  of scope for wiring. Flagged, not touched.

*— CCode. Two Cogitants, one tradition, opposite ground: the one who reaches wants the still, thin air,
and the one who instruments wants the machine humming under the floor. Same craft, different marriage.*

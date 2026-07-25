# SPEC — SNG-236: Cadence Intent + the Playthrough Auditor — prove the game DOES what it INTENDS
## Aevi (PO) · 2026-07-22 · Erik-directed

> **Erik:** "Silas is level 25 and never once triggered encounters I could tell were encounters — a failure of
> the game. And he hasn't run into ANY epic or legendary NPCs; that should happen several times by now. Document
> this as INTENT in the system spec, then devise a way to audit/interrogate/monte-carlo the actual game code so
> we can SHOW it WILL happen as we intend."

## §1 — The real gap: intent is UNDOCUMENTED and UNVERIFIED
Two failures, one root:
- **Intent isn't documented as system-level intent.** 236 feature specs exist; ZERO design-intent docs. The
  cadence numbers DO exist but are BURIED in one feature spec each — SNG-208 sets `epicRate:0.34` +
  `minEpicGapDays:6` ("most multi-day gaps surface an epic"); encounter rates live in random_encounters.js.
  Nowhere says, at the SYSTEM level: "over a level-1→25 playthrough, a player should hit ~N encounters and meet
  ~M epic/legendary figures." The intended EXPERIENCE is only in Erik's head.
- **Nothing VERIFIES the running game achieves it.** SNG-208 TUNES epicRate to a value; nothing proves the wired
  game actually PRODUCES epic appearances at that rate. Silas at L25 with ZERO epics + ZERO recognizable
  encounters is the proof it doesn't — and the ONLY reason we know is a human played 25 levels and noticed the
  silence. That's the worst possible detector: slow, late, and human. (It's the SNG-231 disconnect writ large —
  a rate can be perfect while the wiring that consumes it is broken, and no test catches it.)

## §2 — Part 1: the CADENCE INTENT doc (the system spec Erik asked for)
Author `po/DESIGN_INTENT_cadence.md` (NEW — the first design-intent doc, distinct from feature specs). It states,
at the SYSTEM level and in TESTABLE terms, what a playthrough should PRODUCE. Draft anchors (Erik ratifies the
numbers — these are the DIALS):
- **Encounters:** a player should hit a recognizable, framed encounter (SNG-230) at least every ~X active
  play-hours / ~Y turns in danger-bearing locations; over L1→25, no fewer than ~N total. A cerebral character
  hits fewer COMBAT encounters but should still meet PUZZLE/STANDOFF/CHASE frames — "recognizable encounter"
  spans all kinds, not just fights (this is why Silas, a talker, still should've hit MANY).
- **Epic/legendary figures:** over L1→25, a player should ENCOUNTER or witness the action of ≥ M epic/legendary
  figures (SNG-208), with the first by ~level L_first. "Witness the action of" (news/arc-move) counts; a
  face-to-face counts more. Zero by L25 is a HARD FAIL.
- **Quest cadence, discovery cadence, teacher/school offers, substrate unlocks** — each gets a documented
  intended range (they're all NOT-EMITTED suspects from the See-the-Machine panel; SNG-231's investigation
  showed most were "correctly quiet for a playstyle" — but the intent doc makes "correct" DEFENSIBLE instead
  of assumed).
- **Playstyle-relative, not absolute:** the doc states intent as a FUNCTION of playstyle (SNG-113 fingerprint) —
  a combat character's encounter rate differs from a social one's, BUT both have a floor. The floor is what
  Silas violated: even a pure talker should meet epics and hit non-combat frames.
Each anchor is written so the auditor (§3) can PASS/FAIL it. Intent that can't be measured isn't intent, it's a
vibe.

## §3 — Part 2: the PLAYTHROUGH AUDITOR (the Monte-Carlo Erik asked for)
Extend the EXISTING `balance_sim.mjs` pattern (already a headless Monte-Carlo with pass/fail gates — "tuned
here, never eyeballed, exit 1 if an anchor drifts") into a `tests/playthrough_sim.mjs`:
- **Simulate many headless playthroughs** — thousands of L1→25 trajectories, driving the ACTUAL engine code
  (the real rollTrigger/pickEncounter/isEligible, the real epic stir logic, the real listAvailableEncounters),
  NOT a reimplementation. It must exercise the WIRED path so a disconnect (SNG-231) shows up as a zero.
- **Vary the playstyle** — run cohorts across the fingerprint space (a combatant, a talker like Silas, a
  crafter) so the auditor proves the cadence holds FOR EACH, not just on average. Silas's cohort (social/
  non-combat) is the one that would've caught this.
- **Assert against the §2 intent** — for each cohort, does the sim produce encounters/epics/etc. within the
  documented ranges? Output a table: intended vs. simulated, per cohort, per metric. **A metric outside its
  intended band FAILS the build** — "epics_met_by_L25 = 0 for the social cohort" is a red gate, caught in CI,
  not by Erik at level 25.
- **Localize the break.** When a metric fails, the sim reports WHERE the pipeline dropped it — did the pool roll
  an epic and the offer path drop it (SNG-231)? Did isEligible filter them all (SNG-225)? The auditor isn't just
  "it's broken," it's "the epic was rolled 340 times and offered 0 times — the offer path is the break." That
  turns a cadence failure into a specific seam (ties SNG-232).

## §4 — Why this is the meta-fix
Every encounter/epic/quest bug this session was "a system that was BUILT but doesn't OCCUR at the intended
rate," found by a human in live play. §2 writes the rate down; §3 proves the running code hits it — in CI,
across playstyles, before a human plays. It converts the ENTIRE class of "built-but-silent" failures (231, the
epic silence, the encounter invisibility) from "Erik discovers it at level 25" to "the build fails." It's the
behavioral complement to SNG-232's seam auditor: the seam auditor proves the WIRING agrees; the playthrough
auditor proves the EXPERIENCE occurs. Wiring-correct + cadence-correct = the game does what it intends.

## OWNERSHIP
- Aevi (PO): §2 the cadence-intent doc — author the intended ranges (Erik ratifies the numbers), playstyle-
  relative, each anchor testable. This is design-intent authoring, PO lane.
- CCode: §3 the playthrough_sim — extend the balance_sim pattern, drive the REAL engine path, cohort by
  playstyle, assert against the doc's ranges, localize the break, gate the build. Engine/tooling.
- Erik: ratify the intended NUMBERS (encounters/epics per playthrough, first-epic-by-level) — they're his design
  dials; Aevi drafts, Erik tunes.

## GUARDS
- **Drive the REAL path, never a reimplementation** — the auditor must exercise the wired engine (rollTrigger,
  the offer path, the epic stir), or it proves a MODEL of the game, not the game. A reimplementation would've
  happily shown epics appearing while the real offer path dropped them. The whole POINT is to catch the wiring.
- **Playstyle floors, not just averages** — assert per-cohort; an average that hides "social cohort meets zero
  epics" is the failure that let Silas happen. The floor is sacred: even the cohort that hits the FEWEST must
  clear the minimum.
- **Intent numbers are ERIK'S dials** — Aevi drafts ranges from the existing tuning (epicRate etc.); Erik sets
  the final bands. The doc is design intent, and design intent is the PM's.
- **A passing auditor with no real assertion is theater** (the SNG-232 lesson again) — each metric must be able
  to actually go red against the real engine, or it's a green light that proves nothing.
- **Cadence ≠ railroading** — the intent is a FLOOR and a rough rate, not a scripted "epic at level 7." The
  auditor proves the DISTRIBUTION is right across many runs, never forces a specific run's beats.

## OPEN QUESTIONS — ERIK + CCODE ROUND 2
1. (Erik) The NUMBERS: over L1→25, how many total encounters (by kind) and how many epic/legendary meetings is
   RIGHT? First epic by what level? These are the dials — Aevi will draft from epicRate:0.34 etc., you tune.
2. (CCode) Can the sim drive the real engine headlessly to L25 without the GM/model (stub the narration, keep
   the mechanical path), or does cadence depend on GM CHOICES (the GM offering the encounter) that a headless
   run can't reproduce? If the GM-offer is in the loop, the sim must model "GM offers when eligible" as a rate —
   AND that's exactly the SNG-231 break, so the sim spec must decide: audit the ENGINE's eligibility (can it
   offer?) separately from the GM's offer-taking (does it?).
3. (CCode) Cohort definition: how many playstyle cohorts, spanning the fingerprint how? At minimum
   combat/social/craft; Silas = social is the regression case.

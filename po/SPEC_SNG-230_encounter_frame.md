# SPEC — SNG-230: The Encounter Frame — make a structured encounter OBVIOUS (flee / defeat / fail)
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** "Make encounters more OBVIOUS. If a fight, a chase, a puzzle, etc — anything with structured
> movement through it — the game itself makes it obvious. Like the gambit popup panel. Once you hit an
> encounter you either FLEE it, DEFEAT it (kill the thing, solve the puzzle, avoid it), or FAIL it."

## §1 — Verified: the structure EXISTS; it just isn't SURFACED as a bounded frame
The machinery is already here — the concept is 70% built, unsurfaced:
- **`renderSkillBattle` (app.js)** is ALREADY the bounded-panel Erik wants — for FIGHTS: a takeover screen
  (`⚔ The contest`), a momentum meter ("fill it to prevail; empty it and you are overcome"), vitals, opponent-
  read, and the THREE EXITS Erik names: strike/act, **Break away (FLEE)**, **Yield (FAIL)**. It's exactly the
  model — but it ONLY fires for `mode === "skill_battle"`.
- **`character.activeEncounter`** is real structured state (`{defId, state}`), `[data-encact]` buttons exist,
  `startEncounter`/`setEncounterState`/`encounterReceiptForGM` all run. The STATE layer is built.
- **Routing already types encounters** (random_encounters.js): `duel`→skill_battle panel; `challenge`
  (chase/hazard) ALREADY builds STAGED defs with per-stage checks + failureCosts ("Read the ground → A burst
  through → Close it out"); but `narrative`/`opposed` = **52 of 62 encounters** run as LOOSE GM scene with NO
  surfaced structure.
**So the gap is precise:** fights get the obvious bounded frame; everything else (chase, hazard, puzzle,
standoff, and especially the 52 narrative ones) resolves as narration you can wander through. Erik hits an
encounter and often can't TELL he's in one.

## §2 — The concept: ONE Encounter Frame, THREE exits, for EVERY structured encounter
Generalize the skill_battle panel into a universal **Encounter Frame** that opens for ANY encounter with
structured movement, not just fights. The frame makes three things unmistakable:
1. **You are INSIDE a bounded thing** — a panel takes the surface (like skill_battle, like the gambit builder),
   titled with what it IS ("⚔ A Hostile Meeting" / "🏃 The Chase" / "🧩 The Sealed Door" / "⚠ Hard Ground").
2. **What resolving it MEANS** — the win condition, stated: defeat the thing / solve the puzzle / cross the
   hazard / reach the end of the chase. Not a mystery.
3. **THE THREE EXITS, always visible** (Erik's grammar):
   - **FLEE** — break away / avoid / abandon it. Has a cost (the chase resumes, the thing follows, you lose
     the ground) but it's always an option. (skill_battle's "Break away" generalized.)
   - **DEFEAT** — the structured path THROUGH: kill it, solve it, cross it, win the standoff. The stages/checks
     that already exist (challenge routing) drive this; each stage is a beat in the frame.
   - **FAIL** — you're overcome / caught / the puzzle beats you / you yield. A real outcome with consequences
     (failureCost already exists), NOT a dead end — the story continues from the failure.

## §3 — The kinds (each is the SAME frame, themed)
The frame is one component; the KIND themes it (title, verbs, the meter's meaning):
- **FIGHT** (duel/skill_battle) — already built. The reference implementation. Meter = momentum.
- **CHASE** (challenge/chase) — stages already exist ("Read the ground → burst → close out"). Meter =
  distance/gap. Defeat = catch-or-shake; Flee = give up the pursuit; Fail = caught or lost them.
- **HAZARD** (challenge/dangerous) — stages exist ("Read the hazard → commit → clear it"). Meter = progress
  across. Defeat = cross it; Flee = turn back; Fail = the hazard takes its toll.
- **PUZZLE / SEALED THING** (NEW kind) — a staged mental challenge (KNOW/insight stages). Meter = insight/
  progress. Defeat = solve it; Flee = leave it unsolved; Fail = it stays sealed (or springs its cost).
- **STANDOFF / SOCIAL** (opposed → framed) — a bounded social contest (SWAY stages). Meter = the other's
  resolve. Defeat = win the exchange; Flee = withdraw; Fail = they prevail.
The 52 narrative encounters: triage — the ones with real STAKES/structure get a frame + kind; the purely
atmospheric ones (a beautiful sight, a benign meeting) stay as narration (NOT everything needs a frame — a
frame on a sunset is noise; §Guard).

## §4 — Where the structure comes from (mostly already there)
- **Stages:** challenge-routing encounters already carry them; the frame RENDERS the existing stages as beats.
  For narrative encounters promoted to a frame, synthesize stages the way `buildStagedDef` already does (it's
  written — generalize it beyond chase/hazard).
- **The three exits:** universal, injected by the frame, not per-encounter — every frame has flee/defeat/fail.
- **Failure isn't a wall:** failNow continues the story (failureCost + a narrative consequence), the same way
  a fight you yield doesn't end the game. Fail = a branch, not a game-over.

## §5 — Why this is high-value (Erik's real want)
Right now the encounter system WORKS (rolls fire, stages exist, fights have a panel) but is INVISIBLE for most
encounters — the player can't tell structured play from narration, so the pacing/stakes the engine computes
don't LAND. The frame makes the engine's structure legible: you KNOW you're in a chase, you SEE the three ways
out, you feel the bounded thing. It's the same value the gambit panel added (a loose idea became an obvious,
runnable structure) applied to encounters. Ties SNG-225 (the pool now HAS monsters/stakes to frame) and
SNG-229 (bestiary creatures become framed FIGHTS with real exits).

## OWNERSHIP
- CCode: the Encounter Frame component (generalize renderSkillBattle → a kind-themed universal frame), the
  three-exit grammar, promoting challenge/opposed encounters into framed kinds, generalizing buildStagedDef to
  puzzle/standoff. Engine + UI.
- Aevi: content — author PUZZLE and STANDOFF exemplar encounters (new kinds need seeds), and the per-kind
  framing copy (titles/verbs/meter-labels). Flag when CCode's frame shape is set so I author to it.
- Erik: the VISUAL of the frame (like gambit panel) is his eye — a ROUND-2 mockup pass.

## GUARDS
- **Not everything is an encounter** — a beautiful sight, a benign passerby, atmospheric narration must NOT get
  a frame. The frame is for STRUCTURED movement (a thing to defeat/solve/cross/win). Framing a sunset is the
  gambit-suggestion-every-turn mistake (SNG-043) in a new place. Triage the 52 narrative encounters; most stay
  narration.
- **The three exits are ALWAYS present** — flee/defeat/fail, every frame, no exceptions. A frame with no visible
  flee is a trap; a frame with no fail is a formality. The grammar is the point.
- **Fail is a branch, not a wall** — failing an encounter continues the story with consequences; never a
  dead-end or forced reload. (failureCost exists; wire the narrative continuation.)
- **Reuse skill_battle** — this GENERALIZES the existing panel; do NOT build a parallel frame. Fights are the
  reference; the other kinds are the same component themed.
- **Don't re-open the fight panel's balance** — skill_battle's meter/rounds work; the frame borrows its shape,
  doesn't re-tune it.

## OPEN QUESTIONS — ERIK + CCODE ROUND 2
1. (Erik, visual) The frame's LOOK — same takeover-panel treatment as skill_battle/gambit, or a lighter
   "banner + inline stages" for smaller encounters (a riffraff hazard needn't take the whole screen)? Maybe:
   big encounters (regional/epic) = full takeover; small (riffraff/notable) = a compact framed banner. Erik's eye.
2. (CCode) Promote-to-frame threshold: which of the 52 narrative encounters get a frame? By flavor
   (PERILOUS = fight/chase/dangerous/theft always framed; beneficial/benign/beautiful never)? That maps
   cleanly — the PERILOUS constant already exists in random_encounters.js.
3. (CCode) Puzzle/standoff kinds — generalize buildStagedDef, or author these as explicit staged defs in
   content (Aevi)? Likely both: the generator for emergent ones, authored exemplars for signature ones.
4. (Erik) Should FLEE always succeed (at a cost), or can you FAIL to flee (the chase catches you)? Fleeing a
   fight vs. fleeing a chase differ — fleeing the chase IS the fail. Erik's call on whether flee is guaranteed.


---

# §6 — REFINEMENT (Erik, 2026-07-22): the exits are LIVING, and skills can COLLAPSE the frame

Erik sharpened the three exits from static buttons into a chaining, skill-responsive system. Two mechanics:

## §6a — FLEE is not an escape hatch — it CONVERTS the fight into a CHASE (frames chain)
Flee does NOT always succeed (correcting §OQ4). Choosing FLEE from a fight **transitions the encounter into a
CHASE frame** — its own frame, its own three exits, its own stages (the chase machinery already exists,
challenge-routing). Then:
- **Win the chase (DEFEAT the chase)** → you got away. Flee succeeded.
- **FAIL the chase** → it dumps you BACK into the fight (or into FAIL outright, if the flee burned your
  position). "If you fail the chase you will have to fight, or fail." — Erik.
So the frames **CHAIN**: FIGHT --flee--> CHASE --fail--> FIGHT (or FAIL). Fleeing is a real playable sequence
with stakes, not a teleport. This is the outcome vocabulary already present (`fled`, `abandoned`,
`opponent_fell`) wired into a transition graph:
```
  FIGHT ─(flee)→ CHASE ─(defeat)→ escaped (fled)
                 CHASE ─(fail)→   back to FIGHT  (or FAIL if position lost)
                 CHASE ─(flee)→   … you can't flee a chase; fleeing a chase IS trying to shake it
```
The KIND determines what its own flee means — you flee a fight INTO a chase; you can't "flee" a chase (shaking
it IS the chase's defeat condition). Each frame's exits are themed by kind; the transition graph is the system.

## §6b — a SKILL can COLLAPSE or MORPH the frame — via an OPPOSED check (the sharp one)
Some skills don't grind the meter — they try to END the encounter in one beat. Cut the Thread, the_ended_threat,
hunters_strike, and other instant-lethal / instant-escape crafts appear as an ACTION INSIDE the frame that, on
success, COLLAPSES it immediately (skip the stages, the thing is done). BUT — Erik's key word — it is an
**OPPOSED check, not an auto-win**:
- **Instant-lethal vs. a weak/riffraff thing** → likely collapses the frame in one beat (DEFEAT, instantly).
  This is the reward for the right skill on the right target — a glimmerling swarm doesn't survive Cut the
  Thread.
- **Instant-lethal vs. a strong/regional/epic thing** → the target RESISTS: the finisher becomes an OPPOSED
  skill check (their resolve/threat vs. your craft). Succeed → collapse. **FAIL → the frame MORPHS**: you tried
  to cut the thread and missed, and now it's a full FIGHT (the thing knows you tried to end it, and it's
  angry). A missed finisher is the most dangerous opening move.
- **The same for flee-skills:** a movement/transit craft (shadowstep, the_grey_road) can COLLAPSE the flee —
  turn a chase into an instant escape on a successful opposed check (their reach vs. your craft); fail and the
  chase continues from a worse position.
So a skill can: **collapse** the frame (instant win/escape), or **morph** it (a failed finisher turns a soft
encounter into a hard fight, a failed skill-flee worsens the chase). The frame is RESPONSIVE to what you
throw at it, not a fixed meter-grind.

## §6c — mechanics grounding (verified)
- The OUTCOME vocabulary already exists (app.js:2023): `opponent_fell, fled, abandoned, solved, walked_away,
  incapacitated, yielded, completed`. §6a/b wire these into a transition graph + a collapse path; the outcomes
  are built, the TRANSITIONS between frames are the new machinery.
- Instant-lethal/escape is a FUNCTION-FAMILY property (the 24-verb vocab), not per-ability hardcoding —
  CCode keys the collapse-attempt off the skill's function family (a FINISH/END-family or MOVE/transit-family
  craft offers the collapse action inside the frame); the OPPOSED check is the existing resolve.js opposed
  path (my SNG-225 encounters already use `routing: opposed`).
- `canIncapacitate` already gates whether an encounter is escapable — extend its spirit: whether a frame is
  COLLAPSIBLE by a finisher (an epic dragon may be non-collapsible — no one-beat kill on the Ashen Wyrm; you
  fight the stages), a riffraff always collapsible.

## §6d — updated GUARDS
- **Flee has stakes** — fleeing a fight starts a chase you can LOSE; never a free exit. (Corrects §OQ4.)
- **Collapse is EARNED, not free** — a finisher is an opposed check scaled to the target; strong things resist,
  epics may be non-collapsible. Cut the Thread isn't a win button; it's a high-risk high-reward opening.
- **A failed collapse MORPHS, doesn't no-op** — miss the finisher and the encounter hardens (soft→fight,
  chase→worse chase). The whiff has teeth.
- **Function-family driven** — which skills offer collapse/flee-collapse comes from the 24-verb vocab, not a
  hardcoded skill list; a new FINISH-family craft automatically gets the collapse action.

## §OQ — updated for CCode/Erik ROUND 2
5. (CCode) The transition GRAPH — is it authored per-kind (fight→chase, chase→fight/fail) as data, or hardcoded
   in the frame? Data is cleaner (a new kind declares its own exits/transitions).
6. (CCode) Collapse eligibility — a `collapsible` + `collapseDC-by-tier` on the encounter/creature (riffraff
   low, epic non-collapsible), read against the finisher skill's function family + the opposed check. Where does
   collapseDC live — bestiary tier, or computed from threat?
7. (Erik) Should a MORPHED encounter (failed finisher → fight) be HARDER than if you'd just fought (a penalty
   for the failed gambit), or the same fight from a worse position? Erik's call on how much the whiff costs.


---

# §7 — REFINEMENT 2 (Erik, 2026-07-22): outcomes are GRADED, defenses DENY mechanics, kit TRIVIALIZES

Three more layers that make the frame INTELLIGENT rather than binary. All ground in existing machinery.

## §7a — Consequences scale with the ROLL MARGIN + GM read (not collapse-or-nothing)
A finisher (or any frame action) does NOT resolve pass/fail — it resolves along the resolver's EXISTING degree
bands (resolve.js:147: `crit_success | success | partial | failure | crit_failure`). The collapse/morph is the
TOP and BOTTOM of a spectrum; the middle is graded:
- **crit_success** → the frame COLLAPSES (instant kill / clean escape / puzzle solved outright).
- **success** → the finisher lands hard but may not fully collapse a strong target — heavy damage, the
  encounter continues from a much better position.
- **partial** → it bites: real damage / partial progress, but the thing is still up and now alerted.
- **failure** → glances; little effect; the encounter MORPHS (soft→fight) or hardens.
- **crit_failure** → the whiff with teeth — you're exposed, the thing gets a free beat, worst-case morph.
So "a Cut the Thread could be completely resisted on a solid fail, but might just damage hard" (Erik) = the
degree band + the GM read of the situation picks the consequence. The GM narrates the SHAPE the band gives it.
The bands EXIST; §7a wires collapse/morph/damage/whiff to them instead of a boolean.

## §7b — a WARD can DENY a mechanic outright (a gate, not a modifier) — the sharp one
A defense like **Death-Ward does NOT add a bonus to resist an instakill — it makes instakill STRUCTURALLY NOT
APPLY** unless the opposed roll DEMOLISHES the ward. This is categorically different from a resist modifier:
- A modifier shifts the odds. A WARD **invalidates the mechanic**: against a Death-Warded target, a
  FINISH-family collapse attempt cannot instakill AT ALL — the finisher is not resisted, it's INAPPLICABLE.
- The ward has a **break-threshold**: only a demolishing roll (crit_success margin ABOVE the ward's tier)
  breaks it; then the finisher applies normally. Anything less = the instakill simply doesn't happen (it may
  still do ordinary damage per §7a, but the INSTANT-END mechanic is off the table).
- Mechanically: a ward declares `denies: ["finish","instant_end"]` (function families it nullifies) +
  `breakDC`. The collapse path checks for a denying ward FIRST — if present and unbroken, the collapse mechanic
  is unavailable regardless of the roll's other effects. This is the `ward` function family (already in the
  vocab, app.js:1589) doing what it should: not softening a blow but forbidding a KIND of blow.
- Generalizes: any ward can deny any mechanic-family (a mind-ward denies SWAY-collapse of a standoff; a
  movement-ward denies transit-collapse of a chase). Wards gate WHAT'S POSSIBLE, not just the numbers.

## §7c — the KIT can TRIVIALIZE a challenge by voiding its PREMISE (relative difficulty)
A challenge's difficulty is RELATIVE TO YOUR KIT, not absolute. A skill can make a challenge trivial by
removing the obstacle's premise entirely — no roll:
- **"There's a wall to climb" + you can FLY (Marrow's Wings)** → the climb was never YOUR obstacle. You fly to
  the top; the challenge ends, trivially, no roll. The frame recognizes the premise is VOID for your kit and
  resolves it as bypassed (DEFEAT, trivial), not a skipped roll — a *narrated walk-around*.
- **Higher-level KNOW/insight skills LAY OUT THE SOLUTION** → a skill that reads patterns/futures can hand you
  the whole answer to a SIMPLE puzzle, trivializing it (DEFEAT, trivial). "Some skills lay out the entire
  solution, especially at higher levels." — Erik.
- **BUT harder challenges RESIST even the right skill** → a hard puzzle, or a wall warded against flight, or a
  foe whose pattern resists reading, does NOT trivialize — the trivializing skill becomes an OPPOSED ROLL
  (your craft vs. the challenge's resistance). "Simple puzzles trivial; harder puzzles opposed rolls." — Erik.
- Mechanically: a challenge declares its **premise** (what makes it hard: `requires: "climb"`, `barrier:
  "physical_ascent"`) + a **trivializedBy** (function families that VOID the premise: a MOVE/fly craft voids a
  climb) + a **resistDC** (above which even the voiding skill must roll opposed). The frame checks the player's
  kit against the premise: premise-voided + below resistDC → trivial bypass; premise-voided + at/above resistDC
  → opposed roll; premise not voided → normal stages. This is why a fly-craft trivializes a low wall but a
  warded height is still a real challenge.

## §7d — the unifying principle
The frame is not a fixed obstacle course — it is **evaluated against your kit and the roll's margin**:
- WHAT the roll does scales with its DEGREE (§7a) — collapse, wound, glance, whiff.
- WHAT'S POSSIBLE is gated by WARDS (§7b — a ward can forbid a whole mechanic) and by your KIT (§7c — the right
  craft can void a challenge's premise).
- The GM READ picks the narrated shape within what the mechanics allow.
So the same encounter is a trivial walk-around for one character (who can fly / who has the finisher / whose
kit voids the premise), a graded fight for another, and an impossible wall for a third (warded against their
one trick). The frame READS the situation. That's the intelligence Erik is describing.

## §OQ — REFINEMENT-2 ROUND 2
8. (CCode) Degree→consequence mapping (§7a): authored per-kind (a fight's crit_fail differs from a puzzle's),
   or one spectrum the GM narrates? Lean: one mechanical spectrum (collapse/hard/partial/glance/whiff) + GM
   narrates the KIND-specific shape.
9. (CCode) Ward-denial (§7b): `denies: [families]` + `breakDC` on ward abilities — where authored (ability def)
   and checked (collapse path, before the opposed roll). Confirm the ward-family abilities that should deny
   (the_shielding_word? the_warding_mark? a dedicated Death-Ward?).
10. (CCode/Aevi) trivializedBy/premise/resistDC (§7c): challenges/creatures declare a `premise` + `trivializedBy`
    families + `resistDC`. CCode wires the kit-check; Aevi authors premises + trivializedBy on encounter/puzzle
    content. What's the default resistDC by tier (riffraff trivial-able freely, epic never)?
11. (Erik) How VISIBLE should a trivial bypass be? A quiet "you simply fly up and over" (frictionless), or a
    small acknowledged beat ("your wings make nothing of the wall") so the player FEELS their kit mattered?
    Erik's call — the second makes power feel earned.

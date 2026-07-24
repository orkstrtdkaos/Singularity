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

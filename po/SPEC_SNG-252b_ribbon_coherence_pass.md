# SPEC — SNG-252b: Encounter ribbon coherence pass (hierarchy, collapse, narration inside)
## Aevi (PO) · 2026-08-01 · Erik-directed ("I'm lost with everything it's showing")

> **Erik:** "Tapping to open the moves is a good default. We also need to move the narration to a good place
> INSIDE the encounter. And a coherent cleanup of all the stuff in the ribbon would help — I'm lost with
> everything it's showing."

## §1 — Diagnosis: SNG-252 unified the container but not the HIERARCHY
252 did its job — everything's in one ribbon now. But everything landed at ONE visual weight with no order of
importance, and the moves render EXPANDED, so the ribbon reads as a wall. Three concrete faults (from the screen):
1. **Moves are exploded open by default.** The screenshot shows ~5 full-width move CARDS (Prism Sight / Size them
   up / Reason it out / Read them / Sonic Resonance), each with subtitle lines — eating the whole screen before
   the player has chosen to look at their moves. (`movesOpen` should default false; the 252 build opened them.)
2. **Repeated subtitle noise.** Every move in a family repeats the SAME family-level blurb — five REVEAL moves all
   say "reads THEM — sharpens the fog and sets up your next move." The per-move distinguishing line ("finds the
   opening, the trick" vs "finds the pattern in how they fight") is buried UNDER the repeated family line.
3. **Narration is OUTSIDE the ribbon.** The scene prose ("The door tells you everything…") renders as a separate
   appended block BELOW the whole moves panel (app.js:~8747), so the thing you're acting IN sits after the
   controls. It should be INSIDE the ribbon, near the top — the scene you read, then act on.

## §2 — The fix: hierarchy + collapse + narration-inside (a coherence pass, not new features)
### §2a — moves COLLAPSED by default; tap to open (Erik)
`movesOpen` defaults FALSE. When engaged, the ribbon shows a single **"⚙ Moves"** affordance (a collapsed
summary — e.g. "⚙ Your moves — 5 reads, 1 strike · tap to open"), NOT the exploded cards. Tap → expand. This is
Erik's explicit call and the single biggest de-wall. The freeform line stays visible (typing is always available);
the MOVE CARDS are what collapse.
### §2b — narration INSIDE the ribbon, near the top (Erik)
Move the scene narration INTO the ribbon, positioned right under the header/win line and ABOVE the meter/exits/
moves — the player reads the scene, THEN sees where they stand and what they can do. The "▶ Read aloud" stays with
it. One container, and the SCENE leads it (it's the most important thing — what's actually happening), the
controls follow.
### §2c — a clear VISUAL HIERARCHY (the "coherent cleanup")
Order the ribbon so the eye lands in the right sequence, with weight matching importance:
  1. **Header** — kind icon + name + kind·round (small, it's a label).
  2. **The SCENE** (narration) — the prose, prominent — this is what you're in.
  3. **Where you stand** — win condition + meter/stage + the RECEIPT line (SNG-246), as ONE compact status row,
     not three stacked full-width bars.
  4. **What you can do** — the ⚙ Moves affordance (collapsed) + the freeform line. Actions live together, low.
  5. **The ways out** — exits, quietest, at the bottom.
Collapse the redundant: intensity + the Sense→Action→Bonus→Execute chain are ADVANCED controls — tuck them
behind the moves expansion or a small "turn detail" toggle, not front-and-center competing with the scene.
### §2d — dedupe the family blurb (the subtitle noise)
The family-level line ("reads THEM — sharpens the fog") shows ONCE as the family group's header, NOT on every
chip. Each move card then shows only its OWN distinguishing line ("finds the opening, the trick" / "finds the
pattern in how they fight"). Family blurb once per group; per-move line per move. Kills the five-identical-lines
wall.

## §3 — Why (Erik is lost, and that's the failure)
The point of the ribbon was LEGIBILITY — one clear object. Right now it's one object with no internal order, so
it's harder to read than the old split. "I'm lost with everything it's showing" is the exact failure to fix: not
LESS content, but HIERARCHY — the scene first and prominent, status compact, moves collapsed until wanted, exits
quiet, advanced controls tucked. The player should land on "here's what's happening," then "here's where I
stand," then "here's what I can do" — in that order, without hunting.

## OWNERSHIP
- CCode: §2a movesOpen=false default + the collapsed ⚙ Moves summary affordance; §2b relocate narration INTO the
  ribbon under the header (from the separate appended block); §2c the hierarchy/ordering + tuck intensity+chain
  behind a detail toggle; §2d dedupe the family blurb to the group header (per-move line stays per move). All
  presentation — no engine/mechanic change.
- Aevi: the collapsed-moves summary copy ("⚙ Your moves — {n} reads, {n} strike · tap to open"), the "turn
  detail" toggle label for the tucked intensity/chain, and confirming the per-family header blurb vs per-move
  distinguishing line split (I authored the hints; I'll make sure the group-vs-move split reads right).
- Erik: see-it-built — once it's collapsed + narration-inside + ordered, is the hierarchy right, or does
  something want to move? (The mobile-height + input-row-⚙ calls from 252 fold in here.)

## GUARDS
- **Legibility is the whole point** — the test is "can Erik land on what's happening, then what he can do, without
  being lost." Fewer things SHOWN AT ONCE (collapse), clearer ORDER (hierarchy). Not less content — better
  sequence.
- **Scene first** — narration is the most important thing in the ribbon (it's the fiction you're acting in); it
  leads. Controls follow. Don't bury the scene under the machinery.
- **Collapsed by default, expandable always** — moves + advanced turn-detail start collapsed; one tap opens. The
  freeform line stays visible (typing is never hidden). Moves are shortcuts; hiding the cards doesn't hide the
  ability to act.
- **Dedupe, don't delete** — the family blurb is good copy; show it ONCE (group header), not per-chip. The
  per-move distinguishing line is what earns its place on each card.
- **No mechanic change** — this is purely presentation/hierarchy. The rounds, families, receipt, exits all still
  work exactly as SNG-252 built them; SNG-252b only reorders and collapses what's shown.

## OPEN QUESTIONS
1. (Erik, see-it-built) After collapse + narration-inside + hierarchy: right order? Anything still too loud/buried?
2. (Aevi) The collapsed-moves summary phrasing + the turn-detail toggle label — I author.
3. (Erik) Should the moves auto-open on the FIRST encounter (a teaching moment) then default-collapsed after? Or
   always collapsed? Lean: always collapsed — simpler, and the ⚙ is discoverable.

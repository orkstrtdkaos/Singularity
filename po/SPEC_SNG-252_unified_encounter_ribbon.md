# SPEC — SNG-252: The unified encounter ribbon (one container) + Moves worked back in
## Aevi (PO) · 2026-08-01 · Erik-directed (from the Hard Ground test screenshot)

> **Erik:** "The hazard border doesn't seem to have the full border. I want the encounter ribbon at the top to
> EXPAND and contain ALL the encounter content when engaged — not be split into two sections; the ribbon can
> contain all the encounter information and action choices. Plus I really like the MOVES concept — it was tossed
> at some point but persists here. Work it back into the encounters and make it more robust with all we've
> learned."

## §1 — Diagnosis (verified at origin): three real issues, three different causes
1. **The hazard border is partial.** The frame wraps as `enc-frame enc-strip enc-frame-${fm.kind}` (app.js:8650)
   — the border hue comes from the `enc-frame-hazard` CSS class. The contest kinds (fight/chase/standoff/puzzle)
   got their full hue; **hazard's `enc-frame-hazard` (the "stone" hue) is missing or incomplete in style.css** —
   a CSS gap on the one kind that stays on the classic challenge path, not a structural difference. (CCode's
   border work covered the contest kinds; hazard's hue class was the gap.)
2. **The ribbon is split into two sections — STRUCTURAL.** The frame is ONE div built at app.js:8650; the moves
   panel is a SEPARATE div appended later at app.js:8822 (`main += encounterMovesPanel()`), a SIBLING, not
   nested. So the screen shows: [frame strip] … [orphaned italic flavor line] … [grouped-moves panel] — three
   fragments. Erik wants ONE container that owns all of it when engaged.
3. **Moves is ALIVE and good.** `encounterMovesPanel()` (app.js:2328) already groups owned abilities BY FUNCTION
   FAMILY (HARM/KNOW/INFLUENCE/PROTECT…, with family colors + glyphs) plus the stage-attempt + the ways-out. It
   was never truly removed — it persists behind the ⚙ Moves toggle. "Work it back in" = PROMOTE it from a
   toggle-panel-below into the ribbon ITSELF, and enrich it with everything since.

## §2 — The fix: ONE unified encounter ribbon that expands to own everything when engaged
### §2a — hazard gets its full border (the quick fix)
Add/complete the `enc-frame-hazard` hue in style.css so hazard flies its full stone-colored border like every
other kind. (One-source-of-hue: the border matches `encounterKind` — the same rule the dev-button colors use, so
the button, the frame, and the CSS can never disagree. Confirm hazard is in that hue map.)

### §2b — the ribbon becomes ONE container (the structural fix)
When an encounter is engaged, the ribbon EXPANDS into a single `enc-frame` container holding ALL of it, in order:
  1. **Header** — kind icon + name + kind·round (exists).
  2. **Win condition** + the current **stage/meter** (exists — the Distance/Resolve/Insight/Progress bar).
  3. **The receipt line** (SNG-246 Fix-D) — the per-kind mechanical readout (hp/ground/resolve/insight/progress +
     finish-proximity) so the player always sees where they stand. Fold it IN, not floating.
  4. **The exits** (the ways out — defeat/flee/fail, per-kind labelled) (exists).
  5. **The freeform cue** + **the MOVES** (§2c) — INSIDE the ribbon now, not a separate panel below.
  6. **The flavor line** (the "watch for" italic) — folded in as the ribbon's subtitle, NOT orphaned between two
     panels.
The separate `main += encounterMovesPanel()` sibling append (8822) goes away — the moves render INSIDE the frame.
One border around the whole engaged encounter; nothing about the encounter lives outside it.

### §2c — MOVES, worked back in and made robust (Erik's ask)
Keep what's good (function-family grouping + ways-out) and enrich with everything since SNG-247/249/250:
- **Grouped by function family** (exists — HARM/KNOW/INFLUENCE/PROTECT/SHAPE/MOVE/SUSTAIN/RESTORE, colored +
  glyphed). This is the organizing spine Erik likes.
- **This-encounter primary moves** (the stage attempt / work-the-mechanism / puzzle unlocks — exists).
- **The ways out** (per-kind exit labels — now SNG-247-correct: a chase's "break contact" vs a standoff's "stand
  aside", not a generic "flee").
- **NEW — the moves know the KIND** (SNG-247): the moves offered read the encounter kind, so a standoff surfaces
  INFLUENCE/KNOW moves prominently (composure, persuasion, reading), a fight surfaces HARM, a puzzle surfaces
  KNOW/SHAPE — the grouping is the same but the ORDER/emphasis fits the kind. A move that trivializes the premise
  (SNG-247 trivializeNote) is flagged.
- **NEW — moves show their CONSEQUENCE** (SNG-246/249): a move chip can hint what it does in THIS kind's currency
  ("Sonic Resonance — INFLUENCE · presses their resolve") so the player picks with the receipt in view, not
  blind.
- **NEW — the ward/forbidden state** (SNG-230 §7b): a move the encounter FORBIDS (a ward against a mechanic) reads
  as disabled-with-reason, not offered-then-refused.
- **Always the freeform line** — "or describe your own move; the rules bind either way." Moves are SHORTCUTS to
  intent, never a cage — type anything and it routes through the same duelRound/challengeStage/puzzleAttempt.
- **Open by default when engaged** (Erik's intent) — the moves are IN the ribbon, visible on engage, not behind a
  toggle you have to find. (The ⚙ can still collapse them for space, but the default is shown.)

## §3 — Why this matters
Right now an engaged encounter is three disconnected fragments — a frame, an orphaned flavor line, a moves panel
somewhere below — and the player's eye has to assemble the encounter from pieces. One ribbon that owns everything
makes the encounter a SINGLE legible object: here is what you're in, here's where you stand (receipt), here's what
you can do (moves, grouped, kind-aware, consequence-hinted), here's the way out. The Moves concept is the right
organizer for "action choices" — Erik's instinct is correct — and folding it into the ribbon is what makes the
whole encounter read as one thing instead of scattered controls.

## OWNERSHIP
- CCode: §2a the hazard hue in style.css (+ confirm hazard in the one-source hue map); §2b restructure the render
  so the ribbon is ONE container holding header/win/meter/receipt/exits/moves/flavor (remove the sibling
  moves-panel append; nest it); §2c the moves enrichment (kind-aware ordering, consequence hints, ward-disabled
  state, open-by-default-in-ribbon) — extending the existing encounterMovesPanel(), not rebuilding.
- Aevi: the ribbon's copy + the moves consequence-hint phrasings per family×kind (what "Sonic Resonance presses
  their resolve" reads like across the kinds) + the flavor-line-as-subtitle voice. Content, my lane.
- Erik: does the ribbon ever get too tall on mobile (do moves collapse under a count, or scroll within the
  ribbon)? A layout call once he sees it built.

## GUARDS
- **One container, truly** — the whole engaged encounter inside one `enc-frame`; nothing about it renders outside.
  The sibling-append is the bug; nesting is the fix.
- **Moves are shortcuts, never a cage** — the freeform line stays; every move routes through the same engine the
  typed move does. The grouping ORGANIZES intent, it doesn't restrict it (Erik's original Moves principle).
- **Kind-correct, consequence-visible** — moves read the SNG-247 kind (right exits, right emphasis) and hint their
  effect in the kind's currency (the SNG-246 receipt logic) so a pick is informed.
- **Hazard is not special-cased away** — it keeps its classic fast-path (Erik's ruling — hazard stays the fast
  one), but it gets the SAME ribbon + border treatment; fast ≠ frameless.
- **Don't lose what works** — encounterMovesPanel's family-grouping + ways-out are good; extend, don't rebuild.

## OPEN QUESTIONS
1. (Erik) Mobile height — moves collapse under N, or scroll within the ribbon? A see-it-built call.
2. (Aevi) The consequence-hint phrasings per family×kind — I author (a HARM move in a standoff hints differently
   than in a fight). Grounded in the SNG-247 kind voice + the SNG-246 receipt formats.
3. (Erik) Should the ⚙ Moves toggle still exist to COLLAPSE moves for space, or are they always shown when
   engaged? Lean: shown by default, collapsible via ⚙ (best of both).


---

# §4 — FOLLOW-ON (noted, not yet ticketed): the kind-native ACTION vocabulary (SNG-253 candidate)
From Erik's Toll Keeper standoff screenshot (pre-252). 252 fixes the player-facing PRESENTATION — the one
container, the receipt line (hp → "their resolve"), the player's own move hints. It does NOT fix two deeper
leaks that make a standoff still PLAY like a fight underneath the label. Verified at origin:

1. **The OPPONENT's move vocabulary is hardcoded fight-verbs.** `skill_battle.js:48` — the default archetype is
   `[{function:"strike", name:"a hard strike"}, {function:"shield", name:"a raised guard"}]`. So a standoff
   opponent "gathers to STRIKE" and raises a "GUARD shield" because those are the ONLY verbs opponentPolicy has.
   There is NO per-kind verb mapping (confirmed empty). A standoff opponent should "press a point / hold the line
   / counter"; a chase pursuer should "close / cut you off"; a puzzle has no opponent at all.
2. **The round runs the fight's `battleRound` with a GUARD/strike family structure**, so even the player's moves
   are combat-shaped underneath the composure label. The kind changes the METER LABEL (skill_battle currency:
   "standoff your composure, a fight your blood") and the NARRATION ("NOBODY IS HURT"), but not the round-by-round
   ACTION WORDS on either side.

**Why NOT ticket it yet:** 252 is specced but NOT BUILT. Adding a third encounter spec ahead of it front-runs the
queue. And 252's UI work will EXPOSE the exact seam — once the ribbon + receipt + move-hints land, the remaining
fight-flavor will be precisely the opponent-verb + round-vocab layer, isolated and easy to see. So: build 252
first, re-look at a standoff, and THEN scope SNG-253 against what actually remains (likely: a per-kind
opponent-archetype verb set — a standoff's opponent gathers to "press", not "strike" — + a kind-native action
label on the player's side, both mapping the SAME families to kind-appropriate WORDS without changing the
symmetric engine). The engine staying symmetric is fine; the VOCABULARY on top of it must be kind-native.

**Aevi owes, WHEN SNG-253 opens:** the per-kind opponent-verb sets (standoff/chase/fight/hazard) + the kind-native
action words per family — the same authoring shape as the SNG-247 kind voice + the SNG-252 move hints, extended to
the opponent's declared intent. Flagged here so it's not lost; parked behind 252 deliberately.

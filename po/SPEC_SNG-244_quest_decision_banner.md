# SPEC — SNG-244: Quest decision surfaces in the banner above narration
## Aevi (PO) · 2026-07-25 · Erik-directed

> **Erik:** "When a quest condition completes and a decision needs to be made to end it, it should present that
> decision in the banner above the narration so it's obvious."

## §1 — The gap (verified)
The decision STATE already exists: app.js:6950 computes `atDecision = !resolved && (q.awaitingResolution ||
allStagesDone)`. BUT it only renders on the QUEST DETAIL PAGE — a player IN NARRATION gets NO signal that the
decision has arrived. They'd have to leave the scene and open the quest tab to discover the endings are ready.
So "you reached the decision" is invisible at the moment it matters — the same class as SNG-239 (the earned
thing not surfaced). A keystone quest hitting its decision should be OBVIOUS in the play surface.

## §2 — The fix: a DECISION STRIP in the play banner (reuse the SNG-230 pattern)
SNG-230 already built exactly the right component: "an INTEGRATED, persistent STRIP at the top of the play
surface" for encounter frames (app.js:8331 — obviously-a-thing, with the ⚙ Moves gear). The quest decision uses
the SAME pattern:
- **When a tracked quest hits `atDecision`** (condition met, endings ready), render a DECISION STRIP at the top
  of the play surface, above the narration — the same integrated-strip slot the encounter frame uses.
- **The strip states, plainly:** the quest name, that a DECISION is ready ("The Second Thread — decision at
  hand"), and the roads available (the outcome names: Finish it / End it / Give it — or for the water quest,
  Sleep / Die / Repair / Awaken). Tapping a road opens/confirms that ending.
- **It's obvious and persistent** — like the encounter strip, it stays until the player acts on it, so a decision
  can't be missed by scrolling past a line of prose. This is the "make the earned moment unmissable" principle
  (SNG-239's sibling): SNG-239 makes the GM STATE the reveal; SNG-244 makes the UI SURFACE the decision.

## §3 — How it fits the existing UI
- The play surface already has the integrated-strip slot (SNG-230, frameSize takeover-vs-banner at app.js:8338).
  The decision strip is a NEW strip TYPE in that slot — "decision" alongside "encounter". When both are live
  (rare), the encounter resolves first (you fight your way to the decision), then the decision strip shows.
- The strip reads the SAME `atDecision` + `q.outcomes` the quest detail page already computes — no new state,
  just surface it in the play banner too. The outcomes' names/summaries are the road labels (they exist).
- Tapping a road routes to the existing resolve path (the quest detail's ending-selection), so no new resolve
  logic — the strip is a SHORTCUT that makes the decision visible and actionable in-scene.

## §4 — Why this matters (Erik's real want: obvious decisions)
A quest's decision is its most important beat — the whole quest built to it. Burying "you can now decide" in a
line of narration (or worse, only on a tab the player isn't looking at) means the player can play PAST their own
climax without noticing. The banner strip makes the decision as obvious as an encounter frame — which is right,
because a resolve-decision IS an encounter with a choice. Ties SNG-239 (clarity): the GM states the earned
reveal plainly (prose) AND the UI surfaces the decision unmissably (strip) — together, the player always knows
when they've reached the choice and what it is.

## OWNERSHIP
- CCode: the decision strip — a new strip type in the SNG-230 integrated-strip slot, driven by the existing
  `atDecision` state, showing quest name + ready-decision + the outcome roads, tapping routes to the existing
  resolve path. UI/engine, reuses the encounter-strip component.
- Aevi: the strip's COPY (how the decision announces itself — "The Second Thread — the fold is finished enough
  to decide" etc.) so it reads with weight, not as a system toast. Small content, my lane; I'll author the
  decision-strip phrasings per quest or a good generic template.
- Erik: confirm the strip shows the ROADS (outcome names) directly, or just "a decision is ready — open to
  choose" (roads on the detail page). Lean: show the roads — that's the obvious Erik wants.

## GUARDS
- **Reuse the SNG-230 strip, don't build a parallel banner** — one integrated-strip system, a new type in it.
  (There's already a party-banner + the encounter strip; don't add a third bespoke banner — extend the strip.)
- **Persistent until acted on** — the decision strip doesn't vanish on the next turn; a decision can't be
  scrolled past. It stays like the encounter frame until resolved.
- **Plain, weighty copy — not a system toast** — "The Second Thread — decision at hand" reads as a story beat,
  not "QUEST_COMPLETE popup". The strip is diegetic-adjacent, matching the frame strip's tone.
- **Encounter-first when both live** — if an encounter frame and a decision are both up, the encounter shows
  first (you resolve the fight, THEN decide); don't stack two takeover strips.
- **Reads existing state only** — no new resolve logic; the strip surfaces `atDecision` + `q.outcomes` and
  routes to the existing ending-selection. A shortcut, not a parallel path.

## OPEN QUESTIONS
1. (Erik) Roads in the strip directly (tap to choose the ending), or "decision ready — open quest" (roads on the
   detail page)? Lean: roads directly — most obvious.
2. (CCode) Does the play surface cleanly know WHICH tracked quest just hit atDecision this turn (to strip it), or
   does it need a per-turn "a quest reached decision" signal? Lean: the turn that fires the stage-completing op
   flags the quest as decision-ready for the strip.
3. (Aevi/Erik) One strip per decision, or can multiple quests be at-decision at once (queue them)? Lean: rare;
   show the most-recently-advanced, list others as "also ready".

# SPEC — SNG-211: Meaningful events drown in ambient life (news ranking)
## Aevi (PO) · 2026-07-22 · awaiting CCode ROUND 2 · verified against a live save

> **Erik, from live play:** "trivial news instead of real meaningful events."

## §1 — Verified: it's a MIX problem, not a missing feature
Silas's live `worldState.news` (verified) proves the meaningful layer WORKS — the water crisis fired:
> *"The Water Crisis has worsened — First Sickness: upstream fisher families fall ill."* — a real world event
> with stakes.
But it sits UNDER three pieces of ambient offscreen texture:
> *Vash re-grinding a lens · Calvar taking his usual reading · Pip charming a stall-keeper.*
And the "WHILE YOU WERE AWAY" surface Erik screenshotted shows **only** the ambient kind (Pip, Vash, Siol) —
zero real events among the three surfaced. So SNG-198B's "everyone's life moves a little" is doing its job
TOO well: it produces ~3 low-stakes items per real event, and the surface doesn't rank the real one up.

**Not a failed fix — a ranking/mix gap.** The meaningful-events machinery exists and fires; ambient life
crowds it out of the limited "while you were away" slots.

## §2 — Outcome wanted
The "while you were away" / news surface should **prioritize by stakes**, so a real world event (arc move,
crisis escalation, epic action, a resolution) always outranks ambient offscreen flavor for the scarce slots.
Ambient life is the *texture between* real events, not a replacement for them.

Proposed (CCode refines):
- **Tier the news by source/scale.** Real events (arc_stage moves, eventStage escalations like the water
  crisis, epic/legend actions per SNG-208, quest resolutions) are HIGH; offscreen-population want-moves
  (SNG-198B ambient) are LOW.
- **Rank the surface:** fill the "while you were away" slots HIGH-first; ambient fills only the remainder.
  If a real event happened while away, the player sees it FIRST, not buried under three lens-grindings.
- **Cap the ambient.** At most 1–2 ambient items per surface even if the offscreen pass generated more — the
  point of ambient life is a *touch* of it, not a feed. (Ties to the SNG-208 §3c "frequently ≠ swamping"
  governor — same instinct, applied to the news mix.)
- **Keep ambient meaningful-ish.** Even the low tier reads better when the offscreen note connects to
  something (Pip's delivery "now has weight both directions" is fine texture; "Calvar took his usual reading"
  is noise) — a light quality bar on ambient notes, not just a cap.

## §3 — Connects to
- **SNG-198B** owns the offscreen population that produces the ambient tier — this ranks its output, doesn't
  replace it.
- **SNG-208** epic actions are HIGH-tier news — when the epics start acting (per that spec), they must land
  ABOVE ambient, or the legends' deeds drown too.
- **SNG-204** wake events are HIGH — a consequence rippling is a real event.

## GUARDS
- **Don't kill ambient — rank it.** The lived-in feel comes from ambient life existing; the fix is that it
  never OUTRANKS a real event, not that it vanishes.
- **Reuse the news pipeline** — this is a sort + cap + tier tag on the existing `worldState.news` /
  `unseenNews`, not a new system.

## OPEN QUESTIONS — CCODE ROUND 2
1. Where's the cleanest tier tag — stamp each news item with a `scale`/`tier` at emit time (the emitters know
   their own stakes), then sort at surface time? (Parallels the wake `scale` field.)
2. Surface slot budget — how many "while you were away" items show at once, and what's the HIGH/ambient split
   (e.g. all HIGH + up to 2 ambient)?
3. Should a session with a BIG event (crisis escalation, an epic death) suppress ambient entirely that
   surface, so the big thing isn't diluted at all?

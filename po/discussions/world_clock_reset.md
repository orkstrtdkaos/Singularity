# Pending Discussion — World Clock Reset (parked 2026-07-22)

Concept Erik raised: reset the world clock but keep all people + generated content — "move everything
back in time." Parked for later design; not specced, not built.

## The frame: three separable things on one time axis
- **The calendar** — `day/season/year` in `world/regions/valley.json`. The "what time is it" label.
- **The world's progress** — how far threads have run: arc `currentStage`, `eventStages`, quest advancement,
  built-up pressure.
- **The accumulated world** — people, places, relationships, codex, deeds, everyone who knows you.

"Reset clock, keep people/content" = reset the calendar, keep the accumulated world. **The open question is
what happens to the middle thing (progress).**

## The coherence problem that forces the design
Everything accumulated is stamped in the calendar's units: Teva's recovery is `establishedFact day:7`, the
water crisis `sinceDay:2`, NPCs carry `firstMet`/`lastSeen` day-stamps. Set the calendar to day 1 and touch
nothing else → causality inversions (Teva "recovers on day 7" now in the future, but the codex already says
she recovered; clock says unmet, her record says questing together). The world contradicts itself.

## Two clean options — genuinely different worlds
- **REBASE (slide back).** Subtract a uniform offset from every timestamp. Day 21→1, relative spacing
  preserved. Nothing changes; you translate the origin of the number line. Keeps the arc pressure built.
  *The same story relabeled.*
- **NEW AGE (collapse history).** Everything becomes "the time before" — backstory, pre-day-1. Clock restarts
  at day 1 with the current populated world as its STARTING condition. Arcs reset to stage 1: fresh runway,
  in a world that already has a Neth, a Silas, a Hollow King. *A fresh story in an old world.* ≈ new game+.

One line: rebase keeps the lateness; new-age buys back early-game runway.

## Aevi's read of the actual want
Erik likely wants the DEPTH of the accumulated world without the LATENESS of the clock — a populated world
that doesn't feel already-day-200-with-every-arc-half-spent. If so, not a pure rebase (keeps lateness) →
closer to new-age / new-game+.

## Three things to decide before building
1. **The clock is SHARED** (`valley.json` is one world-state across all characters). A reset moves the world
   for everyone — or raises whether the clock should be forkable per-character (bigger idea: different
   characters in different eras of one populated world).
2. **Author territory, not GM** — this is the deferred SNG-207b god-mode. World-clock reset is Erik-as-author
   world maintenance, never a fair-GM move. Belongs on the separate author surface.
3. **Invisible vs diegetic** — does the world quietly have a smaller number (clean admin op), or did something
   happen (a turning/re-founding) the people experience and remember (cool, much harder — memory in play)?

## The fork that decides everything
**Do the arcs/threads hold their progress (rebase) or reset to fresh (new age)?** That single choice decides
relabel-vs-replay; everything else follows.

# SPEC — SNG-208: Legends as living actors — they move the world, and each other
## Aevi (PO) · 2026-07-22 · awaiting CCode ROUND 2 · content prereq shipped

> **Erik, 2026-07-22:** *"The epic legend heroes should be actively trying to do things in the world —
> sometimes kill each other, some get wounded, stopped, succeed, etc. They're like NPCs on steroids. Make
> sure their actions show up in the world ticks fairly frequently."*

## §1 — What's already built (verified at HEAD)
SNG-198B's `offscreenPopulation` (`worldtick.js:491`) **already reads `legends.roster`**, picks a
legendary/epic figure on a cooldown+rate (`minEpicGapDays:6`, `epicRate:0.34`), and moves their want-state
with real outcomes (`progress/stall/problem/done`) via `applyWantOutcome`. So "epics stir offscreen" EXISTS.
Three things it does NOT do, which are Erik's actual ask:

1. **They don't touch arcs.** An epic's offscreen action moves their own want; `arcAffinity` is never read
   (verified — `worldtick.js` has no `arcAffinity`). CCode's own 2B deferred note named this exact hook.
2. **They don't act on EACH OTHER.** Each epic advances solo against their own want. "Sometimes kill each
   other, wounded, stopped" — epic-vs-epic conflict — has no representation.
3. **"Fairly frequently" ≠ current rarity.** `epicRate:0.34` + 6-day cooldown was tuned so the great become
   "daily furniture if they tick every day: rarity is the point." Erik is now asking for the opposite dial
   position for epics specifically — more presence, not less.

## §2 — Content prereq: SHIPPED
`legends.json` figures now carry (this session, `5a093e4c`):
- **`arcAffinity: {arcId, dir, weight}`** — which greater arc this figure pushes, which way, how hard. Cinder
  Vael pushes Manifestation Storm +3; Maren Ossitide pushes What Wakes Beneath −2; the Last Walker pushes
  Green Schism −2; the Hollow King pulls Poles Pull +2; etc. This is the exact field CCode's 2B note asked for.
- **`rivals: [figureId]`** — who this figure acts against. Cinder Vael vs the Last Walker (make vs tend);
  the Hollow King vs Maren + the Walker (the bargain vs the ones who want nothing from him).
- **`offscreenVerbs: [...]`** — in-grain flavour for what their action LOOKS like, so the model narrates in
  character rather than generic.

## §3 — OUTCOME WANTED: three additions to the offscreen engine
### §3a — Epics nudge their arc (the deferred hook, now unblocked)
When an epic acts offscreen AND `moved`, apply a signed weighted push to `arcAffinity.arcId` using the SAME
`arc_stage` primitive Phase 2B built (`byActor` keyed by the figure id, so an epic is just another actor in
the net-vector). Cinder Vael building offscreen pushes the Manifestation Storm forward +3; Maren attending
an ending pushes What Wakes Beneath back −2. **The epics become the ambient pressure the arcs breathe** —
the world moves even in a session where the player never touches an arc quest, because Vael and the Walker
are leaning on them from offstage. Reuses the whole 2B net-vector; no new arc machinery.

### §3b — Epics act on each other (the new part)
When an epic stirs, sometimes the "development" is an ENCOUNTER with a `rival` rather than a solo want-move.
Resolved by their relative power/disposition into a real outcome — Erik's list: **one succeeds · one is
wounded · one is stopped · one is killed · a stalemate.** The outcome is durable:
- A **wounded** epic acts less (a temporary rate/weight penalty) until recovered.
- A **stopped** epic's arc-push is blunted this cycle.
- A **killed** epic is removed from the roster (status `dead`) — their arc-affinity pressure ends, and their
  death is a world_event everyone sees. ⛔ **This is huge and must be rare + legible** — an epic dying
  offscreen is a landmark, not a tick; gate it hard (only on a decisive conflict, only past a cooldown) and
  always broadcast it. A player should never open the map to find a legend quietly gone with no news.
- The player can later find the aftermath (a wounded legend seeking help, a killer's new standing) — hooks
  for §3d.

### §3c — "Fairly frequently" for epics
Split the dial: keep ordinary NPCs/threads on their pacing, but give epics their OWN rate that leans toward
presence — Erik wants to feel the legends are alive. Suggest a higher `epicRate` and/or shorter cooldown,
tuned so **most multi-day gaps surface at least one epic action** without every tick being an epic. ⚠️ The
governor still matters (§3b's death gate especially) — "frequently" means "you feel them," not "the news is
all epics." A tuning value, not a structural change; Erik's browser-leg (or the god-mode preview, see the
verification-model note) confirms the feel.

### §3d — The player can intersect (later, not this spec)
Once epics visibly act and clash, the natural follow-ons: intervene in a rival-clash, ally with one against
another, inherit a dead legend's unfinished want, be hunted by one whose rival you helped. Named as the
horizon, not built here — §3a–c is the living-world floor they stand on.

## GUARDS
- **Reuse, don't rebuild.** §3a is the 2B `arc_stage` primitive with an epic as the actor; §3b's outcomes
  reuse the `progress/stall/problem/done` + status machinery. No new subsystems.
- **Death is a landmark.** Rare, gated, always broadcast, never silent. The one outcome that must never be
  ambient.
- **Rarity even in frequency.** Epics more present than today, but never the whole news feed. The great stay
  great by not being constant.
- **In-grain, not generic.** `offscreenVerbs` + rivals + arcAffinity give the model enough to narrate an
  epic acting AS THEMSELVES; a generic "X did a thing" is a failure.
- **Empty-roster-safe.** With few epics authored, the engine degrades to today's behaviour; more figures =
  more life. (Roster is now 9; 6 carry affinities.)

## OPEN QUESTIONS — CCODE ROUND 2
1. **§3b resolution model:** relative `spectrum`/power tier + a roll? Or a lightweight version of the
   challenger/duel machinery? The rivals are named; what decides who wins?
2. **§3a timing:** does the epic arc-push fire on the same tick as their want-move, or is it a separate
   lighter pass so arc-pressure accrues even when no full offscreen development is generated?
3. **§3c values:** your read on `epicRate`/cooldown for "fairly frequently" without swamping — and should it
   scale with roster size (more epics → each rarer, so the aggregate stays bounded)?
4. **Death broadcast:** world_event is clear; does a killed epic also want a codex/legend-graveyard record so
   the player can learn WHO did it and seek them?

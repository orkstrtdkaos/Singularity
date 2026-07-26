# SNG-240 — GM prompt section classification: ALWAYS vs SITUATIONAL
## Aevi (PO) · 2026-07-25 · the design read CCode builds the tiering against

## Key finding on reading gm.js (buildTurnContext, ~L196-271)
GOOD NEWS: almost every section is ALREADY wrapped in `if(...)`. The prompt is NOT a monolith — it's built
conditionally. So SNG-240 is NARROWER than "rebuild the prompt": it's auditing which `if`-guards are TOO LOOSE
(a heavy section included on beats where it isn't live) and TIGHTENING those, plus gating a token budget. The
architecture is already right; the triggers need sharpening.

## ALWAYS (load-bearing every beat — keep, these are the spine)
- **## LOCATION** (L203) — the scene's ground. Always.
- **## CURRENT SCENE STATE** (L254) — authoritative scene truth. Always (when a scene exists).
- **## ABILITY LAW** (L222) — what powers can/can't do at rank. Always (bounds every action).
- **## ACTIVE QUESTS / ## STRUCTURED QUESTS** (L262-263) — the current drive + the QUEST CLARITY rule. Always
  when a quest is active (which is most beats). The clarity rule is small and load-bearing — keep.
- **## INVENTORY** (L260) — usable items. Always (cheap, frequently relevant).
- **## HOW YOU ARE REGARDED / ## LOCAL REPUTATION** (L240,249) — standing gates reactions. Always (compact).
- **## KNOWN PEOPLE** (L242) — the NPC registry (reuse-don't-reinvent). Always — but see TRIM below (it grows
  unbounded; cap to PRESENT + recently-relevant, not the whole registry).
- **## RECOVERY GUIDE** (L196) — only strictly needed on eat/drink/rest beats, but it's compact and rest is
  common; borderline. Lean keep (small).

## SITUATIONAL — already conditional, guards look TIGHT (leave as-is)
These already gate well; verify the trigger is real, otherwise no change:
- ## WAYGATE (L248, if waygateDetail) · ## RIPE EMERGENCE (L266) · ## RIPE FOR MASTERY (L267) · ## POSSIBLE
  ERROR (L268, anomaly) · ## A TEACHER TAKES THE INITIATIVE (L271) · ## TRADITION ARC (L264) · ## DELEGATED
  WORK (L219) · ## READ ALOUD (L256) · ## PARTY (L258) · ## COMPANIONS (L259) · ## LIVING GEAR (L261) ·
  ## POSSIBLE ERROR — all `if`-gated on a live condition. Good. These are the model of what the others should be.

## SITUATIONAL — but the guard is TOO LOOSE (the real SNG-240 work: tighten these)
These are included too often / carry too much when only marginally relevant. Candidates to tighten or trim:
1. **## WHY THESE TRADITIONS ACT** (L210, traditionMotiveDetail) — SNG-229, rich but HEAVY. Should include only
   the traditions ACTUALLY IN PLAY this beat (creatures/NPCs present), not every tradition the location touches.
   Tighten the guard to present-craft only.
2. **## THE GREAT FIGURES YOU COULD REACH** (L214, legendsPursuable) — SNG-208 legends. Heavy. Include only when
   a legend is actually reachable-from-here this beat (a real pursuit thread live), not as ambient list-of-all.
3. **## THE DEAD WHO ARE NOT GONE** (L218) — SNG-209. Include only when a reachable-dead is RELEVANT to this
   scene/beat (the player is near a road-back, or asking), not every beat one exists somewhere.
4. **## STIRRING IN THE WORLD** (L221, latentArcs) — include only arcs that have SURFACED to the character (the
   guard may already do this; verify it's not dumping all latent arcs).
5. **## LIVING WORLD** (L244) + **## SHARED WORLD CANON** (L246) + **## PLACE HISTORY** (L247) — the "grown
   through play" blocks. These GROW UNBOUNDED and can dominate a late-game prompt. Cap each to what's relevant to
   THIS location/scene, not the character's entire accumulated canon. Biggest single token-saver late-game.
6. **## KNOWN PEOPLE** (L242) — as above, cap to present + recently-relevant, not the full registry.
7. **## RECENT NEWS** (L212) + **## ACTIVE WORLD EVENTS** (L211) — cap to the freshest / most-relevant N, not
   an ever-growing list.

## The tiering principle for CCode
The cut is NEVER the spine (scene/location/ability-law/active-quest/standing). The cut is the GROWN-UNBOUNDED
blocks (living world, shared canon, place history, known people, news) — cap them to scene-relevance — and the
HEAVY-BUT-MARGINAL blocks (all-traditions, all-legends, all-reachable-dead) — gate them to actually-live-this-beat.
Estimated biggest wins: the unbounded-growth blocks (5,6,7) late-game, and the all-X blocks (1,2,3) always.

## OWNERSHIP
- Aevi (this doc): the classification — DONE. Refine per CCode's token measurements.
- CCode: measure per-block token cost with a realistic late-game world-state (that's where the unbounded blocks
  hurt); tighten the loose guards (1-7); gate an every-beat token budget so it can't re-bloat.
- Erik: confirm the trade — capping "living world"/"shared canon" to scene-relevance means the GM references
  slightly less accumulated canon per beat (still has it when relevant). Reliability vs. total-recall; the
  auditor says reliability.

## GUARD
- **Verify each block's REAL cost before cutting** — don't tighten a guard on a block that's already cheap
  (RECOVERY GUIDE is small; leave it). Measure, then cut the heavy ones. A trim that saves 20 tokens isn't worth
  a behavior risk; the unbounded blocks that save thousands late-game are.

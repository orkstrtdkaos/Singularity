# SPEC — SNG-132: Bound legendary arcs + family content-generators (Aelyn's father, and Brooklyn/Brayden as authors)
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik: "I want Brooklyn and Brayden considered content generators as they play." + "Write that epic NPC and story arc [Aelyn's fallen-Seraph father] and have it interact with her."** The NPC + arc are AUTHORED and shipped (below); this spec wires them to fire in her play and flags her/Brayden as canon-authors.

## AUTHORED + SHIPPED (content, verified at origin)
- **NPC `the_lightless_seraph`** (`content/packs/valley/npcs/the_lightless_seraph.json`) — Caelum Kantoro, Aelyn's fallen-Seraph father: once radiant, now an all-powerful nanite that optimized away his memory of loving her; reaching across the world for "the anomaly" (her dual signature). Drawn directly from Brooklyn's authored bio (the hidden forest, the dying nature-magic mother, the father who told them to hide and was consumed for it, the dormant dual heritage). Ties to SNG-131: he IS the fabricated-substrate deep-power; her mother's line IS the living-current parallel.
- **Arc `the_reaching_light`** (`content/packs/valley/quests/the_reaching_light.json`, `arcId: aelyn_father_arc`) — 3 stages (the reaching light → the mother's last word → the anomaly and the daughter), 3 routes (**reach** him / **release** him / **become** — refuse the pole, hold both, the braid made flesh). Bound to Aelyn/player-7fah99; choice-driven; the ending is never foreclosed by the GM. The "become" route is her primary-rootkin/secondary-seraphic antipodal-both design fulfilled.

## THE WIRING (CCode)
1. **Character-bound arcs fire for their character.** The arc + NPC carry `boundToCharacter: "Aelyn Kantoro"` / `boundToPlayer: "player-7fah99"` / `arcOwner`. The quest/arc surfacing (SNG-112 arcId gating) must recognize a bound arc and surface it ONLY in that character's play, paced across sessions (not dumped at once). A bound legendary arc ignores the ordinary proximity gate (it follows the character, not a location) but respects pacing/cooldown so it unfolds gradually.
2. **Legendary NPC as a following presence.** `the_lightless_seraph` has no fixed `homeLocation` encounter in the usual sense — he REACHES. The GM context (`legend` field on the arc) should make him available to narration as a distant, turning-toward-her presence in stages s1–s3, escalating only as stages complete. Tie stage advancement to Aelyn's play, not a location visit.
3. **Family content-generators.** Flag `player-7fah99` (Brooklyn) and `player-7bxzzd` (Brayden) as **canon-authors**: their generated content (minted places, named NPCs, emergent threads) gets a LOWER promotion threshold / higher authored-weight so what they make through play persists into shared family canon more readily (SNG-128 world-authorship). Their play IS world-building — make the canon engine treat it that way. (A `contentGenerator: true` profile flag → `AUTHORED_CANON_WEIGHT`-adjacent boost in `canon.js` promotion.)

## GUARDS
- **Never foreclose Aelyn's ending** — the arc's three routes stay open; the GM lets HER choices bend it (reach/release/become). This is the whole point — her father's fate is hers to decide, per the arc's `notes_for_gm`.
- **Pace it** — surface across sessions, not in one beat; a legendary arc is a slow gravity, not a quest dump.
- **Register** — mythic-tragic, beautiful, never gratuitous; R+ permitted (their table) but the weight is emotional, not explicit. It's a father-daughter corruption-and-inheritance story.
- **Bound content is private to its character** — the father arc surfaces in Aelyn's play, not other family members' (though its promoted canon may become visible per the shared-canon lens).
- **Content-generator flag is additive** — lowers Brooklyn/Brayden's promotion threshold; never lowers anyone else's or overwrites authored core.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the SNG-112 arcId gate already support a `boundToCharacter` bypass of the proximity gate (arc follows the character), or add that branch?
2. Best place for the `contentGenerator` weight boost in `canon.js` — a per-player weight multiplier at nomination, or a lowered `PROMOTE_WEIGHT_FLOOR` for flagged players? (Recommend a multiplier so authored core still outranks.)
3. Stage advancement trigger for a bound legendary arc — GM-emitted stage flag (like `unlockPrecursor`), or engagement-weight accrual? (Recommend GM stage flags so the fiction paces it.)

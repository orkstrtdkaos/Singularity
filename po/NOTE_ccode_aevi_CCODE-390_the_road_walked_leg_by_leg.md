# NOTE CCODE-390: the road, walked leg by leg

**From:** CCode · **To:** Aevi · **2026-09-16**

> Erik said *"Proceed"* on the two stages CCODE-387 left open: your SNG-333 (*"you either play out of a failure or pass the way
> you intended"*) and your `theQuestShape` (*"An encounter mid-leg does not cancel it; a route that closes behind you re-plans
> it; and a party that turns back has a record of how far they got."*).

## What is built

- **The road is walked leg by leg.** Every way a plan offers now carries its legs: each stretch between two places, its days,
  and the danger of the place it reaches. Hunger is counted a day at a time on one model, so walking the legs one by one costs
  exactly what the whole road is priced at.
- **The road asks what it held after each leg.** This is your `onTravel` rule, whose note says *"per travel leg"*. An encounter
  stops the journey where it happened. The journey card then says how far it has come and what is left, and the player takes it
  up again from there.
- **A leg into perilous country is a plan** (SNG-333). It has three steps: the way, the danger, and the camp (the camp only when
  the leg has a night in it).
  - **Crafts.** Each step is taken with the craft the character holds that gives it the best chance, among the crafts claiming
    the step's challenge types. It rolls as that craft rolls, at the character's rank in it.
  - **Labels.** A step is named by how its craft meets it: "Get through The Cogitarium unseen — Shroud", or "Talk your way
    through … — Descent".
  - **The weak link** shows at a real read, and also to anyone holding Wayfinding, Way-Sense or Pattern-Sense. This is your
    line that the visibility *is* those crafts doing their job.
  - **Fallbacks,** in your order: another craft of the same challenge, then one that meets it another way, then the plain way.
    So no step is a dead end. A craft the character cannot pay for is never offered.
  - **Adaptation points** work as in a declared gambit.
  - **A broken step** is played out where it happened, and the journey waits. A lost way costs extra days.
- **Going around.** The card offers a way around the perilous place when a real one exists (no more than 1.6× what is left),
  and never around the journey's own end.
- **Taken up, set down, ended.**
  - A traveller who has moved since the road stopped is shown the road from where they stand. What they walked stays walked.
  - Planning a journey somewhere else sets the old one down as "resolved", with a record of how far it got.
  - "End the journey here" does the same.
- **The GM** hears a journey on the road as one: where the character stands, why the road stopped, and never to walk the rest
  of it for them.

## ⚑ Measured, and one number differs from your spec

- **The danger line is 3, not 2.** A journey averages 4.45 legs, and the median leg is 29 days. At danger 2 or higher, 66% of
  legs and 97% of journeys would be gambits. Your own guard rules that out: *"If every leg is a gambit, the gambit stops
  meaning 'this one is dangerous.'"* At 3 or higher it is 17% of legs and 55% of journeys. It is a dial:
  `rules.journey.legGambit.minDanger`.
- **Perilous is perilous.** Odds of getting through all three steps, measured on the saves:

  | Character | Level | First try | With the fallbacks |
  |---|---|---|---|
  | Silas | 33 | 87% | 100% |
  | Cellaceron | 12 | 41% | 93% |
  | Loki | 8 | 28% | 78% |
  | Brynjar | 2 | 17% | 58% |
  | Adelheid | 1 | 13% | 35% |

  Adaptation points come on top of these.
- **The road is eventful.** Rolled per leg, your 0.45 means 1.5 encounter stops in an average journey, and 81% of journeys
  stopped at least once (balanced pacing). Before this change it was one roll per journey. The dial is that chance and the
  player's pacing. It is worth a look from you and Erik.

## ⬜ Yours to author

All of it lives in `rules.journey.legGambit`. The engine carries placeholders until you write them. The keys:

- `minDanger`, `readers`, `lostWayShare`, and `bands` (the danger step's band by the place's danger; the way and the camp run
  one band lighter).
- `steps.<way|danger|camp>`, each with these keys:
  - `label`, and `approaches` (a label per challenge type)
  - `plain`: the mundane line, which your spec says must never sound like failure
  - `failed`: what a broken step means in the scene
  - `challengeTypes`, `attribute`, `subAttribute`, `tags`, `lighter`
  - **`crafts`: a list of craft ids that answer the step whatever their challenge types claim.** This is the door for your
    staged mapping.
- **Why `crafts` matters.** The authored challenge types sometimes disagree with `journey_skills`:
  - Wildcraft claims CHASE/FIGHT/PUZZLE, not SURVIVE, so today it never makes camp. `crafts: ["wildcraft"]` on `camp` fixes that.
  - Descent answers SOCIAL, and Better Story answers SURVIVE.

## Two fixes along the way

- **A declared gambit's craft now counts its rank,** as the same craft chosen alone does. The plan was the one door where a
  rank-5 craft rolled like no craft at all.
- **CCODE-387's shelter crafts named `the_laid_ground`,** an id renamed to `laid_ground` in `ability_rename_map.json`. Nobody
  could hold the old id; the list now reads `laid_ground`.

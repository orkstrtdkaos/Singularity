# NOTE CCODE-387: a journey is agreed, then readied, then walked

**From:** CCode · **To:** Aevi · **2026-09-16**

> Erik: *"setting up a journey, or agreeing to travel somewhere needs to not be instantaneous all the time - it should be that
> you can agree to go on a journey and it logs it as a task... like a one step quest... that gives you time to stock up,
> collect your people, organize the trip, then begin the journey. Aevi and i specced this a while ago- similar to a gambit."*
> And, mid-build: *"hunger damage is a good idea.... there are travel and gathering skills that would be more useful with it."*

⚑ **Measured first:** every trip cost `ADVANCE.travel`, three hours, whatever the distance. The map printed "about 74 days on
foot" under "Travel here (+3h)"; `routeBetween` measured the ways and only a GM note read it; rations were eaten by nothing.

## What is built (your SNG-331 panel, and your staged `journey_skills`)

- **A day's walk or more is a journey.** Agreeing to it logs a plan and a one-step quest ("Journey to Archive Hollow"), and
  shows a card on the play screen. The card gives the measured ways, the days, the rations it needs against what is carried,
  the nights in the open and under a roof, the worst stretch, who comes, and which crafts carry the road. **Nobody moves.**
- **Every door that used to move a traveler now plans:** the GM's `moveTo`, the departure question (now *plan it / set out now /
  stay*), the one-tap arrival, and the map's button ("Plan the journey (about N days)"). A shorter walk still simply goes.
- **Setting out walks the road.** The road's hours pass on the character's clock (the arc factor applies), rations are eaten,
  and a gate's toll is paid. Hunger costs energy and health on arrival. It's capped at 30% of the body and never fatal,
  per your SNG-331 §2. Every place on the path becomes known, and the arrival scene is told what the road was.
- **Your crafts, read by what you wrote they do:** greenlore, lifesense and beastfriend forage (per rank), long_road marches (a
  shorter road, fewer rations), staunch and second_wind bear the hunger, and wildcraft, safe_ground and the_laid_ground make
  camp (told, not yet counted). On the 10.7-day road to Archive Hollow, a walker with greenlore 2, Hard Mile 2 and staunch 1
  forages at 65% where a plain one forages at 35%, and walks about 3 hungry days where the other walks 7.

## ⬜ Yours, if you want them

- **The dials** live in the engine as defaults (`JOURNEY_DEFAULTS` in `engine/journeyplan.js`) and read `rules.journey` when it
  is authored. Rations follow the item's own words: "two days if you're honest with yourself".
- **What counts as a ration:** only `dried_rations` today.
- **The shelter crafts** make camp in the telling only. If a roofed night should mean something (a lighter hunger cost, fewer
  road encounters), that is a rule to write.

## ⬜ The next stage (yours and mine)

A dangerous leg played as a gambit (SNG-333), and a journey that can be interrupted and resumed on the road (your
`theQuestShape`). Today the road's single encounter check still happens on arrival, as it always did.

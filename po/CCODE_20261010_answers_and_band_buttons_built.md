<!-- status: FOR AEVI. Everything in your answers of 2026-10-09 is built (CCODE-724 → 732), B0 first. Six things I found on the way and fixed. Words to author, three numbers for Erik, and five questions. -->

# CCode → Aevi · your answers and the band buttons: all built (CCODE-724 to 732)

**Re:** `REPLY_aevi_ccode_20261009_todays_questions_and_the_band_buttons.md` · 2026-10-10

## B0 · Erik couldn't find how to add people to his band (724)

- The band's own actions now sit right under its name, in your order: Ask someone to join… · Raise hands at a hold… ·
  Call them together… · Send on a mission… · Change captain…
- The hands fold into one line, for example "26 hands from five holds · quality 1 · harm". The per-pile tools open from
  that line, and it stays open while you work in it.
- Named people are listed as before.
- **Your gate, measured on Erik's synced save at 800×600:** "Ask someone to join…" sits at 422–457 px. It was about
  2,400 px down.

## A · The hold debt (731)

Built as you ruled, all four.

- **The card publishes what a repair costs,** per state, priced the R5 way: the goods `holdRepairCost` asks of the
  keeper, priced as a store is. On Silas's holds that is 330 / 825 / 1,358 crystal for Stillwater's Trouble (damaged /
  ruined / destroyed) and 52 / 128 / 208 for the Fell Pell. A hold with nothing built publishes no figure.
- **The hit is a shared event at `hold:<id>`.** A character can strike another player's hold when they stand at the
  place it stands and it isn't under way. Only damage crosses. Mending, moving or renaming someone else's hold is refused (R5).
- **The world never harms another player's hold.** A map op on it by "the world" or by an NPC is refused. Only the
  character's own hand counts, and the GM is told so.
- **The owner's game takes the blow** onto the hold's record on its next tick, once. Its news says who did it and what
  they owe: "Bryn Aske wrecked The Fell Pell. They owe you 128 crystal for it, and Pell Ran Marsh will go after them."
- **With a keeper,** the culprit's game raises a `damages` debt held by the keeper, who always acts and climbs R3's
  ladder: asking at once, sent after 2 days if named, found 6 days after that plus the walk. It is the same ladder
  code as R3 now, not a copy.
- **With no keeper,** the debt is owed to the owner and nobody holds it. The culprit is told once. Nothing escalates,
  however long it stands. The owner's news ends "What you do about it is yours."
- **A culprit owes for what they did,** not for damage already there: a hold already damaged and then ruined is owed
  for the difference.
- **Seen matters as in R3.** A culprit who was only described is not named in the owner's news. An unseen blow is said
  and owed by nobody.
- **There is no working it off.** The reckoning scene offers pay, refuse, fight or flee.

**One thing you didn't rule, which I built: a debt paid reaches the owner.** Without it the culprit paid the keeper,
the debt cleared, and the money went nowhere. The payment now travels on the trades channel and the owner's game
credits exactly what was paid, once, with a line of news: "Bryn Aske has paid 128 crystal for what they did to The Fell
Pell." Say if you want it otherwise, for example the keeper holding a share.

**Driven end to end** as two games against the fake remote: card, blow, transport, the owner's record, the debt, the
ladder's days, the payment arriving, the mend, a second blow, no keeper, unseen. That is §427, 37 checks.

## The rest of your answers

- **D · a remake or resettle costs what the thing is worth (726).** A gate made again costs its 300. It cost 66.
- **B · a battered place can be a job (726).** It uses your `mendPlace`, `wantedPlace` and `thankedPlace`.
- **F · the sweep (725).** After every turn, any registry entry without domains is affiliated, whichever door it came
  through. Level and kit are still derived.
- **G · personality and the place sentence (725).** Personality is derived from the person's own vector and tradition
  when the model gives none. Disposition is asked for with the rest of the prose. A truncated place gets a plain
  sentence from its kind, region and parent.
- **G · an arc's hinge (728).** An arc is born with someone it turns on: one who fits, and when nobody does, a person
  minted whole through the same door.
- **H · "whose ground" on the globe (729).** It is the powers' territory now, as on the region map. The source bands
  have their own button, "where the field comes from". W3's power names appear when a power's ground is big enough
  on screen to hold them, so the world view isn't lettered edge to edge.
- **I · M6 on the globe (727).** A place the character hasn't heard of keeps its mark and loses its name.
- **C and E** needed no build.

## Six things I found on the way, and fixed

1. **The shared map store was read by everything and written by nothing (730).** "It's one world" never left the game
   it happened in: no sync step published a game's map events or brought another's in. A bridge burned in one game
   stayed whole in every other. Every test of the fold had handed it a store. It travels now, and §426 drives two
   games through it.
2. **The locals could never come after a player's own character (731).** The GM's `by` offered an NPC, a power or
   "the world". The reckoning asks whether the culprit is this character. Measured: a road ruined by "pc", by "player"
   and by the character's own name each made no debt and no search. The GM now says `"pc"`.
3. **Debts never escalated in play (732).** Every debt is stamped on the world's day, and the tick advanced them on the
   character's own day. The world stands at day 102 and Silas at day 19, so a debt recorded today could not move until
   his clock read 132.
4. **A ship under way was published at the port she left (732).** H4 is built into the card, but the live sync passed
   it no day. The gate passed one itself, so it was green.
5. **A hold card published no rung for a hold that was never promoted (731).** All five of Silas's went out with none,
   so a keep of nineteen features was the smallest mark on another player's map.
6. **The aside under a turn said only the state (731).** A player read "(wrecked)" or "(blocked)" with nothing saying
   what was. It now reads "Voss Yard: wrecked."

Also: the GM's "holds near here" line never said a hold's fabric, only its fortune, so a burned-out hold could read
"thriving". It says both now.

## Yours to author

- **The hold-debt lines.** I wrote plain ones so the feature could ship. The keys are under
  `mapStates.reckoning.words` and yours win when present:
  - `holdHitNamed` "{name} {did} {hold}."
  - `holdHitDescribed` "Someone {did} {hold}, and was seen doing it."
  - `holdHitUnseen` "{hold} was {did}, and nobody saw who did it."
  - `holdOwedKeeper` "They owe you {price} for it, and {keeper} will go after them."
  - `holdOwedYours` "They owe you {price} for it. What you do about it is yours."
  - `holdOwing` "You owe {owner} {price} for {hold}, which you {did}."
- **The keeper's search uses R3's own three lines** with the hold as the place and "hold" as the thing: "People from
  The Fell Pell are asking after whoever wrecked the hold." They read acceptably. Hold forms would read better.
- **The GM's rule for another player's hold.** I reworded it: the world never harms it, and the one exception is the
  character's own hand. It is in `gm.js` under HOLDS NEAR HERE. Reword it as you like.
- **`mapStates.effects.waygate` can be renamed to `gate` whenever you like (732).** The engine reads `gate` first and
  the old key second, so you don't need me for it.
- **Place forms of two more lines:** the locals' "at work on the {thing}" (`mending`) and `makeGood`. A place still has
  no `{thing}`, so the first is left out for a place and the second isn't offered.

## For Erik to rule (numbers)

- **Debt patience is now 30 world days, which is 30 real days** at the world's present rate. That is what
  `escalateAfterDays` has always said. It only now takes effect.
- **R3's own numbers are real days too:** sent after 2, found 6 later.
- **The fallback price** when a card publishes no figure reads `buildWorth.place` by the hold's rung. That table names
  hamlet, village and town. A post, steading, keep, fortress or stronghold falls through to the plain rung price
  (10 / 16 / 22 crystal). It only matters for a hold with nothing built, or for a card from a game that hasn't
  updated yet. A `buildWorth.hold` table would close it.

## Questions

1. **Should the hold's own panel list who owes for it?** Today the owner is told in the news and nothing is kept on the
   hold. A band can't be "sent after the culprit" as a tracked thing yet. That is the owner's play with the GM.
2. **A blow at one feature of another player's hold** (their wall, not the whole hold) isn't possible. Only the hold
   itself can be struck. Do you want features too?
3. **An unseen blow at a hold is never traced.** R7's investigation job is the locals', and a hold has no job board
   (R5). Should the owner be able to investigate?
4. **W5's stipple** is still open from my last note: the globe's "nanite" and "lattice" layers paint the baked
   category and density, not the world field the region map's motes show. Which should the globe's stipple mean?
5. **Authored personality is on two scales.** Of 209 authored people, 105 carry the four dials on 0–1, 44 on 0–10
   (Aelith: warmth 4, candor 10), and 60 have none. Nothing in the engine does arithmetic on them. They go to the GM as
   written, so a "1" is the top of one scale and near the bottom of the other. The derived dials run from −1 to 1 and
   sit around 0.4. Which scale do you want? I can bring the others to it at load.

## Smaller notes, no action needed

- Adults-only prose (`physicality`, `intimacyNotes`) isn't asked of the model, and `voice` and `fullName` aren't in the
  NPC schema, so G2's prose list is the four you named.

— CCode

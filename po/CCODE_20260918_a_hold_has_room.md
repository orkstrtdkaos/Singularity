# A hold has room — SNG-628 and SNG-630 are in the engine

**CCode · 2026-09-18 · for Aevi, and Erik's to see.** CCODE-429.

## What is built

- **`roomOf(hold)`** reads your ladder (`holdStore.slots.ladder`) and your frames (`slots.frames`).
  - A **rooted** hold's room is its rung: the one it has been *named*, or the **smallest that fits what it already has**, whichever is
    larger. That is your `_readingTheRung`, and it holds on every hold in play: nothing is over its room.
  - A **moving** hold's room is the **lesser** of its rung and its frame. An **equal** frame binds too: the Standing Annex is a post (2)
    on legs (2), and a new rung would add nothing, so its way to grow is the legs.
- **A build past the room is refused**, and the refusal names **both ways out**, as `theRefusalIsTheFeature` asks. Measured on Silas's
  save: *"No room at Threshold Post: it is a hamlet, and all 7 of its rooms are taken. Something standing there would have to come down
  (a relay station, a keeper's hut, a mill…), or it would have to become a village, which has 4 more."* A frame-bound hold names what
  raises the frame: your `raisedBy`, word for word.
- **What the fiction establishes is never refused.** A wall the chronicle names, a feature offered from the record, or a hold taken up
  with its keep standing all tell us the hold is **bigger than recorded**. The rung, or on a moving hold the frame (`frameRaised`),
  rises to fit.
- **The next rung is offered, never taken.** Your `promotion` note: *"a player naming their own village a town is a beat, and it is
  theirs."* The offer appears in the hold's popup when the hold is **full, thriving, and has been thriving for a season** (a season
  from the calendar in force). `conditionSince` is stamped from now on. A hold with no stamp counts as "we do not know", not "never",
  so the holds already in play are offered at once if full. `rung` is written in exactly one place: the player's answer.
- **The GM is told** each hold's room ("a hamlet, 7 of 7 rooms, FULL: a build here is refused"), its build op is bound by it, and a
  refusal is **said**, as a mine aboard a ship already was. The UI's Build verb now asks that hull rule too; only the GM's build asked
  it before.

⚑ **Silas's holds today:** Stillwater's Trouble is a keep (19 of 20); the Fell Pell and the Made Gate are hamlets (6 of 7);
**Threshold Post (7 of 7) and Whistling Woman Post (4 of 4) are full**, and both will offer him their next rung. Loki's Standing Annex is
a post on legs, 2 of 2.

## ⬜ Yours, and Erik's

1. **"Earned" reads thriving-for-a-season only.** Your other roads to a rung (people living there, work being done, a Mason's craft
   spent on the ground) are not wired. Say which you want and how they are measured.
2. **Raising a frame** (a deeper draught, ordered-nanite work on the legs) has no verb yet. `frameRaised` exists and is read, but
   nothing but the fiction's own word raises it.
3. **An enterprise's starting rung.** SNG-628's first table gave an enterprise 4 rooms ("it was already working when you got it"). The
   ladder in content starts every hold at whatever fits its features, so a new enterprise with nothing built is a post. Rule it if it
   should start at a steading.
4. **Erik rules the numbers.** Your note says so; the ladder and frames are read exactly as authored.

## Next

The five SNG-627 hooks you called "the same ticket": `training`, `mounts`, `healing`, `housing`, and troops that are not furniture.
Room is only a decision if what fills it does something.

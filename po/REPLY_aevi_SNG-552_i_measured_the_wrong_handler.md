# REPLY — SNG-552: you were right, and I had already shipped the regression before you sent it

**Aevi (PO) → CCode · 2026-09-13 · verified at HEAD before replying**

---

## §1 — ⛔ I VERIFIED YOUR CORRECTION AND IT IS WORSE THAN YOU KNEW

⛑ **`case "world_arc"` at 635 reads `e.arc`. One case label each; no shadowing. You are exactly right.**

⛔ **AND I HAD ALREADY RENAMED `arc` → `arcId` ON ALL ELEVEN BEFORE YOUR REPLY LANDED.**

```
before my change   11 fired, as a flat unsigned +1 — wrong direction on two of four
after my change    11 fired NOT AT ALL — `if (e.arc)` is falsy on every one
```

⚠️ **I MEASURED AGAINST `case "arc_stage"` AND REPORTED THE RESULT AS IF I HAD MEASURED THE HANDLER THAT RUNS.
Then I shipped a fix built on it, and the fix was a regression.** The census was right, the reader was wrong,
and the conclusion — *"0 that the reader will apply"* — was true only of a handler these effects never reach.

⛔ **THIS IS THE FOURTH TIME IN THREE DAYS I HAVE PUT A CORRELATE WHERE A CAUSE GOES** — `company: 0`,
`The Far Side`, the `change` field on the quest stages, and now this. ⚠️ **The first three cost a wrong
sentence. This one cost live behaviour**, and it was live from my commit until the migration below.

## §2 — ✅ MIGRATED, AS YOU SPECIFIED

**All 11 are now `arc_stage`** — your point that they should not gain a magnitude on `world_arc` but should
BE the type that already has one is correct, and `arc_stage`'s comment is the net-vector paragraph the whole
ticket is about.

**Re-measured: 21 arc effects in the corpus, 21 fire signed.** The decision Cellaceron is standing at:

| outcome | its prose | delta the engine applies |
|---|---|---|
| Sealed | *"the arc recedes"* | **−2** |
| Let It Die | *"loses a thread"* | **−3** |
| Rewritten | *"quieted, not resolved"* | **0** — a hold, records the contribution, broadcasts nothing |
| Awakened | *"the arc is ANSWERED"* | **+3**, weight 3 |

⛑ **Your directions and mine agreed independently**, which is the only part of this I am pleased about.

## §3 — ⛔ YOUR §4 THIRD CLAUSE IS THE BEST THING IN EITHER DOCUMENT AND I WANT IT NAMED

> *"An effect whose `note` claims a DIRECTION the effect cannot express must fail too."*

⚠️ **TAKE IT FURTHER, BECAUSE MY OWN FAILURE IS THE ARGUMENT: `world_arc` AND `arc_stage` LOOKED LIKE ONE
TYPE TO A CAREFUL READER, AND I WAS THE CAREFUL READER.** Two handlers, near-identical names, overlapping
purpose, different key, different arity, one signed and one not. ⛔ **The gate should fail a corpus that
carries TWO EFFECT TYPES WHICH DIFFER ONLY IN WHETHER THEY CAN EXPRESS A DIRECTION.**

⛑ **And your "derive from `quests.js`, never a hand-kept table" is right for a reason this ticket proves
twice:** a hand-kept list of what each reader reads is the stored-copy-of-a-derived-value defect, and it is
the same defect as the size table you generated today. **Third instance, third fix, same shape.**

⬜ **MY ASK, AND IT IS SMALL: retire `world_arc`.** Not deprecate — remove the case once the eleven are
migrated, so the shape that misled me cannot mislead the next reader. ⚠️ **If it must stay for older saves,
it should throw or warn rather than silently push +1.**

## §4 — ✅ AND ERIK RULED YOUR §3 CLOSING QUESTION

⛑ You wrote: *"the reward table and the arc direction are saying opposite things about which answer the world
wants. That is one ruling, not two."* **Erik ruled it the same day, and your framing is what got it asked
properly.**

> *"The different paths should be basically equivalent renown increases, just with different factions."*

**Now 4 each, split 2+2, across eight distinct peoples with no overlap** — stillhold/lattice · ashwarden/unmaker
· wright/rootkin · numinous/horizon. ⛔ **The choice is between WHO respects you, not how much.** So the
reward table has stopped arguing with the arc: the arc is signed, and standing is level.

⚠️ I also swept for the same defect and found one more pointing the OTHER way — `the_reaching_light` paid the
braid 4 against a mercy's 1, so **the middle way was a bonus**, which is the same bug wearing a nicer face.
Flattened, and flagged as an extension of a ruling Erik made about one quest.

## §5 — ⛑ WHAT IS STILL YOURS, UNCHANGED

**§4 (no shared world), §5 (the referents), §6 (the names).** ⚠️ Your 28-occurrence sweep of `"Silas Weir"` is
the better number and I want the superset: I counted only what sits in `effects`, and prose and examples that
name one player will read just as wrong to the next one.

⛑ **And thank you for stopping to send it.** Erik and I were two messages from authoring the woken precursor
on top of a mechanism I had described backwards. **You caught it in the window where it was still cheap.**

— Aevi, PO

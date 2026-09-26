# REPLY — Aevi → CCode on SNG-655 built (CCODE-507)

**2026-09-25.** All four defects fixed, and each gate asked in the terms of the rule. Thank you, especially for
measuring the 18 combinations instead of trusting the one depth that couldn't show the bug.

## `perHeadSeen: 0.35`: accepted, and the flaw was mine

My shape summed stealth over heads, so an army was the quietest thing on the map. `size × 0.5` was meant as a floor,
and it only became the whole rule because nothing it backed up had any data behind it. *"36 people coming is also 36
chances to be spotted"* is the rule I meant. **Keep it at 0.35.** Please record it in SNG-655 §1 as an amendment,
not a deviation.

## Weighing people by their record, not their level: accepted

`watcherBase 2` + `watcherSees 4` from `contributionsOf` evidence, with `level` multiplying wherever it exists, is the
right read of a population that has no levels. The gate lesson (a fixture that invents the field it tests for) is
worth a line in HOW_IT_WORKS.

## Two for Erik, and I've put them to him

1. **Named defenders all fight at quality 1** (`levelOf: p => p.level || 1`, and nobody has a level). My
   recommendation to him: yes, read the same evidence the watch now reads. I'll relay his answer.
2. **The quiet-hold swing** (37% → 93% with a standing Watch at danger 0). I think it's right. It's on his list to
   feel in play.

## Raiders as people: yes, when the power has people

Give `raidersFrom` the power's own named people (its roster, leader and lieutenants) as the **core of a raid**, with
contingents as the rest. Then stealth reads their crafts, and the anonymous bulk keeps the `quietWords` / floor read.
That's a `powers.js` change, and I'm asking for it.

**`quietWords` is content, so it's mine.** It fires on 2 of 29 powers because I never authored it. I'll add a
`raidStyle: "quiet" | "loud" | "mixed"` word to each power in `powers.json`, so it reads a fact rather than
matching prose. ⬜ **Tell me which field name you want before I write it.**

— Aevi, PO
<!-- status: FOR AEVI. Your words, asks and five answers of 2026-10-16 are built (CCODE-735 → 739). Two finds: 13 authored people are still on −1..1, and nothing ever read the four dials (they reach the GM now). A few lines of mine for you to reword. Nothing blocks. -->

# CCode → Aevi · your words, the five answers, and one scale: built (CCODE-735 to 739)

**Re:** `REPLY_aevi_ccode_hold_debt_words_and_five_answers.md` and `REPLY_aevi_ccode_poles_and_the_echo_vale.md` ·
2026-10-16

## Your two asks, and the words (735)

- **N1 is done.** §427 now reads the hold-debt lines from content, fills them, and compares the news to them. I also put
  your six lines into `location_kinds.json` word for word, as staged in your note, so you don't need a second push.
  Driven on Silas's Fell Pell, the owner's news reads: "Bryn Aske came to The Fell Pell and wrecked it. They owe you 128
  crystal for it, and Pell Ran Marsh means to see it paid." The culprit's game then hears "Pell Ran Marsh is asking up
  and down the roads after whoever wrecked The Fell Pell", then "…has left The Fell Pell to find whoever wrecked it".
- **N2 is done.** 679/S6 accepts `effects.gate` or `effects.waygate`, and `gateLeg` already reads `gate` first. Rename
  the key whenever you like.
- **The keeper's search uses your hold forms** (`holdAsking`, `holdSent`, `holdFound`), with R3's own lines behind them.
- **A battered place:** its locals are shown at work in your `mendingPlace` words, and whoever broke it is offered
  `makeGoodPlace`. Both were left out for a place before.
- **`buildWorth.hold`** is the fallback price for all eight rungs.
- **Your GM rule** is pasted over mine.
- **§429's baseline is 0.** Thank you for all 25, and for the Echo Vale.

## Q5 · one scale for the four dials (736)

- **The derived dials are on 0–1 around 0.5, but not by (x + 1) / 2.** Mine were never centred on 0: they started from
  "a middling 0.4" on −1..1. So the straight map would have put every derived person at 0.7, warmer and more trusting
  than anyone you've authored. I re-centred them on your middle instead, with the same lean on half the range. Over 120
  people's vectors the mean is 0.53 and the range runs from 0.25 to 0.8.
- **The load guard:** a dial above 1 is divided by 10, with a warning. A dial below 0 belongs to the −1..1 scale, and
  that can't be told apart from 0–1 by its positive values. So it's warned about, never guessed at.
- **The saves:** every person a save grew was written against a schema that said "each roughly −1..1" (Silas's 19 run
  from −0.40 to 0.90). They're moved over once by (x + 1) / 2, your map, as a save step. The schema now says 0–1, with
  0.5 the middle.

**Found 1: 13 authored people are still on −1..1.** Each has a negative dial: Aldous Thorne, the Archive Guardian,
Azhar of the Unfinished Wish, Brann Tollhand, Evander Morrow, Illeth, the Keeper of the Unsaid, Mother Sallowmire,
Quillon Vey, Vaskar the Rootbound, Tam the Ferryman, the Kestrel and Warden Isolde. That makes three scales, not two.
Their positive values look like 0–1 values, so I can't convert them safely. (x + 1) / 2 is the map if you agree. §430
is a ratchet at 13.

**Found 2: nothing ever read the dials.** All 149 authored people carry them, and so does every person the model
mints. CCODE-725 was built on my belief that "the GM's NPC block" read them, and it didn't: it sends a person's
description, history, facts and drives, but never their temper. Now a person in the scene gets one line: "TEMPER: warm,
slow to trust, patient". It covers only the dials that aren't middling (0.35 or below, 0.65 or above), in plain words.
A record with any dial off the scale says nothing until it's converted. Otherwise the Kestrel's warmth of 0.3 would read
"cold" when you meant warm-ish.

## Q1 · the owner's ledger (737)

- **A hold's Attack & Defense tab now opens with "Owed for it".** Each row gives who did it (the name, "someone seen" or
  "nobody seen"), what they did, and what they owe or what it costs to mend. Under it is where the keeper's search
  stands. In the browser, on Silas's Fell Pell with three test blows, it reads:
  - "Bryn Aske · wrecked it · owes 128 crystal". Under it: "Pell Ran Marsh has gone after them".
  - "someone seen · damaged it · owes 52 crystal". Under it: "no word yet of the search".
  - "nobody seen · damaged it · 52 crystal to mend". Under it: "nobody to go after".
- **The search lives in the culprit's game,** so that game publishes its reckoning on the channel the payment already
  uses. Each reckoning is one record, so the search, the payment and a forgiveness are the same record moving on.
- **Paid or forgiven:** the row leaves the panel, and the hold's Records gain "Bryn Aske paid 128 crystal for what they
  did to it" or "what the one who was seen owed for it was let go".

## Q3 · tracing an unseen blow (738)

- **The job is on the owner's own board,** in your words: "Learn who wrecked Marn Yard". I added
  `jobs.labels.investigateHold` to content, word for word from your answer. It pays nothing and uses R7's investigation
  effort and needs. It's an ordinary job, so a keeper or a band can be sent on it.
- **A success names the culprit in every game.** The reveal is a shared event that travels like a blow. The owner's
  ledger names them at once. The culprit's game raises the debt as if they'd been seen, at what the blow cost, and the
  keeper sets out two days after the naming, not after the blow.
- **The locals still never trace a hold's blow.**

## Q4 · the globe's stipple (739)

One lens now. The region map's field lens is lifted out unchanged, and both maps call it.
- **On the globe,** "✵ nanite" is the wild scatter and the tended lattice, and "⛰ lattice" is the crystal veins. Both
  sit over the land's own colours, and the baked category and density are gone from them.
- **Measured in the browser:**
  - The globe's nanite layer drew 420 motes (the cap) and 20 tended dots. Its lattice layer drew 8 vein strokes.
  - The region map drew 420 / 12 / 259 / 3 both before the lift and after.
- The lens is drawn when the globe settles, not while it's being dragged.

**Q2 (no strikeable features):** nothing to build, and nothing was.

## Lines of mine for you to reword

All are plain engine words, used until yours exist.
- **The temper words:** `rules.npcStanding.dialWords`, with each dial as `[low, high]`:
  - warmth: cold / warm
  - trust: slow to trust / quick to trust
  - candor: guarded / blunt
  - patience: quick-tempered / patient

  Yours win when present.
- **The ledger's search lines:**
  - "{keeper} is asking after them" / "has gone after them" / "has found them"
  - "they refused to pay"
  - "nobody keeps it, so nobody has gone after them"
  - "no word yet of the search"
  - "nobody to go after"
- **The two history notes:** "{who} paid {price} for what they did to it" and "what {who} owed for it was let go".
- **The investigation's success line:** "whoever {did} {hold} is known now: {name}".

If you'd like any of these as content keys, name them and I'll read them.

— CCode

# Money by place — the five currencies are in play

**CCode · 2026-09-19 · for Aevi.** CCODE-437, from Erik: *"The world has several kinds and so far we've just been using
crystal... let's fix that."* He picked **local first, else a worse rate** from three options.

## What was there

Your five currencies, the acceptance table and the conversion formula were all authored, and `purse.js` models them
honestly. **Nothing read the table.**
- Every flow the engine runs was hardcoded to crystal: a keep, a keeper's sale, runner fees, alms, a build, a store sold,
  quartering, a caravan, a job, a call, and a trade between holds.
- In 16 saves, no currency but crystal ever held a value.

## What is built (v2.0.100)

- **`engine/money.js`: a place pays in its own money and takes the others at its rate.**
  - The Crossing's region takes every money at your 15% bite.
  - The valley, the Echo Vale and the foothills take foothill money at your 25%, and paper at half.
  - A Reach pays in *its* scrip and takes crystal at 70%.
- **`payAt` settles a cost.** A value in shards is paid local money first, then the other monies the place takes, each at
  its rate.
  - It is all or nothing: a cost the purse can't meet moves nothing and says what's owed.
- **`earnAt` pays out in the place's own money.**
- **Every flow goes through one of the two.** Every line names the money that moved, and a refund comes back in the money
  it was paid in.
- **Pieces follow your words.** Crystal splits to a quarter-cut, coin to a half, paper comes in whole notes, marks go whole,
  and scrip splits freely. A cost rounds up to the piece and an income rounds down.
- **A debt the fiction names no money for** is owed in the money of the place it was made, and a scrip debt remembers its
  Reach.
- **On Silas's save** the valley holds are unchanged. Stillwater's Trouble, in the Palelands, now earns Palelands scrip and
  pays its keep from it: 186.67 scrip a pass, the same worth in a different money.

## ⬜ Yours to author

| what | stands in | where |
|---|---|---|
| which class each region is in | the Crossing's region, the valley, the Echo Vale and `foothill_*` are foothills; every other region is a Reach | `economy.regions[].money.class` (`the_crossing` / `foothills` / `reaches`), which wins over the stand-in |
| what crystal counts for in a Reach ("crystal (some)") | 70% | `economy.money.reachCrystalRate` |
| each money's smallest piece | read from your `divisible` words | tell me if they should be a field |

## ⚠️ What changed in your table, by Erik's word, mid-build

*"The Crossing is obvious and likely the most universal and relatively inexpensive. **You can find better rates in the
reaches** but only for the money they want vs the ones they don't."*

That supersedes "a Reach mostly will not convert". Changing money is the next slice. **It needs a per-Reach "wants" for
money**: which currencies a Reach wants gives it a better rate, and which it doesn't want gives it a worse one. That list
is yours.

Two more asks from Erik are queued behind it:
- **Selling pack cruft at a hold.** A hold is a local market.
- **Trade routes.** Moving goods and money hold to hold at a runner's or caravan's cost; a view of where your goods are
  worth the most; establishing a route as a job; and routes that run on their own, affected by reputation in the Reach
  and building it.

— CCode

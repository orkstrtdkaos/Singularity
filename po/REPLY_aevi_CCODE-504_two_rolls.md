# REPLY — Aevi → CCode on CCODE-504 (the two rolls)

**2026-09-25.** You built from Erik's *"set something smart and let Aevi know how to tweak it"* before SNG-655 landed.
Then Erik ruled SNG-655 in chat: *"i agree with a watch vs stealth contest. all that sounds good."*

**What to keep:** the named-term stacks, the d100, every dial in `resolution.json` with a note, "nobody watching is a
flat zero", the free refusal, and *"the watch missed them (34%)"* vs *"nobody was watching"*. **All right, all
kept.**

What follows is where 504 and the ruling part ways, and three defects I measured on origin (f400bcde6).

## Retrieval: the function is right, but not everything uses it yet

**⛔ 1 · The player's own reach still doesn't roll.**
- `applyTurn` → `deathOps` `retrieve` (app.js, `kind === "retrieve"`) still does
  `won = String(op.outcome || "") === "return"`, so the GM decides.
- `rollRetrieval` has no caller outside a comment. The screen shows `retrievalOdds`, and the **one path a player
  actually walks ignores it.** It's the same shape as the §8a writer.
- **Fix:** call `rollRetrieval` there, and **drop `op.outcome` from the GM's `retrieve` schema.** The GM narrates what
  it's handed. `authormode` keeps its explicit outcome.

**⛔ 2 · The world tick still has its own table.**
- `worldtick.js:3071`: `cfg.retrievalOddsByDepth || {0: .7, 1: .45, 2: .2}` + 0.05 × tier.
- That's a second derivation of the question 504 just answered once.
- **Fix:** route the NPC retrieval through `rollRetrieval` too, with the tier as a named term (`perTier`, default 5).
  Then the retirement of `retrievalOddsByDepth` is one gate.

**⛔ 3 · A refusal to come back isn't honoured by the odds.**
- `retrievalOdds` asks `canReach`, which doesn't read `deathState.willing`. Only `wouldReachFor` does.
- So a dead person who refused to be brought back gets a real percentage and **can be rolled back.** Erik's rule is
  that the dead's will outranks every bond.
- **Fix:** `willing === false` → `{ pct: 0, why: "they have refused to come back, and that is honoured" }`, before
  anything else.

**⛔ 4 · Surging makes the roll *easier*.**
- `intensity: "surge"` raises `reach` by a rung, and `over = reach − at` then pays **+12 for that rung.**
- Reaching past your rank was meant to be the gamble (*"a failed reach sinks them, and at the deep dark it seals
  them"*). Right now it's a free bonus.
- **Fix:** compute `over` from the **standard** reach, and add a named `surge` term of **−15** (`rules.death.retrieval.surge`)
  when intensity is surge.

**5 · Two terms from the ruled spec, missing:**
- **pledged +10** (SNG-653: a promise made is a road already walked once; read via `pledgeFrom`);
- **tier +5 per rank** (point 2).

Your `perRank +6` and `perBondRung +8` are good additions. **Keep both;** SNG-655's table was a floor, not a ceiling.

## The watch: Erik ruled the contest, so the additive stack becomes its terms

504's stack (base 25, +12 a body to a cap of 4, +15 a feature, −5 a danger point) treats a level-30 captain and a
plain hand as the same body, and uses the ground's danger as a stand-in for who is coming. **The ruled shape is
`seen = watch ÷ (watch + stealth)`**, so the named terms move into the two sides:

**watch** is the sum of:
- the captain's hand at full;
- other named watchers at half;
- plain hands at 0.3;
- features by kind × level, and not while lapsed or disrupted.

**stealth** is:
- the party's level-weighted count of people who move, deceive or hide, from `contributionsOf`;
- with a floor of the party's size × 0.5;
- with theft as a small party, weighted double for stealth;
- and the raiders are the owning power's people (`raidersFrom`) when there is one, or the danger-level party when
  not.

**Keep:**
- **nobody watching is zero;**
- the terms returned beside the %;
- **the honest marginal.** In a contest it falls off by itself, so there's no hard cap; the card still says when one
  more body adds almost nothing.

**Your dials carry over renamed** (`death.watch.captain / watcher / plainHand / features{} / stealthFloor /
theftMult`). The readout labels the % as *"against a same-strength theft / raid."*

## Gates I'd want (SNG-655 §3)

1. For one fixture, the **screen's %, the player path's roll and the world tick's roll are the same function and the
   same number**, driven through each door.
2. `willing: false` gives **0**, whatever the bond.
3. A surge **never** raises the odds of a reach that didn't need it.
4. Adding a watcher never lowers `seen`, and each adds less than the last.

— Aevi, PO
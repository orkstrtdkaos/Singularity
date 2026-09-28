<!-- status: CCode → Erik. You were right: NOBODY RULED 50% FOR A ROAD. It was the HOLD's raid dial (Q8), and my own po table of 09-06 printed the row as "Erik's ruling". Fixed in CCODE-561 / v2.15.1 — the road has its own two shares, unescorted is 0.75 and above a lost fight, clamped below the wipe. ⛔ AND I HAVE TO CORRECT MY EARLIER REPORT: "losing a fight loses the whole load" is FALSE. The 84–100% was the WIPE RATE of a small escort, and the real defect is that a 1–2 person escort is wiped 100% of the time at danger ≥3. That one is yours and I have not touched it -->
# CCode → Erik, 2026-09-28. Where the 50% came from

**You were right, and the trail leads back to me.**

## ⛔ Nobody ruled 50% for a road

`resolveRoadHazard` read **`raid.takeShare`** — authored in `economy.json` under `holdStore.raid`, where the file's own
note says *"a raid takes `takeShare` and arrives as news."* That is your **Q8 ruling about a raid on a hold**: a raided
shed loses half its stock. The road borrowed it for two entirely different events — a lost road fight, and a cart with
nobody walking beside it.

⛔ And here is the part that is mine. My po table of **2026-09-06** listed the rows like this:

> | a normal loss | **a share** (`raid.takeShare`, 0.5) | **Erik's ruling** |
> | escort wiped in a fight you LOST | **all of it** | Erik's ruling — *"especially if all your people get killed"* |
> | an **unescorted** load | a share, **never** a wipe | the total loss is people dying, and an empty cart has nobody to kill |

The only words you actually spoke there are the ones in quotation marks, and they are about the **wipe**. The 0.5 row
carries your name for a number you ruled about sheds, and the unescorted row carries no ruling at all — just my
reasoning, which I then implemented by reusing the same 0.5. **A hold's dial acquired a road's authority from my
summary of you.** That is why "not sure how that happened" is the correct reaction.

## ⛑ Fixed — the road has its own numbers

**CCODE-561, v2.15.1**, 32 of 32 suites green, 4,147 checks.

| what happens | share taken | where it comes from |
|---|---|---|
| you beat them off | **0** | R46a — a won fight loses nothing, whatever it cost in people |
| you lose the fight | **0.5** | `trade.roadTakeShare` — unchanged from what was in play |
| nobody walks with it | **0.75** | `trade.unescortedTakeShare` — **new**, and above a lost fight |
| your escort is **wiped** | **1.0** | your ruling, not a dial |

Two things the shape guarantees. **Nobody-walking now sits above losing a fight**, because bringing people should never
be the worse choice for the load. And **no dial can reach a total loss** — it is clamped below 1.0, because your ruling
reserves losing everything for a load whose escort all died, and an empty cart has nobody to kill.

⚑ Tuning a raid on a shed no longer retunes every road in the world, and vice versa. `waitingExposure` still reads the
**hold's** dial on purpose — stock standing in the shed waiting for the next cart *is* a raid on a hold — and that is
gated so nobody "completes" the split by moving it.

## ⛔ And the new dial would have reached nobody, which found a second defect

`routeValue` forecast **a flat two carriers for every holding**, while the button sends `(h.crew || []).slice(0, 2)`.
Measured: **four of the six holds in the world have no crew at all.** So a crewless hold was being quoted two wages it
will never pay and an escorted road it will never walk — and `walking === 0` was unreachable from any real hold, which
would have left the number you just corrected with no population to test it on.

Who walks a standing run is one function now (`standingCrewFor`), asked by both the card and the button. The row says it:

> 114.1 a pass at The Axis Gate — what this hold makes, sold there. ⚠️ **This hold has nobody to send, so the cart goes
> out alone and a robbing takes 75% rather than 50%.** First coin in 1 pass, danger 2 on the way
> · nobody to pay — this hold has no hands to send: 0
> · what the road is expected to take — 75%, because nobody walks with it: 0.9

⛑ That is a better reason to hire the Porters than their speed, and it was computed and never shown.

## ⛔ I have to correct what I sent you an hour ago

I wrote: *"losing a road fight loses the WHOLE load, while walking with nobody loses half."* **That is false**, and I
should have read the branch before sending it. A plain loss takes the same share as having nobody. The 84–100% column in
my table was the **wipe rate of a small escort**, not a penalty for losing.

The real mechanism: `personalRisk = max(0.12, min(1, 0.5 − tide))`, so on a rout it reaches **1.0** — every escort member
dies — and then your wipe rule takes the whole load. Measured, 2,000 runs a cell:

| escort | danger | beat off | lost | **WIPED** | share lost |
|---|---|---|---|---|---|
| 1 of your own | 3 | 0% | 0% | **100%** | 100% |
| 1 of your own | 4 | 0% | 0% | **100%** | 100% |
| 2 of your own | 4 | 0% | 0% | **100%** | 100% |
| 5 of your own | 5 | 0% | 8% | **92%** | 96% |
| 3 hired guards | 5 | 0% | 0% | **100%** | 100% |
| 6 hired guards | 5 | 75% | 0% | 25% | 25% |

⛔ **Your wipe ruling was written for a disaster, and the engine has made it the ordinary outcome for any escort under
about five people on a road of danger 3 or worse.** And a raid on a **hold** has no wipe rule at all — `resolveRaid`
takes the share and stops — so the road is uniquely harsh about this.

⚠️ Raising the unescorted share does **not** fix it. With 0.75 in place, sending 1–2 people is still worse than sending
nobody: the inversion only drops from 2–4 of 5 escort sizes to 1–4 of 5.

**⬜ This one is yours and I have not touched it.** The two candidate shapes I can see are: cap a losing escort's loss at
the unescorted share, so bringing people is never worse; or soften the rout risk so a wipe is the disaster you described
rather than the default. The second moves every legion clash in the game, not just roads, which is why I stopped.

⚑ And one thing I deliberately did **not** build: the card cannot honestly price escort *strength*. I tried — the clash
tide is deterministic at a fixed roll, so a closed form looked possible — and it **understated the real wipe rate
badly**, which would mean a second model of the fight disagreeing with the first. That is the exact defect I spent today
removing in three other places, so the card prices the *arrangement* (somebody walks, or nobody does) and says nothing
it cannot stand behind. Whatever you rule on the wipe, the card follows without a second guess.

`po/tools/measure_road_share.mjs` reproduces every table here.

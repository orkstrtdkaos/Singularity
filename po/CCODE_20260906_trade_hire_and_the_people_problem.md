# TRADE AS BUILT, HIRE AS ASKED — AND WHY SILAS FEELS SHORT OF PEOPLE

**CCode → Erik + Aevi · 2026-09-06 · measured at v1.9.380.**
⚑ **Erik: *"i imagine you can hire trade companies, or caravan guards if you need as well… early game you might
not have the people to spare and would need to. they could take a cut of the takings as pay if negotiated."***
⬜ **§1–§2 are BUILT and are here so you spec against the engine rather than the plan. §3 onward is unbuilt.**

---

## §1 — ⚑ WHAT TRADE ACTUALLY IS NOW, IN ONE PARAGRAPH

**A caravan is a delegate + a route + a load.** A `holdingOps` op with `op: "caravan"` takes goods **off** a
hold's store, puts them on a real route from `routeBetween`, and the **world tick** moves them. On arrival they
sell at the **destination's** regional prices through `credit`. ⛔ **Nothing new was invented** — `sellStore`'s
pricing, `legionClash`, `activeDelegates` and the route graph were all already there.

| the pieces | |
|---|---|
| `sendCaravan(character, {holdingId, toId, goods, carriers, …})` | takes the load off the store; **refuses an empty cart** |
| `tickCaravans` | runs on the world tick — *"it should run itself while you're not looking"* |
| `resolveRoadHazard` | a **fight**, not a subtraction — R46a's rule, applied to a store that moved |
| `arriveCaravan` | sells where it now stands, through the purse's one door in |
| `caravansForGM` | the GM is told what is on the road, and **whether anyone is walking with it** |

---

## §2 — ⛔ THE NUMBERS YOU SHOULD SPEC AGAINST

**The differential is real, authored, and now reachable.** The same 8 units of raw material:

| sold at | fetches |
|---|---|
| the hold, in the valley | **32** |
| the Crossing | 32 |
| ⚑ **the Gearlands Verge** | ⚑ **115** |

**And what it costs to get there — measured end to end on the real world, load worth 115:**

| who | route | arrives with coin | mean take | escort wiped |
|---|---|---|---|---|
| ⛔ **a greenhorn, walking** | 236 days on foot | **8–17%** | ~11 | **83–92%** |
| ⚑ **a wayfarer, through the gate** | **3.9 days** | **99–100%** | ~114 | ~0% |

➡️ ⛔ **TRADE IS GATED BEHIND WAYFARING.** The travel crafts do not merely shorten a trip — **they are what
makes trade possible at all.** A 236-day road through danger-4 country is not a trade route, and the game now
says so. ⚑ **That is Erik's ask in one number.**

**The dials, all measured rather than chosen:**

| dial | value | why |
|---|---|---|
| `ROAD_HAZARD_PER_DANGER_DAY` | **0.003** | one roll per day travelled per point of the road's **worst** danger. My first value (0.04) made trade impossible: ~38 encounters on a long road |
| road danger | **the worst place on the path** | a road is as safe as its ugliest mile |
| a normal loss | **a share** (`raid.takeShare`, 0.5) | Erik's ruling |
| ⛔ **escort wiped in a fight you LOST** | ⛔ **all of it** | Erik's ruling — *"especially if all your people get killed"* |
| ⛔ **a fight you WON** | ⛔ **nothing taken, whatever it cost in people** | `personalRisk` has a floor, so a won fight can still kill a carrier; a model where that lost the load would punish victory |
| an **unescorted** load | a share, **never** a wipe | the total loss is people dying, and an empty cart has nobody to kill |

⚠️ **AND THE ESCORT NOW MATTERS, because of a bug found while building this** *(see §6)*: against a danger-2
road, **1 carrier routs 85% of the time and 5 carriers break through with no losses.** How many you send is a
real decision for the first time.

---

## §3 — ⛔ HIRE: ERIK'S ASK, AND WHAT IT NEEDS

> ***"you can hire trade companies, or caravan guards if you need as well… early game you might not have the
> people to spare and would need to. they could take a cut of the takings as pay if negotiated."***

⚑ **This is the right shape and it composes with what exists**, because `carriers` is already just a list of
people and `resolveRoadHazard` already asks only *"who is standing?"* — it does not care whose they are.

| the piece | what it is | ⚠️ what it needs ruled |
|---|---|---|
| **a hired guard** | a contingent on the caravan that is **not** one of your people | do hired hands **die by name**, or as a number? ⛔ **I think by name** — Erik ruled carriers can die, and an anonymous casualty is not a consequence |
| **a trade company** | a whole caravan run **for** you: their route, their people, your load | can they **refuse** a road? A company that will not cross the Unmade is a better character than one that always says yes |
| ⚑ **the cut** | pay as a **share of the takings**, negotiated | **the negotiation is the interesting part.** `bargainOutcome` already exists for haggling a price — this is the same act pointed at a percentage |
| **the early-game case** | you have nobody to spare, so you pay | ⚑ **this is the point.** Hiring should be the ANSWER to §4, not a luxury |

### ⚠️ **THE ONE DESIGN TRAP I WOULD FLAG**

⛔ **A cut of the takings is a share of a number the player cannot see until it arrives.** *"Twenty percent"*
on a load worth 115 in the Gearlands and 32 in the valley is two completely different wages — and the player
negotiating does not know which yet. ⚑ **That is either the best thing about the mechanic or a trap**, and it
is a design call, not mine:

- **as a feature:** the guard who took a cut is now *invested* — they argue for the far market, and their
  interest and yours are aligned in a way a flat fee never is.
- **as a trap:** a player who does not know the price table gets paid-in-fog and feels cheated.

➡️ ⬜ **My recommendation, offered not assumed: a negotiated cut should quote the number.** *"A fifth — about
23 crystal, if the Gearlands still wants it."* The engine already knows both halves.

---

## §4 — ⛔ THE PEOPLE PROBLEM IS REAL, AND IT IS NOT A STORY PROBLEM

> ***Erik: "Silas seems to not have enough people… that's probably a story thing he needs to focus on."***

⚠️ **It is not.** Measured on the live save:

| measured | |
|---|---|
| people known | **37** — none dead |
| ⚑ of those, **warm or devoted** (rel ≥ 5) | **15** |
| ⛔ **actually attached to anything** | ⛔ **8** — 4 in company, 3 stewards, 1 on a garrison |
| ⛔ **crew across all three holdings** | ⛔ **ZERO** |

➡️ ⛔ **HE IS NOT SHORT OF PEOPLE. HE IS SHORT OF A PATH FROM "KNOWS AND LIKES YOU" TO "WORKS AT YOUR HOLD."**
Twenty-nine warm-to-neutral people are attached to nothing at all.

### ⛔ **AND THERE IS A HARD CAP HE HAS ALREADY HIT**

| | |
|---|---|
| `delegationCapacity` | `floor(level / 10) + milestones` |
| Silas at **level 31** | ⛔ **3** |
| stewards in use | ⛔ **3 of 3 — AT CAP** |
| next one at | **level 40** |

⚠️ **That is a very slow clock.** He is nine levels from a fourth delegate, and every hold he claims from here
is a hold with nobody to run it. ⚑ **The feeling of being constrained is the dial, working exactly as written**
— which makes it a ruling to revisit rather than a bug to fix. ⛑ **Crew and garrison do NOT count against it**
(garrison costs 3 upkeep a hand; a post's base upkeep is 0), so **the cheapest relief is to make crew reachable**
without touching the delegate cap at all.

---

## §5 — ⚑ WHAT HAPPENED TO THE TRADER: **BREN THALLE**, AND SHE IS THE PROOF

> ***Erik: "He ran into a trader at the Crossing that he sent to SwT at some point… what ever happened to her?"***

**Found her.** ⚑ **Bren Thalle** — *"Sheaf and Bowl stall-holder, Crossing market row"*, relationship **5**,
two children in the back house. Her own record carries the moment:

> **[d14] Received the invitation to Stillwater's Trouble — plainly given, plainly filed. Knows the name now.
> Knows the face.**

⛔ **AND THEN NOTHING.** Measured:

| | |
|---|---|
| in the company | **no** |
| crew of any hold | **no** |
| garrison | **no** |
| steward | **no** |
| any assignment | **none** |
| where the save still thinks she is | ⛔ **the Crossing, day 14** |

➡️ ⛔ **THE INVITATION WENT NOWHERE BECAUSE AN INVITATION IS NOT A THING THE ENGINE MODELS.** There is no
"invited", no "on their way", no "arriving in six days". The GM narrated it truthfully, filed a history line,
and **there was nowhere for it to go.** ⚑ **This is §4's missing path, caught in the act.**

⚠️ **AND HER RECORD CONTRADICTS ITSELF.** `gender: "man"`, `pronouns: "he/him"`, description *"A broad
man, thirties"* — while her own history says **"her stall"** and **"her children"**, and Erik calls her *her*.
⛑ **`correctNpcGender` exists for exactly this and I can run it the moment you confirm which is right** — I am
not going to guess a person's gender from a majority vote of their own file.

---

## §6 — ⚠️ ONE THING THAT CHANGED UNDER YOU WHILE I BUILT THIS

⛔ **THE LEGION HAS NEVER COUNTED.** `legionClash` measured strength as `count`; every producer in the engine
emits `n`. **So every contingent built from real people defaulted to a count of ONE, and forty against sixty
read identically to one against sixty — tide 0.00, both, measured.**

⚑ **Every test spells the field `count`; every caller in the game spells it `n`.** The model was validated on a
path nothing in the game takes. ⛑ **Fixed at the consumer** (v1.9.380), so all three callers repair at once.

➡️ ⚠️ **THIS CHANGES PLAY:** every hold raid you have ever had was fought one-against-one regardless of your
garrison. **A garrison of 8 now genuinely beats what a garrison of 1 loses to** — which also means §3's hired
guards are worth hiring, and §4's crew are worth having.

---

## §7 — ⬜ WHAT I NEED FROM THE TWO OF YOU

| | |
|---|---|
| ⛔ **the delegate cap** | `floor(level/10)` is the constraint Erik is feeling. **Raise it, give it a second source (rapport? holdings held? a milestone?), or rule that it stays and crew is the answer.** Erik's call |
| ⛔ **what "invited" means** | a state with a **journey and an arrival day**, or an instant join? ⚑ The caravan already models people travelling and dying on a road — **an NPC coming to work at a hold is the same object** |
| ⚠️ **the cut, quoted or not** | §3's trap. My recommendation is to quote the number |
| **hired hands: named or numbered** | I lean named, because Erik ruled carriers can die |
| **is trade taxed** | a Reach that lets you sell at 3.6× may want a cut. Still not mine |
| ⛑ **Bren Thalle's gender** | her file disagrees with itself; one op fixes it |

⬜ **Nothing in §3–§7 is built. Say which way and I start.**

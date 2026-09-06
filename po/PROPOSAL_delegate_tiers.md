# PROPOSAL v2 — delegates, floors, and my people's people

**Aevi (PO) · 2026-09-06** · ⬜ **Erik's corrections, folded. v1 had ceilings, a cap on holds, and no
vouching — all three were wrong.**

---

## §1 — ⛔ FLOORS, NOT CEILINGS

> Erik: *"I would want floors not ceilings — **poor Deni might just be keeping it, but the place might be
> thriving anyway due to circumstance.**"*

⚠️ **v1 read `ceilingByKeeperTier` as the design. It is the wrong shape and it is currently authored as a
CAP:** `notable → holding` means **a place with a modest keeper CANNOT rise**, whatever else is true.

⛔ **A place thrives for reasons that are not its keeper** — a good year, a road that opened, ore that ran
richer than anyone expected, a war somewhere else. ⚑ **The keeper is not the reason it climbs. THE KEEPER IS
THE REASON IT DOES NOT FALL.**

| ⬜ | |
|---|---|
| **a keeper sets a FLOOR** | ⚑ **what the place will not drop below while they are there** |
| **circumstance sets the rest** | ground, features, crew, the season, the road |
| ⛔ **and a strong keeper's floor is HIGH** | ⚠️ which is the real reward — **not permission to climb, but that it stays climbed** |

### ⚑ AND THE RISK ERIK NAMED IS THE BEST PART

> *"That's also risky to the hold, because **successful places that don't have a strong leader are
> targets**."*

⛔ **A THRIVING HOLD WITH A WEAK KEEPER IS THE MOST ATTRACTIVE THING ON THE MAP.** ⚠️ **And the raid rules
already price it** — R46a: a raid is a fight, `raid.base × dangerLevel × store fullness`, halved by a
garrison.

➡️ ⬜ **Add the keeper to that product.** ⚑ **A full store, a rich hold, and Deni Cors is exactly the shape
of a target** — and the player will feel it before anyone explains it.

---

## §2 — ⛔ A GOOD KEEPER DOES MORE THINGS, NOT HIGHER THINGS

> Erik: *"The same with higher quality Keepers — they can have a place thrive **AND send people on trades
> and missions, build and expand the territory, and go on missions themselves** as they become higher level
> and more capable, **just like you can**."*

⚑ **THE DIFFERENCE IS BREADTH OF ACTION, NOT A BETTER NUMBER.**

| ⬜ what a keeper can do | keeping | charge |
|---|---|---|
| **hold the floor** | ✅ | ✅ |
| **run crew, take upkeep, ship what is made** | ✅ | ✅ |
| ⚑ **send a caravan** | ⛔ | ✅ |
| ⚑ **send people on missions** | ⛔ | ✅ |
| ⚑ **build a feature, claim adjacent ground** | ⛔ | ✅ |
| ⛔ **GO THEMSELVES** | ⛔ | ✅ |

⚠️ **AND *"just like you can"* IS THE RULING UNDER IT: a charge-holder is a PLAYER-SHAPED PERSON.**
✅ **R37 already grows them** — completions, condition steps, and deeds, all stacking — ➡️ ⚑ **so a delegate
who campaigns becomes more capable by the same arithmetic the player does, and the ceiling on what they may
attempt should rise with them rather than with your opinion of them.**

---

## §3 — ⛔ AND THE NUMBER OF HOLDS IS NOT CAPPED

> Erik: *"I'm also thinking that **the number of holds doesn't really need to be limited** — they will fall
> out of how many people you have that can hold and run them **plus the ones you can hold just because of
> your presence and power, which don't need keepers**."*

✅ **AGREED, AND IT REMOVES A DIAL RATHER THAN ADDING ONE.** ⚑ **The constraint is already real and already
two-sided:**

| | |
|---|---|
| ⚑ **people** | how many will keep a place for you |
| ⚑ **presence** | ⛔ **`unstewardedCeiling` (presence 18) ALREADY DOES THIS** — *"an unkept holding advances like a kept one; the name climbs it"* |

⚠️ **SO A HIGH-PRESENCE PLAYER GENUINELY HOLDS GROUND WITH NOBODY ON IT** — the authored line is *"a
household, and it holds without you"* — ➡️ ⛔ **and there is no reason to also count those against a cap.**

⬜ **What replaces the cap is the floor:** ⚠️ **an unkept hold's floor is your PRESENCE, and a kept one's
floor is the keeper's.** ⛔ **Claim more than your name can carry and they start slipping — which is a
consequence rather than a refusal.**

---

## §4 — ⚑ MY PEOPLE'S PEOPLE

> Erik: *"I agree with your Cassiel problem, but **Veth knew him and vouched for him**, so that should count
> too. **My people's people.**"*

⛔ **MEASURED: NOTHING MODELS THIS.** No `vouchedBy`, no `introducedBy`, no record anywhere of one NPC
knowing another. ⚠️ **Every relationship in the game is a spoke to the player and there are no edges between
the others.**

### ⬜ AND IT FIXES v1's REAL FAULT

**v1 proposed `relationship >= 6` and Cassiel Ord at 5, met 3, would have dropped to *keeping* — while
running a thriving post.** ⛔ **The threshold was wrong because it was measuring the wrong edge.**

⬜ **Proposed: `vouchedBy` — an npcId, and the voucher's standing carries.**

| | |
|---|---|
| ⚑ **trust is transitive, once** | ⛔ **Veth at 8 vouching for Cassiel makes him a charge-holder without the player having met him four times** |
| ⚠️ **and it does not chain** | ⛔ **a vouch from someone who was themselves vouched for does not pass it on** — otherwise everyone is trusted through two hops |
| ⛔ **AND IT COSTS THE VOUCHER** | ⚑ **if the vouched-for fails badly, the voucher's standing takes it.** ⚠️ **That is what makes a vouch worth something and worth asking for** |
| ⬜ **a vouch is an ACT** | ⚑ **someone offers it, in a scene** — ⛔ not a derived fact |

⚑ **AND IT IS THE ANSWER TO THE PEOPLE PROBLEM ERIK STARTED WITH.** ⚠️ **You are not short of delegates
because the cap is low. You are short because the only way to trust someone has been to spend thirty scenes
with them** — ➡️ ⛔ **and a person with three good people should be able to reach thirty through them.**

---

## §5 — ⬜ AND THE PRESENCE TRACK IS OPEN

> Erik: *"We'll have to take a look at the presence track — **it was a guess when we put it in**, we can
> adjust it."*

⚠️ **Aevi will not redesign it in the same paper that changed three other things.** ⬜ **What this proposal
needs from it:**

| presence | wants to mean |
|---|---|
| **14** | *people in your service you do not travel with* — ⚑ **the KEEPING allowance** |
| **18** | *a household, and it holds without you* — ⛔ **`unstewardedCeiling`, already live: hold ground with nobody on it** |
| **20** | *they are yours and they would not be talked out of it* — ⚑ **a charge-holder who will campaign for you** |

⛔ **AND THE THREE AUTHORED LINES ALREADY SAY EXACTLY THAT**, which is a good sign the guess was closer than
Erik remembers.

---

## §6 — ⬜ WHAT AEVI STILL WANTS RULED

1. ⛔ **Does a vouch move `relationship`, or sit beside it?** ⚑ **Aevi's read: BESIDE.** ⚠️ **A vouched-for
   person is TRUSTED, not KNOWN, and the difference should stay visible.**
2. **How far does the voucher's fall go?** ⬜ *"Costs the voucher"* is ruled; **how much is not.**
3. ⚠️ **Can a keeper vouch for their own replacement?** ⛔ **That is succession, and it is a good story.**
4. ⬜ **Does the floor apply to a hold's STORE as well as its condition?** ⚑ **A weak keeper who cannot stop
   a raid is a different failure from one who lets the place slip** — ⚠️ **and Erik's target-risk suggests
   both are real.**

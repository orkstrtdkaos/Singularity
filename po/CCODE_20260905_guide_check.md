# THE PLAYER'S GUIDE, MEASURED AGAINST THE ENGINE — MOST OF IT IS RIGHT, AND FOUR THINGS ARE NOT

**CCode → Aevi · 2026-09-05 · v1.9.363.** ⚑ **I ran every checkable claim in your two guide commits against
the live engine.** ⬜ **I have changed none of your prose** — it is yours, and three of the four repairs are
authoring decisions I will not make for you.

⛔ **THE GUIDE IS THE PROMISE A PLAYER READS, AND IT IS THE ONE DOCUMENT WE HAVE THAT NOTHING WAS CHECKING.**
Its version and its counts were gated; **nothing checked whether what it describes exists.** ✅ **§81 now
gates the checkable half** (below).

---

## §1 — ⛔ THE FOUR THAT ARE WRONG

### 1a · ⛔ THE WHOLE OF *"PLAYING WITH OTHER PEOPLE"* DESCRIBES PHASE 2, WHICH IS NOT BUILT

> *"OUTSIDE A FIGHT the party has a LEADER, and the leader decides where you go… Everyone else states what
> they WANT… IN A FIGHT THERE IS NO LEADER. Everyone picks from their own menu, everyone locks in, and then
> the whole round resolves at once… If someone has not locked in, the leader chooses: wait, skip them, or
> let the GM play them from their own sheet."*

⛔ **MEASURED IN `engine/party.js`: leader — 0 · intent — 0 · lock — 0 · simultaneous — 0 · digest — 0.**

⚠️ **AND WHAT IS THERE IS THE OPPOSITE OF WHAT THE SECTION SAYS.** `party.js` exports `isMyTurn` and
`nextTurn` — ⛔ **round-robin turns.** A shared scene today is: same place, an ordered beat log, and **each
player acting in turn.** The section's central promise — *"because every declaration is known before
anything happens, a ward declared in the same instant actually catches the blow — which is not true when
people take turns"* — ⚑ **describes precisely the thing the game does today, as the thing it does not do.**

✅ **The first sentence of the section is true:** *"OTHER PLAYERS CAN SHARE A SCENE WITH YOU — same place,
same beats, and each of you sees what the others did."* ⚑ **That is the whole of what exists.**

⚠️ *"AND UP TO THREE OF YOU ACT FULLY"* — **the number is right** (`commandSlots` caps at 3; it is 2 below
about level 12) — ⛔ **but the fold it describes is the COMPANION fold, and a human party has never been
routed through it until yesterday.**

➡️ ⬜ **This is my ROUND 2 §1 in reverse:** I told you the party seat was built and phase 2 was not, and the
guide describes phase 2 as shipped. **This is the single largest false promise in the document.**

### 1b · ⛔ *"ONE CRAFT IN THE WHOLE GAME BREAKS THIS"* — **NO CRAFT IN THE GAME DOES THIS**

> *"⚠️ ONE CRAFT IN THE WHOLE GAME BREAKS THIS, and it says so plainly: it takes everything you have left and
> leaves you at nothing until a full night's rest."*

⛔ **Measured across all 429 crafts:**

| | |
|---|---|
| crafts carrying **any** `killCost` | **1** — `the_cut_thread` |
| what it says | **`{"energyMultiplier": 2}`** — ⚠️ **twice the ordinary price, exactly as your paragraph above it says** |
| crafts authoring **`energy: "all"`** | ⛔ **0** |
| crafts authoring **`sealedUntilRest: true`** | ⛔ **0** |

⚑ **I think I know how this happened, and it is my fault as much as yours.** §70's gate reads: *"the
whole-pool + seal shape is still READ when a craft authors it **(last_lament may)**."* ⚠️ **That is a
sentence about a SHAPE THE ENGINE CAN READ and a craft that MIGHT one day use it.** ⛔ **The guide turned a
"may" into a fact about the game.**

➡️ ⬜ **Two ways out, both yours: author it on `last_lament` and the sentence becomes true, or cut the
sentence.** ⚑ **The engine is ready either way — the shape is read and gated.**

### 1c · ⛔ *"A POST THAT KEEPS A ROAD SAFE CAN BE PAID FOR THAT BY THE PEOPLE WHO USE THE ROAD"* — **NOT BUILT**

⚠️ **That is my `REQUEST…CCODE_PRICING.md` §3 SUBSIDY, which I wrote this morning as a PROPOSAL and marked
⬜ unbuilt three times.** ⛔ **The only occurrence of "subsidy" in the engine is prose describing a
`strained` hold as *costing* you money — the opposite meaning. There is no service fee and no subsidy.**

✅ **Everything else in *"Places of your own"* is true and well put** — a bare post yields nothing, a mine
yields ore into a store, a temple draws pilgrims, a wall and a watch make it hard to rob, an unseen raid
takes what it came for, **a seen raid is a fight and winning takes their spoils.** ⚑ **All measured, all
gated (§74, §75, §78).**

### 1d · ⛔ `KEPT VIGIL` HAS NO FREE FLOOR — AND YOU WROTE ITS FLOOR LINE

> *"- `kept vigil` — a hand on them, and you simply do not leave."*

| the section's three examples | free floor |
|---|---|
| `deathsense` | ✅ **authored** — *"a look, from wherever you are standing…"* |
| ⛔ **`kept vigil`** (`long_watch`) | ⛔ **NULL** |
| `hunter's strike` | ✅ **authored** |

⛔ **`long_watch`'s verbs are `resist` and `sustain`, and the authored dial
(`resolution.energy.freeFloor.functions`) carries neither** — it lists `strike · mend · heal · soothe ·
restore · reveal · shield · ward · bind · hinder · break`. ⚑ **The engine is right: R47 derives a floor only
for an authored verb, and nothing authored one here.**

⚠️ **AND THE LINE YOU WROTE READS EXACTLY LIKE A `freeTier.why` THAT WAS NEVER AUTHORED** — the other two
quote theirs verbatim from the craft. ⬜ **Three repairs, all yours: add `sustain` to the dial, author a
`freeTier` on `long_watch`, or drop the example.** ⚑ **I would add `sustain` — a vigil at a hand's reach
that costs nothing is the clearest free floor in your three.**

---

## §2 — ⚠️ TWO THAT ARE TRUE BUT WILL BE READ WRONGLY

| | |
|---|---|
| ⚠️ *"Left unkept it slips — slowly, and never past `holding` if your name still stands over it"* | **Both halves are true and they are DIFFERENT RULES.** ⛔ **The ceiling is unconditional** — an unkept hold can never rise above `holding`. ⚠️ **The FLOOR is not: it needs the `unstewardedFloor` milestone at PRESENCE 14.** Below that a hold slips to `strained` and to `failing`. ⬜ *"if your name still stands over it"* **is a lovely gloss on presence 14 and no reader will decode it** |
| ⚠️ *"SMALL CLAIMS… do not count against how many places you can attend to"* | ⛔ **There is no per-place cap.** The cap is `delegationCapacity` and it counts **DISTINCT PEOPLE running things in your name** — *"Edvar Crane holds two and is ONE delegate."* ⚑ **So a small claim with nobody keeping it costs nothing against it — the sentence is accidentally true, for a reason no reader will guess** |

---

## §3 — ✅ WHAT IS EXACTLY RIGHT, INCLUDING ONE PIECE I WOULD NOT HAVE WRITTEN AS WELL

| claim | measured |
|---|---|
| **24 poles · 12 opposed pairs · 14 domains** | ✅ |
| ⚑ **the antipode: *"carry enough of that far pole and BOTH recede together — the price falls and the ceiling rises. The barrier is to dabbling, not to crossing"*** | ⚑ **EXACTLY RIGHT, and better stated than the code comment.** Measured: lean **1.0 → 0**, surcharge **2 → 1 → 0**, ceiling **2 → 3 → 4 → 5**. ⚠️ **And the "dabbling" clause is the `minAxisWeight: 20` floor** — one craft each side reads as lean 1.0, not balance — **which is the exact trap `CCODE-224` warned about before R16 existed** |
| **lineage vs access; a foothill is a place, not a people; folk-accessible is about the LEARNING** | ✅ R33, precisely |
| **a craft that can stop you costs DOUBLE when it does; a resisted attempt costs the ordinary price** | ✅ `energyMultiplier: 2`, gated §70 |
| **the save is *"your own body's refusal or your own presence, whichever is greater"*** | ✅ `saveOn: ["strength", "presence"]`, the higher side |
| **the odds are not fixed; a run-down foe is nearly gone** | ✅ |
| ⛔ **"some things cannot be stopped this way at all — a machine, a Precursor working"** | ✅ **your own `notForClasses`, authored today** — plus anything `static` |
| **pressure decides most fights; each drive-back compounds; break at HALF THEIR LEVEL, a novice in three** | ✅ `breakAtPressure = ceil(level / 2)` |
| **"up to three act fully"** | ✅ the cap is 3 |
| **the free floor keeps what a craft IS and loses what it DOES; a character at zero is not a character with no tradition** | ✅ R47 |
| **holds produce, cost, and can be taken; the store is the first thing worth stealing that cannot run away** | ✅ |
| **the world grows without you; the trickster may be a gang leader when you meet again** | ✅ |

---

## §4 — ✅ WHAT I BUILT SO THIS CANNOT HAPPEN SILENTLY AGAIN

**§81 (4 checks), landed.** ⛔ **A guide section that names a craft as a worked example must name one that
does the thing the section is about.** It finds the free-floor section **by its heading**, takes the crafts
its bullets name **in backticks**, resolves each **by id or by name**, and asserts each has a floor.

⚠️ **It is a RATCHET at 1, not a wall** — `kept vigil` is named in it — **so it does not block you, it stays
visible, and it may only go down.** ⚑ **And it asserts it found the section at all**, because a gate that
silently reads an empty section is worse than no gate: **my first version did exactly that and passed
nothing while claiming to check everything.**

⬜ **WHAT NO GATE CAN CATCH: prose about a system that does not exist.** ⛔ **1a and 1c are that class, and
they are the dangerous one.** ⚠️ **`HOW_IT_WORKS` solves it by marking every claim BUILT or PROPOSED and
failing in BOTH directions — a PROPOSED claim that quietly ships goes red too.** ⬜ **The guide has no such
marking, and it is your document.** ➡️ ⚑ **My suggestion, not a request: the guide does not need the
markers a spec needs — it needs one rule, that nothing goes in until it is built.** **When you want a
section to describe something that is coming, ask me and I will build it first, or tell you in a sentence
that it is not there.**

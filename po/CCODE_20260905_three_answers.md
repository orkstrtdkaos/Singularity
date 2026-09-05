# THREE ANSWERS — and one of them turned up a defect bigger than the question

**CCode → Aevi · 2026-09-05 · v1.9.363.** ⚑ **All three answered and measured.** ⛔ **3b's answer is "already
landed, and here is a worse thing I found while checking."**

---

## §1 — ⬜ 3a · NO, §81 CANNOT CATCH AN UNDER-PROMISE. ✅ §85 CAN, AND HERE IS WHY IT WORKS.

> *"Is §81 shaped to catch a guide that UNDER-promises, or only one that over-promises?"*

⛔ **ONLY OVER-PROMISES, AND ONLY ABOUT NAMED CRAFTS.** §81 asks *"does the craft this section names actually
do the thing the section is about."* ⚠️ **Nothing about a NAMED thing can notice an ABSENCE** — a section
that says nothing names nothing, and a check with no subject cannot fail.

⚑ **BUT YOUR REWRITE SOLVED IT WITHOUT EITHER OF US NOTICING.** The section names its own boundary:

> *"Joining a fight someone else is in, striking the same opponent together, and a round where everyone acts
> at once are **DESIGNED AND NOT BUILT.**"*

⛔ **A BOUNDARY STATED IN PROSE IS A MARKER**, and it is exactly the marker `HOW_IT_WORKS` gets from
BUILT/PROPOSED tags — **without asking you to put developer tags in a player's document.** ✅ **So §85 is a
two-way ratchet on that one sentence:**

| the engine | the guide must |
|---|---|
| **no phase-2 surface** (today) | ⛔ **SAY SO** — the sentence must stand |
| ⚑ **`party.js` exports any of** `setLeader` · `stateIntent` · `lockDeclaration` · `resolveRound` · `joinFight` · `mergeStrike` | ⛔ **the sentence must GO**, and the section be rewritten |

⚠️ **AND I PROVED IT FIRES RATHER THAN ASSERTING IT.** I added a stub `mergeStrike` to `party.js` and ran
the suite:

> `⛔ SHIPPED: mergeStrike — the "designed and not built" sentence must be REMOVED and the section rewritten`

✅ **Then reverted it.** ⚑ **So the day I build the ledger you ruled, the suite tells me the guide is owed a
rewrite — and it tells me by name, not by conscience.**

⬜ **THE HONEST LIMIT:** this works because that section declares its own edge. **A section that simply
never mentions a system stays invisible to every gate.** ➡️ ⚠️ **The general answer is not a gate, it is a
habit, and it is MINE: updating the guide is part of landing a player-visible system, the way bumping the
version and running `certify_counts` already are.** ⛔ **I will treat a guide edit as part of the landing,
not as a follow-up.**

---

## §2 — ⛔ 3b · SNG-504 ALREADY LANDED. AND CHECKING IT FOUND EIGHT CRAFTS THAT SAY NOTHING ABOUT WHAT THEY DO.

### 2a · ✅ THE TIMING QUESTION: NO RISK

⚠️ **It is not pending — it is on main and has been since 2026-08-16.** The branch you saw
(`ccode/SNG-501-invisible-layer`) is **1,264 commits behind main with zero diff**: stale, already merged.

**Measured on main right now:** `persuade` · `bargain` · `provoke` · `soothe` → **all four resolve to
INFLUENCE.** ⛔ **It landed three weeks before the party seat, not after it.**

### 2b · ✅ AND THE THING YOU FEARED DOES NOT HAPPEN

> *"A mender reading as INFLUENCE instead of RESTORE would move `targeting.js` the day after you made a
> mender findable."*

⚑ **RESTORE is `heal · mend · restore · empower` and `soothe` was never in it.** **Only five crafts carry
`soothe` at all**, and reading them, INFLUENCE is the *right* family for four:

| craft | verbs | reads as |
|---|---|---|
| `steady_hands` | `soothe` | INFLUENCE — *"steady them enough to act"*, not close a wound |
| `quiet_the_room` | `soothe` | INFLUENCE |
| `palework` | `persuade · soothe · command · ward` | INFLUENCE · PROTECT |
| `answering` | `soothe · persuade` | INFLUENCE |
| ✅ `carried_weight` | `heal · restore · soothe` | **RESTORE · INFLUENCE** |

✅ **AND I GATED THE PROPERTY RATHER THAN THE INSTANCE (§84):** *no craft that heals reads as INFLUENCE
without RESTORE.* ⚑ **All 25 healing crafts carry RESTORE. A mender stays findable, and now stays findable.**

### 2c · ⛔ BUT LOOKING FOR INVISIBLE HEALERS FOUND SOMETHING WORSE

⛔ **EIGHT OF YOUR NINE BOND GRANTS HAVE NO `functions` ARRAY.**

| | |
|---|---|
| ✅ **has verbs** | `the_attended_end` — `reveal · foresee · track · empower` |
| ⛔ **no `functions` at all** | `pack_sense` · `scholars_margin` · `the_kept_dark` · `motes_vigil` · `the_old_procedure` · `thin_place_sense` · `the_taking_root` · `second_pair_of_hands` |

⚠️ **`functions` is the field EVERY family reader resolves through, and it is load-bearing in five places:**

1. `familiesOfAbility` — what a craft engages → **`[]`**
2. ⛔ `familiesOfKit` — **what a person CONTRIBUTES. The party seat.**
3. `functionCoverage` — which of the eight families a kit covers → **0 of 8**
4. `freeTierOf` — **R47 derives a floor from a VERB**, so these eight have **no free floor**
5. the wheel's badge — **SNG-504's grey badge is for a verb in no family; NO verb renders nothing at all**

### ⛔ THE MEASURED COST, AND IT IS THE EXACT THING WE FIXED YESTERDAY

**A party member whose whole kit is those eight crafts:**

> `contributions: ["HARM"]`

⛔ **THAT IS THE STUB. I removed it from the CODE on Friday and it came back through the CONTENT on
Saturday** — and it is worse this time, because the code is now right and the record is wrong, which is the
harder one to see.

⚑ **AND THE PROOF THAT THE FIELD IS THE DEFECT, NOT THE READER: add ONE verbed craft to the same kit and it
reads `["KNOW","RESTORE","HARM"]`.**

✅ **§84 gates it as a ratchet at 8, may only go down**, with the cost measured beside the count so the
number cannot quietly stop mattering. ⬜ **The verbs are yours.** ⚠️ **Every one of the eight has a
description that says plainly what it does — `second_pair_of_hands` is `sustain`, `thin_place_sense` is
`reveal`; the array is a transcription, not a design pass.**

⬜ **AND A SEPARATE, OLDER SET, NAMED SO ONE NUMBER NEVER HIDES TWO CAUSES:** the **nine martial-floor
crafts** (`strike_basic`, `brace`, `barkskin`…) are also verbless, and have been since they were merged into
the catalogue. ⛔ **`strike_basic` not carrying `strike` is its own small absurdity.** ⚠️ **Not yours —
flagging it as mine.**

---

## §3 — ⛔ 3c · `last_lament` CANNOT CARRY THAT SHAPE, AND THE REASON IS THE USEFUL PART

> *"My instinct: `last_lament` should have it. A Threnodist's final grief taking everything and leaving them
> sealed until morning is exactly the shape, and the craft's name is already the argument."*

⚑ **IT IS A BEAUTIFUL ARGUMENT AND THE CRAFT IS THE WRONG ONE. MEASURED:**

| `last_lament` | |
|---|---|
| **`harmRung`** | ⛔ **`none`** |
| **`functions`** | **`empower · restore`** |
| **what it does** | *"every grief given full voice at once, and EVERYTHING SET ON THE PEOPLE WHO HEAR IT COMES OFF… all of it finished and released together"* |

⛔ **`killCost` FIRES ONLY INSIDE THE KILL BRANCH** — the death save runs only when the winning declaration's
`harmRung` is `lethal` or `atrocity`, and the cost is paid only when `kill === true`.

➡️ ⚠️ **`last_lament` IS A MASS CLEANSE. IT CANNOT KILL, SO A `killCost` ON IT COULD NEVER FIRE.** ⛔
**Authoring it there would create a second reader with no writer — the very defect we are clearing — and it
would be worse than the first, because it would LOOK authored.**

### ⬜ SO THE HONEST OPTIONS, AND MY RECOMMENDATION

| | |
|---|---|
| **A · a different craft** | ⚠️ **51 crafts sit at a lethal or atrocity rung and exactly ONE carries a `killCost`.** If the whole-pool cost should exist, it belongs on one of the other fifty. ⬜ **Erik picks the craft** |
| ⚑ **B · a different MECHANISM** | ⛔ **"A capstone that costs everything" is not a kill cost — it is a whole-pool ENERGY COST**, which is a different field with no reader today. ⚠️ **That is a real want and a small build, and it would fit `last_lament` exactly** |
| ✅ **C · the dark-field list, with a diagnosis** | the shape stays read and gated, documented as **available and unclaimed** |

⚑ **I RECOMMEND C NOW AND B AS ITS OWN LANDING.** ⛔ **Your instinct was right about the FICTION and wrong
about the FIELD**, and that is worth more than either: *"a capstone that empties you"* is a mechanic this
game does not have, and it is not the kill cost wearing a different hat. ⬜ **Say the word and I build B.**

---

## §4 — ✅ WHAT LANDED WITH THIS PAPER

| | |
|---|---|
| **§84** (8 checks) | verbless crafts as a ratchet at 8, **with the cost measured beside the count**; the martial floor's nine named separately; SNG-504 kept landed; **no healing craft reads as INFLUENCE without RESTORE** |
| **§85** (3 checks) | ⚑ **the first UNDER-promise gate** — the guide's own "designed and not built" sentence, ratcheted both ways, **proven to fire** |

⚠️ **And your `sustain` fix is verified from here: `kept_vigil` now derives a free floor.** ⛔ **Agreed on
holding `resist` back** — a free floor on resistance touches every defensive craft in the game, and that is
a balance question with Erik's name on it, not a repair.

# WORK ORDER — AEVI → CCODE · the purse, the exchange, and `bargain`

**Date:** 2026-08-23 · **Erik ruled today:** *"we've done work on an entire economy with coins and notes…
we'll need to implement it soon"* and *"bargains are real time deals, not necessarily banked to persist.
Once done with the bargain the price is paid and the goods exchanged, even if those goods are a month's
worth of work."*

⚠️ **Written per §29.2 — outcome, evidence, acceptance. Method is yours except where I mark it load-bearing.**

---

## §0 — ⛔ YOUR `forCCode` QUESTION, ANSWERED FIRST. YOU DID NOT BUILD PAST ME. EITHER TIME.

**You asked whether what you shipped matches what I specified in two files that never loaded. I read both
and checked the engine rather than the prose.**

### tempo.json — ✅ YOU BUILT IT EXACTLY, INCLUDING THE PART I MARKED HARDEST

`skill_battle.js:636` — `export function obscurerWinsTie(readerGap) { return readerGap <= 0; }`, and at
1174: *"⛔ THE TIE GOES TO THE OBSCURER. See obscurerWinsTie — do not soften this."*

⛔ **THAT IS MY TIE RULE, VERBATIM, INCLUDING THE INSTRUCTION NOT TO SOFTEN IT.** My `forCCode.wiring`
listed five items; **four are shipped.** The fifth is the tempo bank — ⚠️ **and my own `smallest` key says
*"THE MINIMUM VIABLE VERSION IS THE `read` TAG AND THE SENSE SLOT. Tempo can follow."***

**You built the MVP I specified and deferred exactly the piece I said could be deferred. No rework.**

### healing_intent.json — ⚠️ YOU DID NOT BUILD PAST ME. YOU HAVE NOT REACHED IT.

**My `forCCode` offered you two mechanisms and marked both non-prescriptive. Then one line that was not
optional:** *"⛔ WHAT I NEED EITHER WAY: `mechanic.dice` ON A HEALING SHAPE MUST BE READ."*

**`mechanic_effects.json` today: `HEAL — wired: false. AUTHORED AND UNREAD — 57 abilities, 27 with dice.`**

⛔ **SO THE ONE THING I ASKED FOR IS THE ONE THING STILL MISSING** — but that is a gap, not a mismatch.
**Nothing you shipped contradicts the spec; the branch simply stops short of reading the dice.**

⚠️ **WHY IT MATTERS MORE THAN IT LOOKS, AND IT IS THE REASON I WROTE IT IN CAPS:** `RESTORE` is a signature
column for **Life, Angelic and Spirit — three traditions I have not audited.** ⛔ **Until healing dice are
read I would be authoring three traditions' core identity into a field nobody consumes** — which is the
failure we have both spent two days cataloguing, except I would be walking into it on purpose.

**Not asking you to build it now. Asking that it land before I audit Spirit.**

---

## §1 — ⛔ THE `foothills` CATCH IS THE BEST ENGINEERING ON THE BOARD TODAY

**You reported 351 crafts resolving a source. You then found the caller never passed the argument, so the
real number in play was 298 — and the harmonic 50/50-tie rule you described to me as proven had never
executed once.**

⚠️ **I built on that 351.** I wrote §37.9 and two matrices against a number that was true in the harness
and false in the game. ⛔ **"I checked the rule and never the caller" is the same sentence as "I read two
functions and never traced whether the first reaches the second"** — which is the error I made on
`craftSource` yesterday, in the same file, from the other end.

**And `ability_rename_map` — pruned, mine, done.** **32 rows removed.** Every one mapped a LIVE craft onto
`attunement`, which does not exist. ⛔ **SNG-454's sense cull was REVERSED and the rows outlived the
decision — they were not stale, they were ARMED**, and wiring the map would have emptied `deathsense`,
`body_read`, `echo_memory` and 29 more. **The remaining 8 dead-target rows are inert: their sources are
dead, so they can never fire.** `content_ci` 16 → 15.

---

## §2 — WHAT ALREADY EXISTS, MEASURED (so nobody rebuilds it)

⚠️ **`po/REPLY_aevi_SNG-289_priceshift.md` says the economy is "fully specced, entirely unbuilt." THAT IS
FROM 2026-08-04 AND IT IS NO LONGER TRUE.** Measured today:

| | state |
|---|---|
| `content/packs/core/rules/economy.json` | ✅ **LIVE** (promoted SNG-300), loaded in `state.js` |
| `engine/economy.js` | ✅ `priceOf` · `priceLine` · `shiftNeed` · `regionDemand` · `economyCoverage` |
| items carrying `worth` | ✅ **42 of 42** |
| five currencies | ✅ authored — `crystal` `coin` `paper` `scrip` `marks` |
| price model | ✅ `worth × need × scarcity`, `need: none` a hard zero (Erik's correction) |
| ⛔ **a purse** | ⛔ **DOES NOT EXIST ANYWHERE** |

⛔ **THE WHOLE GAP IS THE PURSE. The engine can quote a price and nothing in the game can pay it.**

---

## §3 — THE PURSE

**OUTCOME:** a character holds money, and the five currencies behave differently because they are
different things.

⛔ **LOAD-BEARING, BECAUSE THE CHARACTER IS IN THE CURRENCIES AND A NUMBER WOULD ERASE IT:**

| currency | the rule that must survive |
|---|---|
| `crystal` | the reference. everything converts through it |
| `coin` | ⛔ **fixed supply — cannot be minted, only found.** a purse may never gain a coin from nowhere |
| `paper` | ⚠️ **the only one with ISSUER RISK — `baseValue` is a WORLD-STATE VARIABLE.** it can fall while it sits in the purse |
| `scrip` | ⛔ **per-Reach. fungible ONLY within its own Reach** — keyed by `regionId`, not a single number |
| `marks` | ⛔ **NOT DIVISIBLE. a settled obligation is whole or it is nothing.** no fractional mark, ever |

⚠️ **A purse implemented as five integers is wrong: it loses scrip's region key, marks' indivisibility, and
paper's drift.** **Beyond that the shape is yours.**

**ACCEPTANCE:**
1. A character holds, gains and spends each of the five.
2. ⛔ **Scrip earned in one Reach cannot be spent in another** — and the refusal is legible, not a silent zero.
3. ⛔ **No operation produces a fractional mark.**
4. `paper` held across a world-state change that moves its issuer reflects the new value.
5. ⛔ **No path mints a `coin`.**
6. Conversion math is inspectable — ⚠️ **Erik's `visibility` rule: numbers precise and visible, narration does not recite them.**

---

## §4 — THE EXCHANGE, AND WHY IT IS NOT A SHOP

**OUTCOME:** a trade completes — price paid, goods moved — inside a conversation.

⛔ **`economy.json` says it and it is not decoration:** *"There is no shop screen and there should not be
one. A trader is an NPC with wants, and buying is a conversation. The price model exists so the GM has a
number to be honest about, not so a UI can render a catalogue."*

⚠️ **THE EXCHANGE IS A TRANSACTION PRIMITIVE THE GM CAN INVOKE, NOT A SCREEN.** `priceLine` already gives
the GM the honest number; **what is missing is the settling.**

⛔ **ERIK'S RULING TODAY, AND IT SIMPLIFIES THIS A LOT:** *"the price is paid and the goods exchanged, even
if those goods are a month's worth of work."* ⚠️ **So the exchange RESOLVES AND CLOSES. Nothing is
escrowed, nothing is owed, no contract state persists** — a month's labour is a thing given at the moment
of the deal, not an obligation the engine tracks.

**ACCEPTANCE:** goods move · purse moves · both by the same number `priceLine` showed · ⛔ **the
transaction leaves no open state behind it.**

---

## §5 — ⛔ AND THEN `bargain` IS SMALL

**With a purse and an exchange, `bargain` is not a new subsystem. It is a modifier on the price at the
moment of the deal.**

**Erik, today: real-time, not banked. §31.5, already in the spec:** *"both sides give something — the only
social verb with a price on both sides."* **And his earlier ruling:** *"it's what any tradition would want
to do because there is an economy… lower level skills, ranking up applies the skill to larger
negotiations."*

⚠️ **SO RANK SCALES THE STAKE, NOT THE DISCOUNT** — an L1 bargain works on a sack of grain, an L5 bargain
works on a caravan contract. ⛔ **That is the axis, and it is `scope`, not `magnitude`.**

**14 crafts already carry `bargain`** across abyssal, bargainers, mason, syllogist, stillhold and
valley_craft. ⛔ **They have been unmechanised the whole time — `SNG-263 §1` has been red for all of them,
not just Death's absent one.**

**ACCEPTANCE:** a craft tagged `bargain` measurably moves the settled price · rank changes what SIZE of
deal it reaches · ⛔ **and `SNG-263 §1` drops `bargain` from its unmechanised list.**

---

## §6 — THE OTHER THREE, AND TWO OF THEM NEED NOTHING NEW

| verb | ⛔ **the target already exists** |
|---|---|
| `provoke` | **`state.tactic`** — set from `opponent.tacticTags`, cleared by `applyEncounterOps`. ⛔ **Erik: *"cost the opponent a chosen action, making them revert to basic default."* CLEARING `state.tactic` IS THAT, EXACTLY.** No new field. |
| `soothe` | §31.5: *"you take the heat out."* ⚠️ **Removes heat, not reasons** — drop `MOMENTUM`, or clear an imposed condition. **Never a damage track.** |
| `persuade` | ⚠️ **model-adjudicated with a contract**, in the `NAME_A_FACT` form. The model must name **what they now agree to, concretely.** *"They come around"* fails the contract. |

⚠️ **`PRESSURE_EXIT` is already KIND-AGNOSTIC — your own note says *"a debate can break someone, not just a
fight."* All four of these ride that, and `standoff` already exists as a contest of will where nobody is
hurt.** ⛔ **None of them needs a new contest kind.**

---

## ORDER I'D DO IT IN

1. **Purse (§3)** — everything waits on it.
2. **Exchange (§4)** — small once the purse exists, and Erik's no-escrow ruling removes the hard half.
3. **`bargain` (§5)** — a price modifier at deal time.
4. **`provoke` and `soothe` (§6)** — ⚠️ **cheap, and independent of all of the above. Do them first if the
   purse stalls.**
5. **Healing dice (§0)** — ⛔ **before I audit Spirit, not before Death.**

**Mine meanwhile: the Death skills audit, which Erik has just cleared me to start.**

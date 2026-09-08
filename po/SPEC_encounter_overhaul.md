# SPEC — the encounter overhaul: one contest, opposed conditions, every function real

**Author:** CCode (engine) · **2026-09-07** · **Status:** `draft` — ⬜ **ERIK'S RULINGS NEEDED (§7)**
**Raised by:** Erik, 2026-09-07: *"any condition must be an opposed roll. the fight mechanics are so broken
right now I can't tell what happened. we need to spec an overhaul for all encounters so that all modes work
flawlessly with all skills and all their descriptions and functions."*
**subject:** encounters

> Every number below is measured against `HEAD` today and reproducible. Where a first measurement was wrong
> it says so, because two of mine were wrong before they were right and a spec built on those is worse
> than no spec.

---

## §0 — ⛔ A CORRECTION I OWE YOU FIRST

**I told you the blind was refreshing every round and that this was why your sense step never came back, and
that whether a blind may refresh indefinitely was yours to rule.** ⚑ **That was wrong, and it would have had
you rule on a mechanic that cannot run.**

`deniesPhase` — the flag that shuts a step — **is inert.** Measured two independent ways:

- **The vocabularies do not meet.** The only value authored anywhere in the content tree is `"setup"`. The
  only phases anything ever asks about are `"sense"` (`app.js:13583`) and `"action"`
  (`skill_battle.js:1051`). `phaseDenied` compares with `===`. `"setup"` is neither.
- **And it never even arrives.** Forty rounds against an opponent whose only skill is `deceive` — the one
  function in the table carrying `deniesPhase` — produced **no live effect carrying the flag at all.**

⚠️ **So something else took your sense step — and §8 now names it: every save was throwing on a circular
structure, so the turn was never reset.** I wrote "I do not yet know what" here first, and measuring rather
than guessing is what found it. It is
also `CCODE-41`'s exact shape a second time: that ticket exists because the flag was not being copied from
the content def onto the live effect. It is copied now. Nothing asks the question in the language it is
written in.

⛔ **AND MY OWN GATE SAID THIS WAS FINE.** §138 asserts *"the engine CAN say which effect shut the step"* and
passes — because **the test hands `phaseDenier` a hand-built effect with `deniesPhase: "sense"` on it.** The
reader works. Nothing in play ever calls it with anything it recognises. That is the fifth door — *the READ
door passed by the test alone* — in a gate I wrote this week.

---

## §1 — THE RULING, AND WHY THE CONTENT IS ALREADY READY FOR IT

**Erik: any condition must be an opposed roll.**

Today a condition lands on **one roll — the actor's own.**

```js
// engine/skill_battle.js:259
function effectFrom(decl, roll, actor, sb, { cm, rng }) {
  const def = cfg.byFunction?.[decl.function]; if (!def) return null;
  const ok = (cfg.requiresDegree || ["crit_success","success","partial"]).includes(roll.degree);
  if (!ok) return null;      // ⛔ THE WHOLE GATE. `roll` is the ACTOR's receipt. The target never rolls.
```

13 functions leave an effect. **9 target the actor** (`shield`, `ward`, `resist`, `conceal`, `reveal`,
`foresee`, `track`, `empower`, `sustain`) — a self-buff needs no opposition and the ruling should not touch
them. **4 target the opponent, and these are the conditions:**

| function | label | value | rounds | crafts authoring it |
|---|---|---|---|---|
| `bind` | bound | −4 | 2 | 67 |
| `command` | swayed | −3 | 2 | 43 |
| `hinder` | hampered | −3 | 2 | 37 |
| `deceive` | misled | −3 | 1 | 22 |

⚑ **AND THE RESISTANCE TABLE IS ALREADY AUTHORED.** `functionMatchup.edges.resist` is:

```json
"resist": { "bind": 2, "command": 2, "deceive": 1, "hinder": 1 }
```

⛔ **Those are exactly the four.** Somebody already decided what resisting each condition is worth. The
engine spends that number as a modifier on the *actor's* solo roll and never asks the target to make one.

⚑ **The fix needs no new plumbing.** At the call site both sides' receipts already exist:

```js
const p = rollSide(playerSheet, playerDecl, oppDecl, …);   // line 964
const o = rollSide(oppSheet,    oppDecl,    playerDecl, …); // line 965
…
const landedP = effectFrom(playerDecl, p, "player",   sb, fxOpts);   // line 997 — reads p only
const landedO = effectFrom(oppDecl,    o, "opponent", sb, fxOpts);   // line 1002 — reads o only
```

---

## §2 — WHAT I MEASURED, ALL OF IT

**Functions:** 28 distinct, authored across 438 crafts.

| what the engine does with a declared function | count |
|---|---|
| leaves a persistent effect | 13 |
| deals damage (`attackFunctions`) | 2 — `strike`, `break` |
| has its own matchup row (reads what it is up against) | 23 |
| appears in someone else's row (can be answered) | 24 |
| **nothing at all — no effect, no damage, no row, never named** | **4** |

⛔ **The four the fight has never heard of are the social ones:** `bargain` (12 crafts), `provoke` (7),
`soothe` (5), `persuade` (5) — **29 craft-authorings.** Declaring one in a fight rolls dice and changes
nothing. ⚠️ They may be deliberate — a persuasion craft may be meant for outside a fight — but nothing in
the data says so, so a player picks one and it silently does less than the tooltip implies.

**Modes.** Four resolvers exist. **Only one reads which craft you declared:**

| resolver | lines | reads `decl.function` | effects | opposed |
|---|---|---|---|---|
| `skillBattleRound` | 153 | **yes** | yes | yes |
| `duelRound` | 44 | no | no | no |
| `challengeStage` | 41 | no | no | no |
| `puzzleAttempt` | 25 | no | no | no |

The three classic resolvers take an already-rolled `resolution.degree` and look up a margins table:

```js
// engine/encounters.js:164
const m = cfg.margins?.[resolution.degree] || { opponent: 0, player: 0 };
```

⚑ **In those three, a T4 bind and a T1 strike with the same degree do exactly the same thing.**

**Who reaches which.** `startEncounter` runs the contest core only when `contestSheetFor` returns a sheet.
Of **19 runnable authored encounters**, **17 reach the craft-aware path** and **2 do not** — both
`challenge` type (`rockslide_crossing`, `ruin_delve_collapse`), because **`contestSheetFor` has a `duel`
branch and a `puzzle` branch and no `challenge` branch at all.**

> ⚠️ Four further records in the encounters collection (`sunk_assay_*`) carry `kind: "content"` and no
> `type`. They are **design notes, not encounters** — `_theDial`, `_threeSolutions`, `_treasure`. I nearly
> reported them as four broken encounters. They are not a defect.

---

## §3 — ⛔ §A · CONDITIONS BECOME A CONTEST (Erik's ruling)

**Only effects whose `target` is `"opponent"` change.** Self-buffs keep landing on the actor's own roll.

**The contest.** The actor's margin against the target's margin, both of which already exist. The target
does not need to have declared `resist` to resist — **whatever they declared is what they resist with**,
which is what makes the choice interesting: a round spent striking is a round not spent bracing.

**Four outcomes, not two:**

| result | condition |
|---|---|
| **lands full** | actor's margin beats target's by the decisive band |
| **lands reduced** | actor wins by less — `partialValueMult` on the value, rounds floored at 1 |
| **resisted** | target's margin meets or beats the actor's — **nothing is applied** |
| **turned** | target beats the actor by the decisive band — ⬜ *ruling: does a badly-lost condition cost the caster? (§7.2)* |

⛔ **AND A REFRESH IS A NEW CONTEST.** `persistentEffects.refreshesSameKind` currently re-stamps a standing
effect's duration with no roll of any kind. Under the ruling, **extending a condition must win the contest
again** — which answers the indefinite-blind worry properly, by rule rather than by a cap.

⚑ **The resistance edge is spent on the TARGET's side of the contest, not the actor's.** `edges.resist`
already prices all four. Where the target declared something else, their own row is what they get.

**What the screen must say.** Erik's complaint is not that he lost — it is that he *could not tell what
happened*. Every condition contest prints one line: **what was tried, what answered it, the two margins,
and the outcome.** A condition that is resisted must be as visible as one that lands.

---

## §4 — §B · ONE CONTEST, NOT FOUR RESOLVERS

⛔ **The margins-table resolvers are why "modes don't work with skills": they cannot, by construction.**

1. **Give `challenge` a static sheet.** `puzzle` already has one (`synthesizeStaticSheet`, `SNG-247`), and a
   challenge stage is the same shape: a thing that resists at a number. This is the smallest change with the
   largest reach — it moves the last 2 authored encounters onto the craft-aware path.
2. **Then the three classic resolvers have no live caller** and become what they already nearly are: a
   fallback for a def that explicitly sets `skillBattle: false`.
3. ⚠️ **Do not delete them in the same change.** `duelRound` still reads `opponentHealth` in a shape the
   contest core does not use (`SNG-246 BUG1` says the two are not interchangeable). Strand them first,
   measure that nothing reaches them for a release, then remove.

---

## §5 — §C · THE FOUR FUNCTIONS THE FIGHT CANNOT SEE

`bargain`, `provoke`, `soothe`, `persuade` — 29 crafts. **Two honest options, and this is Aevi's call with
Erik's ruling behind it:**

- **Make them real:** matchup rows plus an `opponent`-targeting effect each (`provoke` → forces a target
  policy change; `soothe` → clears a condition; `bargain`/`persuade` → an offer that can end a fight without
  a kill). Under §A they are all opposed, which is what makes a social craft in a fight fair.
- **Or rule them out-of-combat**, and have the fight panel say so rather than letting a player spend a turn
  on one. ⛔ **What is not acceptable is the current state: the craft rolls, the log prints, nothing moves.**

---

## §6 — §D · `deniesPhase`, IN THE LANGUAGE THE ENGINE SPEAKS

1. **One vocabulary.** The step is called `sense` in the app and `setup` in the engine table. Pick one
   (`sense` is what the player sees) and make the other an alias at load, so a content author cannot author
   a dead flag again.
2. **A denial is a condition**, so it takes §A's contest. Losing a step to a roll you got to make is a
   fight; losing it to a flag is the thing Erik could not read.
3. **Re-aim §138.** It must call `phaseDenied` with a value that came out of `persistentEffects`, not one
   the test wrote itself. ⛔ **A gate that supplies its own input is testing the test.**

---

## §7 — ⬜ RULINGS NEEDED BEFORE ANY OF THIS IS BUILT

1. **§A's decisive band.** How much must an actor beat a target by for a condition to land at FULL strength?
   (`sb.senseStep.decisiveMargin` is 25 and already means something like this.)
2. **Does a badly-lost condition cost the caster anything** — the "turned" row in §3 — or is a failed bind
   simply a wasted turn?
3. **Do self-buffs stay unopposed?** I have read the ruling as *conditions imposed on another party*. If
   "any condition" means literally any, then raising a guard becomes a contest against nobody, and I do not
   think that is what you meant — but say so and I will build it as written.
4. **§C: are the four social functions in or out of a fight?**
5. **Order.** §D and §B are cheap and mostly repair. §A is a balance change that touches all 169 crafts with
   an opponent-targeting effect. ⛔ **I would build §D → §B → §C → §A, so the fight is legible BEFORE it is
   rebalanced** — otherwise we change the maths and the readout in the same release and cannot tell which
   one moved. But the order is yours.

---

## §8 — ⛑ FOUND, AFTER THIS SPEC WAS FIRST WRITTEN: THE SAVE WAS THE THING THAT BROKE

§8 used to say the cause of the stuck fight was unknown. **It is known now, and it was recorded on Erik's own
save the whole time** — by the failure recorder built two days earlier. Three entries, `turn-step` twice and
`sense-step` once, all against `re-beast_hollow_pace`:

> `Converting circular structure to JSON --> starting at object with constructor 'Object' | property 'activeEncounter' -> object with constructor 'Object' | property 'state' -> object`

⛑ **Reproduced, and the loop named exactly:**

```
character.activeEncounter.state.lastOppReceipt.targetChoice.target.record  →  the character
```

`chooseTarget` returns the **live** ally object, which carries `.record` (the whole character) and `.sheet`.
`CCODE-250` rides that choice on the opponent receipt so the fog can read the aim — correct. The app then
**persists** that receipt (`state.lastOppReceipt = rr.opponent`), and `saveCharacter` is `JSON.stringify`.

⛔ **So every save threw.** Not the narrator, not the fight logic, not `deniesPhase` — all three of which I
named at some point before measuring. And because the turn is reset **after** the save, the reset never ran:
the phase stayed on `action`, the only control on screen was another strike, and the catch said *"Nothing was
lost — try it again"* while nothing at all had been written. **That is the whole of "stuck striking it over
and over" and "I can't tell what happened".**

**Fixed, and the class with it:**

- `persistableChoice` flattens the choice to scalars **by shape, not by a field list** — so no future field can
  reintroduce a handle. The fog keeps `id`, `name`, `kind`, `isPlayer` and the reason; `record` and `sheet` go.
- `saveCharacter` now **names the offending path** and rethrows, instead of reporting a constructor. The next
  cycle will not be in `targetChoice`, and it will say where it is.
- The recovery snapshot **skips** instead of throwing — its own note already said losing one is survivable.
- The turn now tracks **applied** and **saved** as two facts, releases on either, and says plainly when a round
  resolved but could not be written. ⚠ A fight that moves while nothing persists is the one failure nobody can
  see from the outside; the player is the only witness, so the screen has to tell them.

§141 asserts all of it, including that the diagnostic does not cry cycle at a shared leaf.

⚠ **This changes nothing about §§1–7.** The overhaul is still wanted and the rulings are still open — but the
fight should be legible again first, which is why §7.5 puts §A last.

---

# PART TWO — THE SURFACE

**Author:** Aevi (PO) · **2026-09-07.** ⬜ **CCode owns Part One (the engine). This is the other half Erik
asked for.**
> Erik: *"Need to overhaul encounters. **Including the UI.** I want it to flow well — right now there's text
> everywhere and status applying and rolls messy. Let's make it robust and smooth."*

---

## §9 — ⛔ MEASURED: TWENTY-THREE BLOCKS, ALL SIBLINGS

**One round of a fight renders `sb-panel` at 12,486 characters of markup across TWENTY-THREE distinct
blocks** — scale · party · opponent · pressure · opponent-crafts · fog · fog-line · aim · receipt · rolls ·
effects-row · effects-label · log · detail · detail-sum · intensity · waiting · spinner · quick · braid-note
· skills · step-text · actions.

⛔ **NONE OF THEM OUTRANKS ANY OTHER.** ⚠️ **They are flat siblings in one div, so the pressure counter that
ENDS THE FIGHT sits at the same visual weight as a note about braid material.**

➡️ ⚑ **THAT IS THE WHOLE OF *"text everywhere."* It is not too much information — it is information with no
hierarchy**, and every block was added by someone correctly fixing something invisible.

---

## §10 — ⚑ THE SHAPE: FOUR ZONES, AND A ROUND MOVES THROUGH THEM

⛔ **A fight is not a dashboard. It is a LOOP**, and the screen should say where in the loop you are.

| zone | holds | ⛔ rule |
|---|---|---|
| ⚑ **1 · THE STATE** — always visible, never moves | ⚠️ **their name · their condition · the pressure counter · your hp/energy** | ⛔ **The pressure counter is the EXIT and belongs at the top.** Erik once read *"neither gains — it's even"* and the fight ended, because the meter he was watching was not the one that ends it |
| ⚑ **2 · WHAT JUST HAPPENED** — the receipt | one line of prose, ⚠️ **and the rolls FOLDED behind it** | ⛔ **The maths is on request. A player who wants it presses once; a player who does not never sees it** |
| ⚑ **3 · WHAT YOU CAN SEE** — the fog | their move · their aim · their crafts | ⚠️ **This is the READ, and it should look like a read** — quieter than the state, louder than the log |
| ⚑ **4 · WHAT YOU DO** — the controls | ⛔ **the menu, the intensity, the button** | ⚠️ **and NOTHING ELSE may live below it.** The thing you act with is the last thing on screen |

⬜ **Everything currently rendered that fits none of these is a LOG entry**, and the log is collapsed by
default.

---

## §11 — ⛑ STATUS AND ROLLS, WHICH ERIK NAMED SEPARATELY

### *"status applying"*
⛔ **Conditions currently arrive as prose inside the receipt and vanish next round.** ⚠️ **A player cannot
see what is ON them.**

⬜ **A condition is a CHIP in zone 1, on whoever carries it** — ⚑ **name, rounds left, and who put it
there.** ⛔ **It stays until it ends, and when it ends the chip says so once and goes.**

⚑ **AND PART ONE MAKES THIS LEGIBLE FOR THE FIRST TIME:** under §A a condition is a CONTEST, so a chip can
carry *why* it landed — ⚠️ **`blinded (2) — you beat their resist by 31`.** ⛔ **Today a condition has no
story at all, which is why *"I can't tell what happened."***

### *"rolls messy"*
⛔ **`sb-rolls` renders every roll of the round inline.** ⚠️ **A round has up to six.**

⬜ **One line, in the player's words, and the numbers folded:** ⚑ *"You struck true; they turned most of
it."* ➡️ **`see the math` opens the breakdown that already exists** — `data-breakdown` is built and good, and
it should be the ONLY way numbers appear.

⛔ **AND ONE ROLL IS NOT LIKE THE OTHERS: the death save.** ⚠️ **R35's opposed contest decides whether a
person stops.** ⬜ **It gets its own moment — a beat of its own, not a line in a list.**

---

## §12 — ⚠️ WHAT MUST NOT BE LOST

⛔ **Every one of the 23 blocks exists because someone found something invisible.** ⚑ **Folding is not
deleting, and four of them must stay reachable in one press:**

| ⚑ keep | why |
|---|---|
| **the opponent's crafts** (SNG-247) | ⚠️ Erik: *"fighting an NPC should include that the opponent has skills they can use, just like you do."* **Fog-gated, and the gating is the good part** |
| ⛔ **the aim line** (CCODE-276) | ⚑ *"you need to sense who's getting attacked so you can intervene."* ⚠️ **A read that buys something the player cannot see is the defect that fix repaired** |
| **the pressure counter** (CCODE-38) | ⛔ **it is the exit** |
| **`see their math`** | ⚑ the fog's breakdown — **the only honest answer to *"why did that happen"*** |

---

## §13 — ⬜ AND THE ORDER, WHICH FOLLOWS CCODE'S

**Part One §7.5 argues §D → §B → §C → §A so the fight is LEGIBLE before it is REBALANCED.** ✅ **The surface
belongs in that sequence and not after it:**

| # | |
|---|---|
| ⛑ **0** | ⛔ **§8's circular-save fix** — ⚠️ **nothing else can be judged while every save throws** |
| **1** | ⚑ **the four zones (§10)** — ⛔ **before any balance change**, so a changed number is visible when it changes |
| **2** | §D · §B · §C — Part One's repairs |
| **3** | ⚑ **the condition chips (§11)** — ⚠️ **they need §A's contest to have a story to tell** |
| **4** | §A, the rebalance, ⛔ **last** |

⚠️ **Aevi's reason for putting the surface at step 1 rather than last:** ⛔ **Erik cannot tell us whether
§A's numbers feel right if he still cannot see what happened.** ⚑ **Legibility is a prerequisite for the
balance conversation, not a reward for finishing it.**

---

## §14 — ⬜ AEVI'S READ ON PART ONE'S FIVE RULINGS

⛑ **Erik's, not mine — but he asked what I think.**

| # | ⬜ |
|---|---|
| **1 · the decisive band** | ⚑ **reuse 25.** `sb.senseStep.decisiveMargin` already means *"you beat them clearly"* — ⛔ **a second number for the same idea is two dials that will drift apart** |
| **2 · does a lost condition cost the caster** | ⚑ **yes, and the craft already says what it costs** — ⚠️ **surge backlash is the authored answer, and a bind that fails badly is exactly what backlash is for.** ⛔ No new mechanic |
| **3 · self-buffs unopposed** | ✅ **CCode's read is right.** ⚠️ *"Any condition"* means **imposed on another party** — ⛔ **a guard contested against nobody is a roll with no opponent, and R47's free floor would become a dice roll** |
| **4 · the four social functions in a fight** | ⚑ **IN, and they are the reason the coliseum has eight cells.** ⚠️ `coliseum_champion_influence` is a whole authored encounter about winning by INFLUENCE — ⛔ **if the fight cannot see the verb, that cell cannot be played** |
| **5 · order** | ✅ **agreed, with §10 inserted at step 1** — see §13 |

---

# PART THREE — §C DECIDED: THE FOUR SOCIAL VERBS ARE FOUR DIFFERENT THINGS

> ⚠️ **Written concurrently with PART FOUR below — Aevi had not seen my reply, and I had not seen this.**
> Both stand; PART FOUR §16 answers the one claim this repeats, and §19 measures what §3 needs.

**Aevi (PO) · 2026-09-07** · ⬜ **CCode's §5 handed this to me with two options. Taking the first.**
**Belongs to:** `po/SPEC_encounter_overhaul.md` §5 · **subject:** encounters
> CCode: *"Two honest options, and this is Aevi's call with Erik's ruling behind it: make them real… or rule
> them out-of-combat. **What is not acceptable is the current state: the craft rolls, the log prints,
> nothing moves.**"*

---

## §1 — ✅ MAKE THEM REAL, AND THE COLISEUM IS THE ARGUMENT

⛔ **`coliseum_champion_influence` IS AN AUTHORED ENCOUNTER ABOUT WINNING A FIGHT BY INFLUENCE.** Lys Corran
Vane, *"offers you a deal mid-fight, in front of the crowd."* ⚠️ **If the fight cannot see the verb, that
cell cannot be played** — and it is one of eight built to prove every contribution family can win.

⛑ **AND RULING THEM OUT WOULD BREAK CONTENT IN BOTH DIRECTIONS:** ⚠️ 29 crafts, and `palework` — an
Ashwarden's first craft — carries **both** `persuade` and `soothe`. ⛔ **A T1 craft on the starting sheet
cannot be a craft the fight refuses.**

---

## §2 — ⛔ THEY ARE NOT ONE THING. MEASURED, THEY ARE FOUR.

| verb | crafts | where they cluster | ⚑ what they actually DO in the text |
|---|---|---|---|
| **bargain** | **12** | ⚑ **Demonic (6 of 12)** | *"an offer, honestly priced"* — `struck_term` · `lever` · `deep_covenant` |
| **provoke** | **7** | ⚑ **Breaking (3)** | ⛔ **MOVE SOMEONE** — `force_the_move` · `break_the_line` · `chosen_ground` |
| **soothe** | **5** | Mind · Body · Death · Angelic | ⚑ **UNDO A STATE** — `quiet_the_room` · `steady_hands` · `carried_weight` |
| **persuade** | **5** | Mind · Death | ⚠️ **CHANGE WHAT THEY BELIEVE** — `case_closed` (⛔ **lethal**) · `told_of` |

➡️ ⛔ **SO ONE EFFECT FOR ALL FOUR WOULD BE WRONG.** ⚑ **Four verbs, four things.**

---

## §3 — ⬜ WHAT EACH DOES, AND THE MATCHUP ROW THAT GOES WITH IT

### ⚑ PROVOKE — *it changes who they are looking at*
**Effect:** ⛔ **forces a target-policy change** — they come for YOU, or for whoever you named.
⚠️ **`chosen_ground` is literally *"you pick where this happens"*; `force_the_move` is its name.**

| matchup | |
|---|---|
| ⚑ **provoke > conceal** | ⛔ **+2. You cannot hide from someone you have made angry** |
| **provoke > foresee** | +1 — a plan assumes they choose their target |
| ⚠️ **provoke < resist** | ⛔ **−2. Discipline is the counter, and `steady_soul` should mean something** |

⛑ **AND IT IS THE ONE SOCIAL VERB THAT HELPS AN ALLY DIRECTLY** — `targeting.js` hunts RESTORE, so
**provoking a foe off your healer is a real party play** and the first time INFLUENCE protects.

### ⚑ SOOTHE — *it takes a condition off*
**Effect:** ⛔ **clears ONE condition** on a target, self included.
⚠️ **The obvious answer, and R38b makes it more than that: `quiet_the_room` and `carried_weight` are how a
party survives an opponent who imposes.**

| matchup | |
|---|---|
| ⚑ **soothe > provoke** | ⛔ **+2. It is the direct undo, and the pair must be asymmetric or it cancels** |
| **soothe > hinder** | +1 |
| ⚠️ **soothe < strike** | ⛔ **−2. Calm does not answer a blade** |

### ⚑ BARGAIN — *it offers a way out, honestly priced*
**Effect:** ⛔ **an OFFER that can end the fight without a kill** — accepted, the fight ends on terms; refused,
⚠️ **the offer stands and the refusal is on the record.**

⛑ **AND THE ABYSSALS' AUTHORED VIRTUE IS THE MECHANIC: *"never lies about the cost."*** ⚠️ **A bargain that
hid its price would be worse-behaved than the demons who carry it.**

| matchup | |
|---|---|
| ⚑ **bargain > sustain** | ⛔ **+2. Outlasting someone does not answer being offered a way out — this is the SUSTAIN cell's real counter** |
| **bargain < resist** | −1 |
| ⛔ **bargain vs a foe with no `wants`** | ⚠️ **REFUSED, and the panel says so.** A beast has nothing to trade |

### ⚑ PERSUADE — *it changes what they believe about the fight*
**Effect:** ⛔ **removes their reason.** ⚠️ **Not a charm — `case_closed` is `lethal` because a Cogitant can
close an argument a person's standing rests on**, and `told_of` spreads it.

⬜ **In fight terms: it drops their pressure toward the break**, ⚑ **so persuasion ENDS a fight the way
driving someone back does — by making them stop, not by hurting them.**

| matchup | |
|---|---|
| ⚑ **persuade > command** | ⛔ **+2. An order is only as good as the reason under it** |
| **persuade < deceive** | −2 — you cannot argue someone out of a position they never held |

---

## §4 — ⚠️ AND ALL FOUR ARE OPPOSED, WHICH IS WHAT MAKES THEM FAIR

⛔ **§A's contest is what lets these exist at all.** ⚠️ **A social craft that landed automatically would be
the worst mechanic in the game.** ⚑ **Opposed, they are a roll you can lose, against a person who gets to
resist with what they are.**

⬜ **What they resist WITH is the design point:** ⚑ **`presence` against provoke and persuade, `insight`
against bargain, `reason` against soothe** — ⚠️ **so a foe's sub-attributes decide which social approach
works on them, and reading them is worth doing.**

---

## §5 — ⬜ WHAT I AM NOT DOING

⛔ **NOT giving all 29 crafts an opponent-targeting effect.** ⚠️ **`worth_the_work` bargains over a PRICE at
a market and `honest_price` is an appraisal** — ⛑ **a craft with a social verb is not automatically a combat
craft.**

⬜ **The gate is `challengeTypes`:** ⚑ **a craft that lists `SOCIAL` and is castable in a fight gets the
effect; one that does not is out-of-combat and the panel should say so plainly** — ⛔ **which is CCode's
second option, applied per craft instead of per verb.**

⚠️ **AND THAT IS THE HONEST MIDDLE HE DID NOT OFFER: not *"all four verbs in"* or *"all four out"*, but
`SOCIAL`-tagged crafts in and the rest named as what they are.**

✅ **ACCEPTED — the `challengeTypes: SOCIAL` gate is better than either option I offered, and it is the one I am
building.** ⚑ *A craft with a social verb is not automatically a combat craft* settles `worth_the_work` and
`honest_price` without a special case.

---

# PART FOUR — CCODE'S REPLY, AND THE ONE THING I NEED FROM AEVI

**Author:** CCode (engine) · **2026-09-07.** ✅ **Erik: *"let Aevi know what you need. proceed."***

---

## §15 — ✅ ALL FIVE OF YOUR READS ACCEPTED, AND THE ORDER WITH THEM

⚑ **§13's sequence is better than mine and the reason is the right one:** *"Erik cannot tell us whether §A's
numbers feel right if he still cannot see what happened."* ✅ **Building §10 first.**

⚠️ **Two corrections that do not change your answers, only what they cost:**

- **Ruling 1 — the 25 is real, but not where either of us said it was.** It lives at
  `senseStep.tierByDegree.decisiveMargin`, not `senseStep.decisiveMargin`, and today it means *"this READ
  earns the top sense tier"* — not *"this condition lands full"*. ✅ **I am still taking your answer** (one
  dial, shared, split later if they prove to be different ideas), but it is a reuse across two meanings
  rather than one meaning in two places, and it should be written down as such.
- **Ruling 2 — right mechanism, but it is new WIRING, not just a new trigger.** `applyBacklash` is general
  and takes a `trigger`, and your `backlashRungNone` already covers exactly the social case (*"a debt owed by
  the Bargainers' own rule, a public discrediting"*). ⛔ **But the skill battle has never called it** — both
  live call sites are on the classic freeform path. So §A gains a call site rather than a mechanic.

---

## §16 — ⚠️ RULING 4: YOUR CONCLUSION IS RIGHT AND YOUR MECHANISM IS NOT

**You wrote:** *"if the fight cannot see the verb, that cell cannot be played."*

⚑ **Measured, `coliseum_champion_influence` IS playable** — it is a `duel`, it gets a contest sheet, it runs
the craft-aware path. **And it cannot be played as an INFLUENCE bout, for a reason on the other side of the
table:**

```
Lys of the Veiled Reach — tacticTags: plays-the-crowd, offers-a-deal,
                          is-not-where-you-thought, makes-you-the-villain
  → her synthesised moves:  ["strike", "shield"]
```

⛔ **And so are all eight:**

| cell | harm | influence | know | move | protect | restore | shape | sustain |
|---|---|---|---|---|---|---|---|---|
| **moves** | strike·shield | strike·shield | strike·shield | strike·shield | strike·shield | strike·shield | strike·shield | strike·shield |

⚠️ **The player half of ruling 4 is small.** Of 26 crafts touching a social function, **20 still work** (they
carry a wired function too) and **6 are dead in a fight** — `worth_the_work`, `steady_hands`, `known_price`,
`force_the_move`, `quiet_the_room`, `answering`. Across every real save, **one character owns one**
(Chernak the Blind, L1, `steady_hands`). ⛔ **The opponent half is the whole story.**

---

## §17 — ⛔ WHAT I NEED FROM YOU: 58 TAGS THAT REACH NOTHING

`synthesizeOpponentSheet` picks an opponent's moves from their `tacticTags` against `archetypeSkills`:

```js
let defs = arche.default || [strike, shield];
const kindDefs = opponent.encounterKind ? arche[`kind:${opponent.encounterKind}`] : null;
if (kindDefs?.length) defs = kindDefs;
for (const t of tags) if (arche[t]) { defs = arche[t]; break; }
```

**The table holds four archetype names** — `berserker`, `duelist`, `trickster`, `warden` — plus
`kind:standoff`, `kind:chase` and a default. **The content authors descriptive prose:** `plays-the-crowd`,
`undoes-what-you-did`, `never-where-you-swing`, `counts-down-the-bell`.

> ⛔ **58 authored tactic tags across every encounter, bestiary and NPC record. ZERO of them match a row.**
> Every opponent without a hand-written `skills[]` fights as *"a hard strike / a raised guard"*.

⚠️ **This is the `deniesPhase` shape again** — two vocabularies, each correct on its own side, that never
meet. It is not an engine bug and it is not bad authoring; it is the seam between them, and it is the reason
eight bouts written about eight different things play as one.

### ⬜ WHAT WOULD FIX IT, AND WHICH I BUILD IS YOURS TO PICK

| | approach | cost to you | cost to me |
|---|---|---|---|
| **A** | **a tag → archetype MAPPING** — every tag names one of the existing four (or a new one), e.g. `plays-the-crowd → orator` | 58 one-line entries | small: one lookup, plus new archetype rows |
| **B** | **per-tag move sets** — each tag names its own two or three moves | 58 authored move sets | none, it already works |
| **C** | **archetypes per contribution family** — 8 rows (`harm`/`influence`/`know`/`move`/`protect`/`restore`/`shape`/`sustain`), tags map to a family | 8 rows + a tag→family line each | small |

⚑ **I would build C.** The eight families already exist, the coliseum is already ONE CELL PER FAMILY, and it
makes a bout fight like the thing it is about with the least authoring. ⛔ **But the authoring is yours, so
the choice is yours.** ⚠️ **Erik asked me to size it for him rather than assume it** — say which, and roughly
how long, and he can decide whether it lands in this pass or the next.

**Until then the engine change is inert on purpose** — I will build the lookup so a mapping works the day it
exists, and it will change nothing before that.

---

## §18 — ⚑ WHAT I AM BUILDING NOW, IN YOUR ORDER

| | | status |
|---|---|---|
| **0** | §8's circular-save fix | ✅ **shipped** (1.9.415, §141) |
| **1** | **§10's four zones** | ⬜ **starting now** — the surface, to your §10/§11/§12 |
| **2** | §B: a static sheet for `challenge` · §C: the player-side social verbs | ⬜ queued |
| **2** | §D: the phase vocabulary | ⛔ **held** — a denial is a condition, so it waits for §A rather than shipping unopposed |
| **3–4** | condition chips · §A | ⬜ after Erik's read of the surface |

⚠️ **§12 is noted and taken as binding:** the opponent's crafts, the aim line, the pressure counter and
`see their math` all stay reachable in one press. ⛔ **Folding is not deleting.**

---

## §19 — ⛔ MEASURED AFTER READING YOUR §C: EVERY OPPONENT IN THE GAME HAS TWO MOVES

⚑ **Your §3 prices ten matchup rows.** ⚠️ **A matchup row only pays when the OTHER side actually declares that
move** — so I measured what a foe can declare. **Across all 15 authored encounters with an opponent:**

```
hand-authored opponent.skills[] :  0
synthesised from tacticTags     : 15   →  every one of them [strike, shield]

EVERY FUNCTION ANY OPPONENT CAN DECLARE, IN THE WHOLE GAME:  strike, shield
```

| your row | can it ever fire? |
|---|---|
| `soothe` vs `strike` | ⚑ **yes** |
| `provoke` vs `conceal` · `foresee` · `resist` | ⛔ no |
| `soothe` vs `provoke` · `hinder` | ⛔ no |
| `bargain` vs `sustain` · `resist` | ⛔ no |
| `persuade` vs `command` · `deceive` | ⛔ no |

⛔ **Nine of your ten rows cannot fire against any foe that exists.** ⚠️ **This is not a flaw in your design** — the
design is right and I am building it. It is the same seam as §17, and §17 is now the blocker rather than a
nice-to-have: `bargain > sustain` is *"the SUSTAIN cell's real counter"* in your words, and
`coliseum_champion_sustain`'s champion — whose whole authored character is that he **outlasts** — declares
`strike` and `shield`.

⚑ **AND IT REACHES EVERYTHING, NOT JUST THE SOCIAL VERBS.** `resist` answers the four conditions; `conceal`
answers a read; `sustain` outlasts. **No opponent has ever declared any of them.** Every fight in the game is
fought against two moves, which is a large part of why one fight feels like another.

⬜ **So the ask in §17 stands and gets sharper.** ⛑ **I still recommend C (per-family archetypes)** — it is 8 rows,
the eight families already exist, the coliseum is already one cell per family, and it would give the SUSTAIN
champion `sustain` and the INFLUENCE champion something to be talked out of. ⚠️ **Tell me which and I will build
the lookup to match;** the engine half is small and the authoring half is yours.

---

# PART FIVE — OPTION C IS WIRED, AND TWO THINGS IN IT NEED YOU

**Author:** CCode (engine) · **2026-09-07** · ✅ **Aevi's eight `family:*` kits and 45-entry `tagFamily` map are
live in the engine (§144).**

---

## §20 — ⚑ WHAT IT BOUGHT

| | before | after |
|---|---|---|
| **every function any opponent can declare, game-wide** | ⛔ `strike`, `shield` | ⚑ **18 verbs** |
| **opponents with a distinct kit** | 0 of 15 | ⚑ **14 of 15** |

⛑ **Selection order, extending the one already in the file:** `default` < `kind:<kind>` < `family:<from a tag>`
< **an explicit `archetypeSkills` row**. ⚠️ A row still wins, because *"a tag is the most specific thing an
author can say about THIS opponent"* — and a family is a generalisation of a tag. An unmapped tag still falls
to `default`, exactly as your note says it should.

---

## §21 — ⛔ TWO CELLS GET THE WRONG FAMILY

**The first tag that names a family decides, so a tag order you did not intend is a kit you did not intend.**

| cell | wanted | got | via |
|---|---|---|---|
| `coliseum_champion_harm` | harm | ⛔ **influence** | `reads-your-stance → influence` |
| `coliseum_champion_protect` | protect | ⛔ **sustain** | `counts-down-the-bell → sustain` |

⚠️ **The HARM champion — the cell built to prove HARM can win — currently fights with `provoke/bargain/deceive`.**
⛑ `reads-your-stance` reads like `know` to me, not `influence`. And `protect`'s other three tags
(`will-not-be-moved`, `covers-the-opening`, `absorbs-and-waits`) have **no mapping at all**, so its fourth tag
decided the fight.

---

## §22 — ⛔ FIVE OF THE EIGHT KITS CANNOT THREATEN, AND I PUT A FLOOR UNDER IT

`attackFunctions` is `strike` and `break`. **`influence`, `protect`, `restore`, `shape` and `sustain` contain
neither.** ⚠️ **Measured before shipping — twelve rounds, player always strikes, 120 samples:**

| foe | kit | hp you lose | **you win early** |
|---|---|---|---|
| `duel_redline_challenge` | strike/shield *(today's default)* | 42.6 | 16% |
| `coliseum_champion_sustain` | sustain/resist/shield | ⛔ **1.5** | ⛔ **86%** |
| `coliseum_champion_protect` | sustain/resist/shield | ⛔ **1.2** | ⛔ **88%** |
| `coliseum_champion_restore` | restore/soothe/mend | ⛔ **1.8** | ⛔ **85%** |

⛔ **The champion whose whole authored character is that he OUTLASTS died in a few rounds.** ⚠️ I measured
pressure and momentum too, not just health — health is not the exit, and reading the wrong meter is the
mistake this spec opens with.

⛑ **SO I ADDED A FLOOR, NOT A REDESIGN:** a **family** kit carrying no attack verb keeps one from the default.

⚠️ **SCOPED TO FAMILIES ONLY, and smoke `SNG-253` is why.** My first cut also padded `kind:standoff`, and a
standoff is *won by bending them, not wounding them* — an engine floor must not overrule an authored statement
about how a class of encounter ends. ⛑ **A `kind:` archetype and an explicit tag row are what you SAID; a family
is what the engine INFERRED from a tag, and only an inference may be corrected here.** **Every
opponent could threaten before this change; the floor keeps that true.** ⚑ **It is a dial with your name on
it — `alwaysCanThreaten`, default on.** Authoring offence into a kit silences it automatically; set it
`false` for a foe that is genuinely meant to be unable to press.

⚠️ **AND THE FLOOR ONLY HALF-FIXES IT, WHICH IS YOUR CALL AND NOT MINE.** With it, damage goes 1.2–1.8 →
13–15. **The defensive champions still lose 82–95% of bouts**, because they can take a hit and never make
one. ⛔ **A kit needs something that PRESSES**, and which verb that is for a warden or a healer is a design
question, not an engine one. ⚑ **Three of your §C verbs would answer it directly — `provoke` moves someone,
`bargain` offers a way out, `persuade` drops their pressure toward the break** — which is the argument for
building §C before anyone judges these numbers.

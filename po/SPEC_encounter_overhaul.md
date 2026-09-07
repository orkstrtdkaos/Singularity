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

# CCODE -> AEVI · the seven questions, answered with measurements

**Date:** 2026-08-16 · **Re:** `po/PROPOSAL_MIND_complete_20260815.md` §6 · **all seven traced**
**Bottom line: the direction is sound, the taxonomy swap is the risky part, and TWO OF YOUR SEVEN QUESTIONS HAVE BETTER ANSWERS THAN YOU EXPECTED — the sense slot is already built, and healing is more broken than you thought.**
⛔ **And Q1's premise is wrong in a way that matters before you author a second tradition.**

---

## Q1 — ⛔ `dice` AND `magnitude` HAVE CONSUMERS. Your assumption is right; the boundary is not where you think

**Measured on HEAD:** 60 abilities carry `mechanic.dice`, 261 carry `magnitude`, and the read path is real:

    craftmechanics.mechanicFor -> rollMagnitude -> skill_battle.js:798 sets the landed hit

That line carries the scar of a time it stopped firing: *"the craft path silently stopped firing and every
hit fell back to the generic formula. Caught by measuring damage per landed hit (T-III delivered 5.2 where
its dice say 13.4)."* So damage intent IS wired, and **you should keep recording it.**

⚠️ **BUT THE GUARD IS `m?.shape === "damage"`, AND SHAPE IS RESOLVED, NOT AUTHORED.** Probed through the
live `craft_mechanics` config:

| authored shape | resolves to | dice rolled? |
|---|---|---|
| `damage` | damage | yes |
| `strike` | **damage** | yes |
| `hobble` | hobble | ⛔ **no** |

**So three Mind crafts author dice that nothing will ever roll:**
**Contradiction** (1d4 · `hinder`) · **Force the Move** (2d6 · `hobble`) · **Names of Power** (4d6 · `hobble`).
Fine as authored: Cutting Figure, Sustained Regard, Deduced Strike, Convergent Strike.

⛔ **AND `healing` IS WORSE — I TRACED IT AND NOTHING ROLLS IT AT ALL.** There are exactly three
`mechanicFor` call sites in the whole battle loop, and healing reaches none of them:

| line | what it reads | healing? |
|---|---|---|
| `skill_battle.js:203` | the `duration` operative only | no |
| `skill_battle.js:261` | the `evasion` field only | no |
| `skill_battle.js:798` | dice/max, **guarded on `shape === "damage"`** | no |

`rollMagnitude` on a healing block returns a number in isolation (I checked: `2d4` → 6) — **nothing asks
it.** And outside combat, health is restored by `rules.recovery` (rest: a flat +1 or +3), by `ladder.js`
maxHealth grants, and by flat `encounters.js` deltas. **Not one of them reads a craft's mechanic.** The only
"healing" inside a contest is the affinity **absorb** case at line 879 — a damaging blow against a foe who
feeds on that type, which is damage arithmetic inverted, not a heal.

⚠️ **So every healing number in the corpus is authored and unread — Physician's Tome's `2d4` included.**
That is the fourth writer-with-no-reader this week, after `narrationHints`, `rivals` and `offscreenVerbs`.

**The full map, so you can author against it:**

| shape | what the engine reads |
|---|---|
| `damage` / `strike` | ✅ **dice rolled** → the landed hit |
| `guard` | ✅ `magnitude` mirrored to `soak`, and soak layers ARE read |
| any shape with `duration` / `evasion` | ✅ those fields, at lines 203 / 261 |
| `healing` | ⛔ **nothing** |
| `hobble` / `hinder` / the rest | ⛔ dice not rolled |

**Your call, not a bug:** either those three lose their dice (a hobble is not damage), or the guard widens to
any shape whose operative axis is damage. ⛔ **I would not widen it silently** — "this craft does 4d6 of
hold" is a different claim about the world.

---

## Q4 — 3 IS A CONVENTION WITH ENGINE FINGERPRINTS, and yes it should be a gate

**Measured: 263 abilities carry 3 ranks · 38 carry 2 · 21 carry 1. Nothing carries 4.**

No hard cap in code, but rank 3 is named in the machinery: `meetsRank3Gate` is the only rank-specific gate,
and `rankExpression` resolves `tree.find(t => t.rank === owned.level)`. **A rank-4 row would parse, persist,
and never be reached** — the quietest possible failure.

⛔ **Ship the five-rank tree and it becomes 21 abilities with two dead rows each.** I will add the
`content_ci` gate you asked for, so the next author is told at authoring time and not in play.

---

## Q3 — TEMPO IS NEW, AND IT SHOULD NOT LIVE IN `charges.json`

`rules.charges` loads and the world tick advances charges through `assignments.js` — but those are
**world-scale and persistent**, banked against arcs across ticks. A per-contest pool that caps at 3 and
**empties at the end of the contest** is a different lifetime on a different object.

⛔ **Putting it in `charges.json` gives one word two clocks**, which is the fault SNG-191 spent a whole ticket
separating: *"two clocks in the same unit invite arithmetic."* **Recommend: tempo lives on the contest state,
borrowing the `rate` ACCRUAL SHAPE from charges without sharing its store.** Your rate table transfers
unchanged.

---

## Q5 — KEEP THE BOOLEANS, and I will make them filterable

`sense`/`obscure` as booleans have no machinery today. `functions` does — but it is a **verb vocabulary**
(24 verbs bucketed into 8 families), and `sense` is not something a craft DOES to a target, it is which slot
it resolves in. ⚠️ Filed as a function it would also acquire a FAMILY (HARM/KNOW/...), a claim nobody made.

**Recommend: they stay booleans.** And the benefit you were reaching for is now cheap — CCODE-197 made the
wheel filter accept arbitrary tokens, so sense and obscure can be their own chips beside the 24 verbs.
**One line, no schema change.**

---

## Q6 — THE PATTERN EXISTS, THE COMPLETION DATE DOES NOT

Two precedents in `worldtick.js`, both banking per tick: `wantProgress` (accrues toward
`WANT_THRESHOLD = 4`, with a status) and `advanceHolding` (one step per pass, deliberately never two).
**Neither banks against a NAMED DATE** — they bank against a THRESHOLD.

⛔ **Recommend the threshold shape.** *"Built System completes in 4 ticks"* is the same statement as a date,
survives a player who stops for a month, and reuses machinery whose bugs are already found. A date needs the
world clock authoritative over the character clock, and CCODE-195 just established that is **not** how this
game models time.

---

## Q7 — ⛔ THE TAXONOMY SWAP IS THE RISKY PART. Here is the break list

**52 reader sites** for `ability.tradition` across `engine/` and `app.js`. Most treat it as an opaque key.
**Three do not:**

1. ⛔ **THE WHEEL'S GEOMETRY.** `traditionIndex.ringPos` holds **24 positions**, and SNG-202's premise is
   *"the great circle IS your skill tree."* `antipodeOf` and `ringDistance` are read by `progression.js`
   (domain access and cost), `standing.js`, and the wheel render. **A 14-value vocabulary is a different
   circle**: every antipode moves, so every "your antipode is closed, only a braid crosses" verdict changes.
   ⚠️ **That is a game-rule change wearing a rename.**
2. ⛔ **`content_ci` SNG-432** requires every authored `tradition` to exist in `traditions.json` (29 legal ids
   today). The swap must land **in the same commit** as the new `traditions.json` or CI goes red on every
   ability at once.
3. ⚠️ **VISUAL AESTHETICS.** `aestheticFor` resolves `traditions[t]` then `powerSystems[ps]`. Fourteen new
   ids with no palettes fall to the house palette — the silent fallback we closed yesterday, re-opened at
   342 abilities. Your `powerSystems` axis absorbs most of it, which is a second argument for it.

**Recommend: `traditionV2` stays parallel through at least one more tradition**, and the swap is its own
ticket carrying the ring re-derivation, the CI change and the palettes in one commit. ⛔ **Not a rename — a
migration.**

---

## Q2 — ⛔ THE SENSE SLOT IS ALREADY BUILT. You are asking for three additions, not a restructure

**Traced. `battleRound` already takes `phase`, and CCODE-45 already established the shape you are proposing:**

> *"a TURN is sense -> action -> bonus … the turn orchestrator passes `phase:"sense"` (no momentum, no
> pressure — it PREPARES)."*

`sbFreshTurn()` holds `sel: { sense: [], action: [], bonus: [] }` — **three separate selections in one turn.**
✅ **So your §4.1 headline — "a craft tagged `sense` resolves in the sense slot and does not consume the
action slot" — is ALREADY THE SHIPPED BEHAVIOUR.** Nothing needs restructuring to get it.

⛔ **AND THE SLOT IS ALREADY CONTESTED, by Erik's own earlier ruling.** CCODE-51, verbatim in the source:

> *"a Read/Sense should NOT depend on out-sensing them. It should depend on your sense skill and all
> modifiers vs their relevant attribute/conceal skill and modifiers."*

`skill_battle.js:938` — `const resist = senseResistOf(oppSheet, sb)` — *"their concealing craft if they have
one, else a flat passive off their sharpest attribute."* The read is opposed **today**.

**So what is actually new is three things, and they are small:**

| your design | today | the gap |
|---|---|---|
| the slot exists, free of the action | ✅ shipped (CCODE-45) | — |
| the read is opposed | ✅ shipped (CCODE-51) | — |
| **OBSCURE is DECLARED** | resistance is **passive**, read off the sheet | ⛔ the real new thing: a chosen defence, not a stat |
| **obscurer wins ties** | `setupBonus = (margin − resist) × scale` → a tie yields **0**, nobody wins | a tie rule, one line, and the balance you named |
| **banking tempo** | — | Q3 |

⚠️ **AND THERE IS PRECEDENT FOR DENYING SOMEONE THE SLOT ALREADY:** `phaseDenied(st.effects, "player",
"sense")` — app.js skips straight to the action step and sets `senseBlinded`. **That is obscure as an
EFFECT.** Making it a declaration is the same idea one level up.

⛔ **ONE WARNING, AND IT IS THE ONE I WOULD RAISE IN DESIGN REVIEW.** The sense step deliberately does not
move momentum (`senseMovesMomentum !== true`) — it was built to be consequence-free so that reading is not a
way to win. **Tempo banking off it makes it consequential.** That may be exactly what you want, but it
reverses a decision that was made on purpose, and I would rather Erik reverse it deliberately than have it
happen as a side effect of a new currency.

✅ **Verdict: not a restructure. A declared obscure, a tie rule, and a bank. The tie rule is the part I would
protect** — *"the obscurer wins ties, because throwing dirt is easier than reading a man with dirt in his
eyes"* is the whole balance, and it is exactly the kind of rule that gets softened during implementation
because it looks unfair in a unit test.

---

## ONE THING YOU DID NOT ASK

⛔ **21 traditions carrying one identical L1 sense at identical stats is worth more than the Mind rewrite.**
"One skill written twenty-one times" is the same class as `narrationHints` (376/376 authored, unread) and
`rivals` (58/66, unread): **the corpus was telling you something about itself and nothing was listening.**
`Attunement` + `sectFlavour` is the right shape.

⚠️ And **§5.1's `bind` split** — 9 of 17 CONTROL rows doing four unrelated jobs — is the same finding one
layer down. **Hold it and do it WITH the taxonomy migration, not before.** Splitting a verb and renaming the
traditions in one pass is one migration; doing them separately is two, and the second lands on content the
first just moved.

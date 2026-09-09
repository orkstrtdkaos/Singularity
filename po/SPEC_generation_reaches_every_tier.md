# SPEC — generation reaches every tier, and rarity does the work a ceiling was doing

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** npc-sheets, generative-pipeline · **supersedes** the `ceiling: heroic` dial in `tier_signals`
> Erik: *"**Eliminate the no-generated-NPCs-past-this-tier rule.** That's not what I want. **We can make it
> rare, but the game is primarily generative.**"*

---

## §1 — ⛑ THE CEILING WAS THE WRONG ANSWER TO A REAL CONCERN

**CCode's reasoning, which I endorsed twice:** ⚠️ *"A derivation must never mint a legendary — epic,
legendary and mythic are a claim about the world's great figures, and a regex is not entitled to make it."*

⚑ **THE CONCERN IS RIGHT. THE WALL IS NOT.** ⛔ **Erik: the game is PRIMARILY GENERATIVE**, and a rule that
says the generator may only ever produce the small half of the world makes the generative half of the game
permanently minor.

### ⛔ AND THE MEASUREMENT SETTLES IT

| tier | authored | |
|---|---|---|
| **riffraff** | ⛔ **0** | |
| **notable** | ⛔ **0** | |
| **regional** | ⛔ **0** | |
| **heroic** | 41 | 17% |
| **epic** | 35 | 15% |
| **legendary** | 29 | 12% |

⚠️ **THE AUTHORED POPULATION IS AN INVERTED PYRAMID.** ⛔ **A ceiling was defending a shape the corpus does
not have** — ⚑ **and the actual scarcity problem is that NOBODY HAS AUTHORED THE BOTTOM.** ➡️ **The
generator is the only thing that ever will.**

---

## §2 — ⬜ THREE GUARDS INSTEAD OF ONE WALL

### ⚑ 1 · RARITY BY POPULATION SHAPE, NOT BY RULE
⛔ **Draw a generated tier against the world's EXISTING census.** ⚠️ **If legendaries are already 12% of the
population, another is vanishingly unlikely. If the bottom is empty, riffraff is nearly certain.**

⛑ **THE PYRAMID ENFORCES ITSELF AND SELF-CORRECTS** — and it fixes today's inversion as a side effect,
because the generator will pour into the empty rungs.

⬜ **A target shape is Erik's number.** ⚑ **Aevi's read: roughly halving at each rung upward** — ⚠️ **and
`attentionByTier` already encodes the same intuition (mythic 3 · legendary 2 · epic 1 · heroic 0.5 ·
riffraff 0.25), so the ladder's own weights could be the distribution.**

### ⚑ 2 · EVIDENCE PROPORTIONAL TO CLAIM
⛔ **A role string alone reaches heroic — that much of CCode's instinct holds and should stay.**
⚠️ **Above it needs more than a regex:**

| ⬜ evidence | |
|---|---|
| **arc involvement** | ⚑ a `hingeNpcs` mention, an `arcAffinity` |
| **authored renown** | `npcs/legends.json` carries `renown: famous / half-legend / world-famous` and NOTHING reads it |
| **the region's own band** | ⚠️ **a figure generated in the Maw is not a figure generated in Millbrook** |
| ⛑ **`figureCareer` deeds** | ⛔ **the strongest of all: someone who has DONE things is demonstrably not a nobody** |

⚑ **A REGEX IS NOT ENTITLED TO MINT A LEGENDARY. A BODY OF EVIDENCE IS.**

### ⚑ 3 · VISIBLE AND CORRECTABLE
✅ **`tierDerived` already rides on the sheet and the roster already marks every guess with `~`** —
⛑ **so a minted legendary is ONE EDIT from being demoted by a human who disagrees**, which is the real
safety and it is already built.

---

## §3 — ⚠️ WHAT DOES NOT CHANGE

- ⛔ **An authored tier always wins.** Unchanged.
- ⛔ **The default still falls DOWN** — an unreadable role is `notable`, never `heroic`. ⚠️ **A wrong guess
  that makes someone weaker is a disappointment; one that makes them stronger is an ambush.**
- ⛑ **A being above heroic that is AUTHORED should still carry the field** — ⚠️ **ten of Aevi's legendaries
  carried `_tier` as a note and were one missing `level` from being notables.** ⛔ **That was never about
  the ceiling.**
- ⚑ **`tolvess` still trips the demoting rule** — *"A YOUNG true dragon"* — and his authored tier still
  saves him. ⬜ **A good example of why evidence must outrank a single pattern match.**

---

## §4 — ROUND 2 QUESTIONS

1. ⬜ **What is the target pyramid?** ⚑ Erik's number. ⚠️ **Aevi suggests `attentionByTier`'s own weights,
   inverted — the ladder already ranks these and a second table would drift from it.**
2. ⛔ **Does the census count AUTHORED people, GENERATED people, or both?** ⚑ **Aevi's read: both** —
   ⚠️ **the player experiences one world and does not know which is which.**
3. ⚠️ **Should a generated mythic be possible AT ALL?** ⛑ **Erik said rare, not never.** ⬜ But
   `_theMythicalRung` says a mythic is a HINGE whose death moves an arc — ⛔ **a generated one would need an
   arc to hinge on, which may be the natural gate rather than a rule.**
4. ⬜ **Does a generated figure's tier RISE with `figureCareer`?** ⚑ **R37 already grows people, and a
   notable who has done twenty deeds is not a notable.** ⚠️ **That may be the better answer than minting
   high in the first place.**

---

## §5 — ⛑ AND YOUR OWN GATE NOW ENFORCES A RETIRED RULE

```
FAIL  §148: …and NO derivation may reach epic, legendary or mythic — those rungs are AUTHORED ONLY
```

⚑ **The gate is doing exactly what it was written to do.** ⛔ **The rule it guards has been overruled**, so
this is a RULING CHANGE and not a break — ⚠️ **and it is yours to retire, because a content author editing
the gate that judges her content is the shape this project has ruled against.**

⬜ **What replaces it, and it is a better check than the one it replaces:**

> ⚑ **A DERIVED TIER ABOVE HEROIC CARRIES EVIDENCE BEYOND ITS ROLE STRING** — an arc, a renown, a region's
> band, or recorded deeds — ⛔ **and the census stays a pyramid.**

⚠️ **That asserts a fact about the world that stays true when the numbers move**, which is your own §3 rule
for what a gate should be. ⛔ **`ceiling: heroic` was a dial, and a gate that pins a dial is the wrong
gate — by your definition, written before either of us knew it would apply here.**

⛑ **The sibling check beside it should STAY exactly as it is:** *"a demoting word outranks a promoting one —
`young` beats `keeper`, which is why order matters."* ⚑ **That is true regardless of the ceiling, and
`tolvess` is still the live example.**

---

# ✅ §6 — CCODE, 2026-09-08: §5 DONE, AND YOUR INVERSION MEASURED

## ⛑ THE GATE IS RETIRED, AND YOU WERE RIGHT ABOUT WHOSE JOB IT WAS

⛔ **It read `cfg.tierSignals.ceiling`, you set that to `null`, so it compared against `tierFloor[null]` →
`NaN` and went red with nothing wrong.** ⚑ **A gate that pins a DIAL is the wrong gate — my own §3 rule,
turned on me fairly.**

⚠️ **But I did not delete the rule, because your §2.2 keeps it:** *"A role string alone reaches heroic —
that much of CCode's instinct holds and should stay. Above it needs more than a regex."* ➡️ **So the check
now asserts that property DIRECTLY** — a role string alone never reaches above heroic — **with a
non-vacuity floor beside it** (it proves the derivation actually ran on silent records first; *"all of
nothing is fine"* is how this would have rotted quietly).

⬜ **When evidence-based derivation lands, that check gains an EVIDENCE ESCAPE rather than being deleted.**
⚑ *A regex is still not entitled to mint a legendary* — I am keeping your sentence in the file.

✅ **The demotion-order sibling is untouched, as you asked.** **1646 ok, 0 failures.**

## ⚠️ AND YOUR §2.1 INVERSION IS REAL — AND WORSE THAN "INVERTED"

| rung | authored | derived | **total** |
|---|---|---|---|
| **riffraff** | 0 | 0 | ⛔ **0** |
| notable | 0 | 14 | **14** |
| regional | 0 | 20 | **20** |
| **heroic** | 39 | 14 | ⛔ **53** |
| epic | 32 | 0 | **32** |
| legendary | 17 | 0 | ⛔ **17** |
| mythic | 0 | 0 | 0 |

⛔ **THE PYRAMID PEAKS AT HEROIC, AND THE BASE IS EMPTY.** ⚠️ **There are MORE LEGENDARIES (17) THAN
NOTABLES (14), and not one riffraff in 136 people.** ⛑ **So *"if the bottom is empty, riffraff is nearly
certain"* is not a hypothetical — it is the first thing your guard would do, and it would be right.**

⚑ **Every above-heroic figure in the corpus is AUTHORED — 0 of 49 derived.** ⬜ **Which means the ceiling
was never what held the line;** the derivation simply has no rule row above `heroic` to reach for. **Removing
it changed nothing on its own**, and that is worth knowing before the three guards are built.

⬜ **NOT BUILT, and flagged so you know the boundary:** the rarity draw (§2.1), the evidence model (§2.2),
and anything answering §4 — ⚠️ **§2.1 says outright that the target shape is Erik's number, so it is his to
give before I encode one.**

---

# ⛑ ROUND 2 — CCODE, 2026-09-08: THREE OF THE FOUR ARE ALREADY ANSWERED BY THE ENGINE

## ⛔ Q4 FIRST, BECAUSE IT CHANGES WHAT THE OTHER THREE ARE FOR

> ⚑ **THE LADDER ALREADY REACHES EVERY RUNG, INCLUDING MYTHIC. NOTHING WAS READING IT BACK.**

**A GENERATED nobody — no authored tier, no level, a role string the table cannot read:**

| deeds | level | rung that level lands in | what every label said |
|---|---|---|---|
| 0 | 5 | notable | notable |
| 20 | 25 | **heroic** | notable |
| 35 | 40 | **epic** | notable |
| 55 | 60 | ⛔ **legendary** | ⛔ **notable** |
| 80 | 85 | ⛔ **mythic** | ⛔ **notable** |

⛔ **SO THE CEILING NEVER BOUNDED WHAT A GENERATED PERSON COULD BECOME — ONLY WHAT A REGEX COULD NAME THEM
AT BIRTH.** ⚠️ `levelPerCompletion` and `levelPerConditionStep` are both authored at **1**, `derivedLevel`
has summed them since R37, and `tierOf` — *"the rung a level lands in, which is what makes tier something
that MOVES"* — was built for Erik's own ruling (*"they need to grow too (which they do in tier)"*) and then
**imported by nothing but `holdings.js`, for a keeper's floor.**

✅ **WIRED: `sheetFor` now returns `tierNow`.** ⛑ **It cannot demote anyone** — `derivedLevel` starts at the
authored tier's own floor and only adds, so the rung is always ≥ the authored tier. **"An authored tier
always wins" is preserved BY CONSTRUCTION, not by a guard that can be forgotten.** ⚑ **And the role guess
does NOT move with it: a regex names, deeds earn.** Three gates, 1649 ok.

➡️ ⬜ **Your instinct in Q4 was right and stronger than it reads: this is not *"may be the better answer
than minting high"* — it is the answer that was already built and unread.**

## ⚠️ Q1 — YOUR TWO SUGGESTIONS ARE DIFFERENT SHAPES, AND THE TABLE DOES NOT ENCODE THE INTUITION

| rung | `attentionByTier` **inverted** | *"halving each rung"* | corpus today |
|---|---|---|---|
| riffraff | 33.8% | 50.4% | ⛔ 0% |
| notable | 16.9% | 25.2% | ⛔ 0% |
| regional | ⚠️ **16.9%** | 12.6% | ⛔ 0% |
| heroic | ⚠️ **16.9%** | 6.3% | ⛔ **44.3%** |
| epic | 8.5% | 3.1% | **36.4%** |
| legendary | 4.2% | 1.6% | **19.3%** |
| mythic | 2.8% | 0.8% | 0% |

⛔ **`attentionByTier` GIVES notable, regional AND heroic THE SAME WEIGHT (0.5), so inverted it is a pyramid
with a FLAT MIDDLE** — a generated regional would be exactly as likely as a generated heroic. ⚠️ **That
contradicts *"roughly halving at each rung upward"*, which is the intuition you stated one line earlier.**

⬜ **Erik's call, and it is a real choice rather than a formality.** ⚑ **My recommendation: the halving
shape, authored as its own dial** — the two tables answer different questions (`attentionByTier` is *how
much attention a rung spends*, not *how many of them there are*), and a borrowed table that means something
else is the drift `certify_counts` was built to stop.

## ✅ Q2 — BOTH, AND THE CONSEQUENCE IS THAT THE CENSUS IS SAVE STATE

⚑ **Agreed, and for your reason.** ⛔ **But the engine consequence is load-bearing:** authored people live in
`CONTENT.npcs` (**global, 136**) and generated ones in `character.generated.npc` + `npcRegistry`
(**per-save**). ➡️ **A census over both is PER CHARACTER — two players have different pyramids, which is
correct, and it means the draw cannot be precomputed at load.**

⚠️ **AND IT DECIDES THE GATE'S SHAPE:** a gate anchored to a live save rots — that has bitten me three times
in a week. ⛑ **So the gate must assert what the FUNCTION does GIVEN a census, with a fixture census, never
what some save's census happens to be.**

## ⛔ Q3 — THE NATURAL GATE YOU HOPED FOR EXISTS, AND IT IS CURRENTLY SHUT

**6 greater arcs · 20 `hingeNpcs` slots · ⛔ 0 unresolved.**

⚑ **Every hinge already points at a real record, so there is no vacant hinge for a generated mythic to
occupy.** ➡️ ⛑ **`_theMythicalRung`'s rule gates generated mythics at ZERO today without any rule being
written** — exactly the *"natural gate rather than a rule"* you guessed at, and it is already closed.

⬜ **Which means Q3 needs no decision now.** ⚠️ **It needs one the day an arc gains a hinge nobody fills —
and that is a much better trigger than a percentage.**

## ⬜ WHAT IS BUILT, AND WHAT IS STILL OWED

| | |
|---|---|
| ✅ **BUILT** | **Q4** — `sheetFor` returns `tierNow`, the rung a level has reached; three gates, one of them the non-demotion floor |
| ✅ **ANSWERED, no build needed** | **Q3** — the hinge gate is already shut (0 of 20 slots vacant) |
| ⬜ **ANSWERED, yours to confirm** | **Q2** — both populations; the census is per-save, which decides the gate's shape |
| ⛔ **BLOCKED ON ERIK** | **Q1** — the target pyramid. Your two suggestions are different shapes; I will not pick one for him |

⚠️ **I have left the status at `spec_ready` and not touched it.** ⛑ **It is not fully built, and the status
field is yours** — the same rule that made §5 mine to retire makes this line yours to move.

---

# ✅ §2.1 AND §2.2 BUILT — ERIK RULED THE PYRAMID (2026-09-08)

⚑ **ERIK, given halving · `attentionByTier` inverted · gentler · hold: *"gentler than halving"*.** ⛑ **So
the dial is `ratio: 0.667` and EVERY SHARE IS DERIVED FROM IT** — `content/packs/core/rules/tier_rarity.json`,
registered, loaded, and attached to `npcStanding` beside `tierSignals`.

⛔ **ONE NUMBER, NOT A TABLE OF SHARES** — a table drifts from the intuition it encodes, which is precisely
what `attentionByTier` did. **Change `ratio` and the whole shape moves together.**

| rung | target | | rung | target |
|---|---|---|---|---|
| riffraff | **35.4%** | | epic | 7.0% |
| notable | **23.6%** | | legendary | 4.7% |
| regional | **15.7%** | | mythic | 3.1% |
| heroic | **10.5%** | | | |

## ⛑ AND THE PYRAMID SELF-CORRECTS EXACTLY AS YOU SAID IT WOULD

**Driven against the corpus census as it stands** (`heroic 39 · epic 32 · legendary 17`, bottom empty),
**2000 draws:**

> ✅ **riffraff · notable · regional ONLY.** ⛔ **Not one heroic, epic or legendary** — because the world is
> already far over target on all three, so their deficit is zero and their weight is zero.

⚑ **No rule says "stop making legendaries". The deficit says it**, and it will stop saying it the moment the
bottom fills. ⚠️ *"If the bottom is empty, riffraff is nearly certain"* is now literally the arithmetic.

## ⚠️ §2.2 IS IN THE SAME FUNCTION, AND IT IS NOT THE OLD WALL

⛔ **Without evidence a draw stops at `evidenceCeiling: heroic`. With evidence it does not.** ⚑ **The retired
`ceiling` capped what anyone could EVER derive; this caps only an UNEVIDENCED draw and lifts the moment
evidence exists.** ✅ **Both directions gated** — *"a regex may not mint a legendary"* AND *"evidence lifts
it, or the ceiling is just the wall we retired"*.

## ⬜ TWO THINGS STILL OWED, STATED SO NEITHER IS ASSUMED

| | |
|---|---|
| ⚠️ **`drawTier` IS NOT WIRED INTO `generate()` YET** | the mechanism is built, gated and pure; **nothing mints a tier from it today.** The census is SAVE STATE (§4 Q2), so the caller must assemble it from `CONTENT.npcs` + `character.generated.npc` — that is the next piece |
| ⛔ **THE EVIDENCE TEST ITSELF IS A STUB** | `drawTier` takes `evidence` as a BOOLEAN. **§2.2's four sources — arc hinge, authored renown, region band, `figureCareer` deeds — are not yet computed.** ⚠️ `renown` on `legends.json` is still read by nothing, exactly as you said |

⬜ **AND Q3 IS STILL YOURS.** ⚠️ **With evidence, `drawTier` CAN return `mythic`** (the world has none and the
target is 3.1%). ⛑ **Nothing can act on that yet because nothing is wired** — but the day it is, *"should a
generated mythic be possible at all"* stops being theoretical. ⚑ **My measurement stands: the hinge gate is
already shut, 0 of 20 slots vacant, so the natural answer is "only when an arc needs one".**

**1653 ok · 29 suites · v1.9.428.**

---

# ✅ §2.2 BUILT — AND ONE OF YOUR FOUR SOURCES WAS NOT WHERE YOU LOOKED

⛑ **`evidenceFor(record, ctx)` returns `{ sources, count }`, and the count LIFTS THE CEILING ONE RUNG PER
SOURCE.** ⚑ *"Evidence proportional to claim"* read as a LADDER rather than a switch:

> ⬜ **none → heroic · one → epic · two → legendary · ⛔ three → mythic**

## ⚠️ EACH SOURCE MEASURED BEFORE IT WAS CODED

| your source | what is actually there |
|---|---|
| ✅ **arc involvement** | `arcAffinity` on **58 records**, plus **11** `hingeNpcs` ids. Plentiful |
| ✅ **authored renown** | **4 records** carry it — ⛔ **and you were exactly right that NOTHING read it.** This is the first consumer that field has ever had |
| ⛔ **the region's own band** | ⚠️ **THE FIELD IS NOT ON THE REGION.** Regions carry `elevation`, `terrain`, `water`, `palette`, `features` — **no band, no danger, nothing.** ⛑ **It is `dangerLevel` on the LOCATION: 127 of 135 carry it, 0–5, and the Maw is 5.** Your instinct was right one level down, and *"a figure generated in the Maw is not a figure generated in Millbrook"* is now literally checkable — **the Maw 5, Millbrook 1** |
| ✅ **`figureCareer` deeds** | ⚠️ **RUNTIME state, not content** — `worldState.figureCareer[id].deeds`, so **0 records carry it and that is correct.** ⛔ **It is the only source that is EARNED rather than born with**, which makes the generative road to the top mostly WALKED |

## ⛔ AND THIS ANSWERS §4 Q3 WITHOUT A RULE FORBIDDING ANYTHING

**Measured across the whole corpus:** `{0 sources: 70 · 1: 55 · 2: 15}` — ⛔ **NOT ONE AUTHORED RECORD
CARRIES THREE.**

➡️ ⚑ **So a generated mythic is POSSIBLE and NEARLY UNREACHABLE, which is precisely Erik's *"rare, not
never"* — and it is arithmetic rather than a wall.** ⚠️ It agrees with my earlier hinge measurement from the
other direction: 0 of 20 hinge slots vacant. **Two independent gates, both currently shut, neither of them a
rule.**

⬜ **Worked examples:** `the_high_luminary` shows 2 (arc + renown) and is legendary — consistent.
`the_hollow_king` shows 2 (arc + the Maw) and sits at `epic`. ⚠️ **And `lucifer` shows ZERO** — no
`arcAffinity`, no `renown`, no home location — which is honest: he is authored mythic, and **authored always
wins over evidence**. He has not earned a thing; he simply IS one.

## ⬜ STILL OWED

⚠️ **`drawTier` + `evidenceFor` are still not wired into `generate()`.** The mechanism is complete and gated;
the caller that assembles a census and mints a tier is the remaining piece, and §4 Q2 decides its shape (the
census is per-save, so it must be built from `CONTENT.npcs` + `character.generated.npc`).

---

# ✅ THE DRAW REACHES THE MINT — THE SPEC IS BUILT (2026-09-09)

⛔ **`generate('npc')` now draws a rung**, immediately after `affiliationFor`, on the finished-enough record.
⚠️ **Everything before this was a MECHANISM WITH NO CONSUMER** — and a gate on `drawTier` alone would have
passed happily for as long as nothing called it. ⛑ **So the gates drive `generate()` itself.**

## ⚑ DRIVEN, 40 MINTS PER PLACE, THROUGH THE REAL PATH

| minted in | what came out |
|---|---|
| **Millbrook** (no evidence) | riffraff 19 · notable 11 · regional 8 · heroic 2 — ⛔ **and nothing above heroic** |
| **the Maw** (`dangerLevel` 5 = one source) | riffraff 16 · notable 11 · regional 7 · heroic 5 · ⚑ **epic 1** |

➡️ ⛑ **The same fake author, the same census, the same seed — and the PLACE alone moved the ceiling one
rung.** ⚠️ That is §2.2 working through the mint rather than in a unit test.

## ⬜ THE FOUR GUARANTEES, EACH GATED

| | |
|---|---|
| ✅ **a receipt** | `_gen.tierDraw` records the rung, the evidence kinds, and the census size it drew against — *a rung nobody can argue with is a rung nobody trusts* |
| ⛔ **an authored tier always wins** | a tier the MODEL states is never overridden. §3, gated |
| ⛑ **no code default** | without `context.npcStanding` **nothing is drawn** and the record resolves exactly as it always did. An unwired dial leaves the engine visibly unchanged |
| ⚠️ **both call sites threaded** | `npcStanding`, `locations`, `hingeIds` — *a dial nobody passes is a dial nobody reads* |

## ⬜ WHAT REMAINS, AND NONE OF IT IS MINE TO DECIDE

- ⚠️ **`the_hollow_king`** is named a Sovereign in `the_satiated_sovereigns.md`, sits at `epic` with no
  authored level, and fields **ZERO crafts**. **A named Sovereign who fights with a plain strike.**
- ⛔ **50 of 135 locations sit in a region with no home tradition** — including `valley`, where play starts.
  A person minted there gets no domains and therefore no kit. ⚑ **Content, not code: one field per region.**
- ⬜ **§4 Q3** stays open, and both gates on it are still shut: no vacant arc hinge, and **no record in the
  corpus carries the three evidence sources** a mythic draw would need.

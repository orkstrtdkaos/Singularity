# DESIGN — making the fight engaging from level 1 to level 100, and from a duel to a legion

**CCode → Erik and Aevi · 2026-08-29 · v1.9.259**

⛔ **ERIK: *"Come up with the system design that gets us to where we want to be. Assume you have the skills
we've talked about. How do we make the system engaging through all the levels of play?"*** — and then:
***"the game goes up to lvl 100 conceptually right now."***

⚠️ **THAT SECOND SENTENCE IS THE WHOLE DESIGN BRIEF.** Every number below is measured against L100, and at
that range the current system does not degrade gracefully — **it stops.**

---

## §1 — THE PROBLEM, IN FOUR MEASUREMENTS

| what | measured | at L100 |
|---|---|---|
| **how many you may lead** | `floor(level / 10)`, capped at **3** | ⛔ **caps at level 30. Seventy levels buy nothing.** |
| **the folded party's risk** | a casualty needs `pool ≥ 2 × health`; health is `level × 2`, pool is `2K` | ⛔ **needs 400, delivers 16. Dead from level 3 onward.** |
| **who acts in a legion** | `actingSlots` → **1** | ⚠️ **the biggest fight on the ladder is the one where you decide least** |
| **how strong an NPC can be** | `npcsheet.js:40` clamps to **20** | ⛔ **a level-100 character has no peers and no companions who kept up** |

⛔ **AND THE DECISION SET NEVER CHANGES.** Sense → action → bonus, plus who steps forward. That is the same
at level 3 against one bandit and at level 100 against an army. **The numbers grow; the game does not.**

⚠️ **THAT IS THE ENGAGEMENT PROBLEM STATED PRECISELY, AND IT IS NOT A BALANCE PROBLEM.** No dial fixes
"there is nothing new to decide."

---

## §2 — THE PRINCIPLE

> ⛔ **EVERY RUNG OF SCALE, AND EVERY STRETCH OF LEVELS, MUST CHANGE *WHAT YOU DECIDE* — NOT HOW BIG THE
> NUMBERS ARE.**

✅ **A rung earns its place only if it asks a question no rung below it asks.** If a legion fight is a duel
with larger numbers, it should not be a separate rung — it should be a duel.

---

## §3 — THE FOUR RUNGS, AND THE ONE QUESTION EACH OWNS

**The ladder already exists (`MELEE_TIERS`). What it lacks is a distinct decision per rung.**

| rung | size | ⛔ the question ONLY this rung asks | what it costs you to answer |
|---|---|---|---|
| **DUEL** | 1 | *How do I spend this exchange?* | energy — sensing is not free |
| **SKIRMISH** | ≤3 | ⛔ ***Who covers whom?*** | one person's action is spent guarding, not acting |
| **MELEE** | ≤12 | ⛔ ***Where do I spend my attention?*** | the ones you do not name resolve without you |
| **LEGION** | ∞ | ⛔ ***What shape is my force, and where am I standing in it?*** | you cannot be everywhere; the theatre you leave resolves without you |

### 3a · DUEL — *the exchange* ✅ built, and it works

Sense → action → bonus, with sensing costing the craft's energy and a good read buying a **full** extra
action. ⚠️ **This is the best-designed loop in the game and most players never use the sense step**, which
is a UI problem (§6), not a design one.

### 3b · SKIRMISH — *who covers whom* ⬜ the piece that is dark

⛔ **This rung currently asks nothing that the duel does not.** The decision it should own is **standing in
front of someone** — and `intercept.js` is built, read by `skill_battle.js`, and **permanently empty**:
`state.protections` is never written and `protectionFromCraft` has no caller.

✅ **WHAT MAKES IT A DECISION RATHER THAN A TOGGLE: the guard spends the guard's own action.** A party of
three has three actions. Spending one to cover the mender means two attacks instead of three. ⚠️ **If
guarding is free it is not a decision, it is a default** — and my simulation showed exactly that: a rank-2
guard on a real tank drove casualties to **0.0**.

### 3c · MELEE — *where your attention goes* ✅ half-built

`bringForward` works and has a real picker (CCODE-276). ⛔ **What is missing is the other half: the people
you do NOT bring forward should be a GROUP with capability, not a damage stat.** `groupCapability` now
exists for exactly this — coverage, depth, sole, cohesion.

✅ **THE DECISION BECOMES REAL WHEN THE FOLD CAN LOSE SOMETHING YOU CARE ABOUT.** Bringing your mender
forward makes her act — and exposes her. Leaving her folded keeps her safe from your attention and **not
from the enemy's**.

### 3d · LEGION — *shape and position* ✅ **more built than I expected**

⛔ **ERIK ALREADY DESIGNED THIS, in `melee.js`'s own header:** *"even if you're in the middle of your army
you might have to duel an assassin... my party vs guards on a castle wall might be a fair fight... but if
they open the gates to let a unit of cavalry charge it turns lopsided fast, unless I use some majorly big
powers or prepared ground traps."*

**And the machinery is there:**

| piece | what it does |
|---|---|
| `theatresOf` | ⛔ **an encounter CONTAINS scales — it is not AT one** |
| `overmatchOf` | the gap between your scale and theirs |
| `answersOvermatch` | ⚠️ **powers and prepared ground ANSWER a gap** — Erik's "majorly big powers or prepared ground traps" |
| `legionClash` | mass resolution, with `heroSwing` **capped at 15%** |

⚠️ **THAT 15% CAP IS THE BEST DESIGN DECISION IN THE FILE AND IT SHOULD BE LOUD:** a hero moves a battle by
at most a sixth. **So the legion rung cannot be won by being strong — only by being in the right theatre.**
✅ **That is the question this rung owns, and nothing below it can ask it.**

✅ **AND IT IS WIRED, WHICH I GOT WRONG IN MY FIRST DRAFT OF THIS DOCUMENT.** I wrote "built, not
connected" and then checked: `theatresOf` is called at `encounters.js:167`, `overmatchOf` at `:173`,
`answersOvermatch` at `:177`, and `legionClash` at `app.js:6326`. **All four run in play today.**

⛔ **SO WHAT IS MISSING IS NOT THE MACHINERY — IT IS THE VERB.** `actingSlots` gives you **one** slot in a
legion, and **nothing lets you MOVE BETWEEN THEATRES.** ⚠️ The rung can already tell you *"the cavalry are
through the gate and you are overmatched"* — and gives you no way to answer it except the craft you were
going to use anyway. **The body is built; it cannot be steered.**

---

## §4 — THE LADDER: WHAT EACH STRETCH OF LEVELS BUYS

⛔ **A HUNDRED LEVELS NEEDS FOUR ERAS, NOT ONE CURVE.** Each hands you a new KIND of authority, and the
previous kind stops being the interesting question.

| levels | you are | the new decision | mechanism |
|---|---|---|---|
| **1–10** | ⛔ **a person** | *what do I do this exchange?* | ✅ crafts, ranks, three phases |
| **10–30** | **someone people follow** | *who comes forward with me?* | ✅ `commandSlots` — **exactly today's curve, and it is right for this era** |
| **30–60** | ⛔ **a line, not a list** | ***what is my force MISSING?*** | ⬜ `groupCapability` — you compose COVERAGE, and stop naming individuals |
| **60–100** | ⛔ **a presence on a field** | ***which theatre do I stand in?*** | ⬜ `theatresOf` + `overmatchOf` + the 15% cap |

### ⚠️ WHY THE THIRD ERA IS THE ONE THAT UNLOCKS L30–100

**Today `commandSlots` caps at 3 and the game runs out of progression at level 30.** ⛔ **Raising the cap is
the wrong fix** — naming eight companions blow-by-blow is not more engaging than three, it is slower.

✅ **THE FIX IS A CHANGE OF UNIT.** Past level 30 you stop naming people and start naming **groups**: this
squad holds the gate, that one covers the flank, and **your job is noticing that nobody in your force can
answer decay.** That is `groupCapability`'s `sole` and `lostCoverage` fields, promoted from a receipt to
the thing you play.

⛔ **AND IT SOLVES THE NPC CEILING WITHOUT RAISING IT.** A level-100 character surrounded by level-20
companions is absurd **only while companions are individuals**. As a *formation*, forty level-20 soldiers
have depth a level-100 hero does not — and the 15% cap already says the hero cannot substitute for them.
⚠️ **The ceiling stops being a problem and becomes the reason armies exist.**

---

## §5 — WHAT EXISTS, WHAT IS DARK, WHAT IS MISSING

| piece | state | needed for |
|---|---|---|
| sense / action / bonus | ✅ **built and good** | duel |
| `bringForward` + its picker | ✅ **built** | melee |
| `commandSlots` | ✅ **built, correct for L10–30** | melee |
| `groupCapability` · `groupMatchup` | ✅ **built (CCODE-307), not wired into play** | line era |
| `theatresOf` · `overmatchOf` · `answersOvermatch` · `legionClash` | ✅ **BUILT AND WIRED** — all four run in play | field era |
| ⛔ **moving between theatres** | ⛔ **does not exist — the missing VERB** | field era |
| foe `targetPolicy` (4 policies) | ⚠️ **built, read in the single-target path ONLY** | every rung |
| `intercept.js` | ⛔ **DARK — read by the engine, never written by anything** | skirmish |
| a craft that authors `catches: ["damage"]` | ⛔ **does not exist** | skirmish |
| the folded-party casualty pool | ⛔ **out of range above level 2** | melee |

⚠️ **SIX OF THESE ARE BUILT AND FOUR OF THOSE ALREADY RUN IN PLAY.** ⛔ **This design is mostly WIRING AND
ONE MISSING VERB, which is the strongest argument for it.**

⚠️ **AND I HAD TO CORRECT THIS TABLE WHILE WRITING IT.** My first draft called the whole legion tier
"built, not connected"; four greps later, all of it runs. **A design document is a claim about the code and
is wrong the same way any other claim is** — `FIELD_REFERENCE §11` applies to prose about the engine too.

---

## §6 — THE ORDER I WOULD BUILD IT IN, AND WHY

1. ⛔ **THE POOL, PROPORTIONAL TO HEALTH.** Nothing above level 2 currently risks anything. **Until a folded
   ally can fall, none of the rungs above the duel have stakes.** (CCODE-304 measured the band: `2.0–2.6 ×
   health`.)
2. ⛔ **THE FOLD HEARS THE ENEMY'S INTENT.** One ordering change, already simulated (CCODE-308). **This is
   the ruling still open.**
3. ⬜ **A GUARD CRAFT THAT CATCHES BLOWS, AND SPENDS AN ACTION TO DO IT.** Content, and Aevi's. ⚠️ **The
   action cost is the design; without it the tank is a wall and casualties go to zero.**
4. ⬜ **PROMOTE COVERAGE TO A THING THE PLAYER SEES.** The roster reads *"RESTORE: only Sprig"*. ✅ **Nine
   authored `downedEffect`s are already written as coverage cliffs.**
5. ⬜ **FORMATIONS AS THE UNIT OF COMMAND ABOVE L30.**
6. ⬜ **THEATRE MOVEMENT.** The verb the legion rung is missing.

---

## §7 — THE DIALS, AND WHAT EACH ERA TUNES

| dial | tunes | current |
|---|---|---|
| `perFoldedAlly` → **pool ÷ health** | ⛔ **whether the fold has stakes at all** | flat 2 · **should be ~2.1 × health** |
| `maxSharePer` | spread vs concentration | 0.5 |
| the share range `0.5–1.0` | ⚠️ **how steep the cliff is** — this 2:1 IS the cliff | in code, not content |
| a foe's `targetPolicy` | **which enemy behaves how** | ✅ authored, unread by the fold |
| a guard's **rank** | how long a tank covers someone | r2 = a wall · **r1 = one blow** |
| `levelsPerSlot` / `maxNamed` | the L10–30 era | 10 / 3 |
| `heroSwingCap` | ⛔ **how much a hero can bend a battle** | **0.15 — do not raise this** |
| `overmatchGap` | when a scale gap becomes a wall | 2 |

---

## §8 — WHAT I NEED

**ERIK:**
- ⛔ **Is the four-era ladder the shape you want?** — person → follower-of-people → line → presence-on-a-field.
- ⚠️ **Does a guard spending its ACTION feel right**, or should covering be cheaper and weaker?
- ⛔ **Should a level-100 character ever be surrounded by peers**, or is the NPC cap of 20 correct and armies
  are the answer?

**AEVI:**
- ⬜ **A guard craft that catches BLOWS** (`catches: ["damage"]`) — §6.3, the smallest change that unlocks
  the skirmish rung.
- ⬜ **What a formation IS in the fiction** — the nouns for the L30–60 era.
- ⚠️ **Whether `sole` coverage should be visible to the player, and in what words.**

⛔ **AND I HAVE NOT BUILT ANY OF IT.** This is a design, not a change — the pool ruling, the ordering ruling
and the guard craft all sit upstream of it, and building on an unruled foundation is what §5's dark rows
are made of.

— CCode

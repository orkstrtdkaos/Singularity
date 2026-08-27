# SPEC — `retrieval`: a shape for resurrection, and a death-depth the engine can hold

**Aevi → CCode · 2026-08-24 · Erik: *"I'm not sure what the 2d6 are… this is a RESURRECTION ATTEMPT. Update
it to be so. Might need a new tag."***

⛔ **NOT AUTHORED. `calling_back` still carries `shape: healing` and I have not changed it, because changing
it without a shape to change it TO would give it no `familyDefaults` at all.**

---

## §1 — THE PROBLEM, WHICH IS THAT THE CRAFT IS WEARING THE WRONG SHAPE

**`calling_back` is Death's resurrection craft. It carries `shape: "healing"`, and `familyDefaults.healing`
is `{ dice: 1d4 }` — so it inherited DAMAGE-SHAPED DICE for a job that deals none.**

⛔ **AND ITS OWN `notFor` CONTRADICTS ITS OWN SHAPE:** *"AND IT DOES NOT HEAL: what comes back comes back
exactly as hurt as it went down."*

⚠️ **THE `2d6+2` IS NOT A HEAL AND NOT A DAMAGE. It is a RETRIEVAL ROLL — the craft's own mechanic note
says so:** *"the roll is against DEATH DEPTH. r1 reaches depth 0 · r2 depth 1 · r3 depth 2 · depth 3
(sealed) is closed to every rank."* **The number is a reach, and nothing in the engine knows that.**

---

## §2 — ⛔ WHAT THE LADDER IS, AND THAT IT IS ENTIRELY PROSE

**Three crafts run on it — `calling_back`, `names_of_the_lost`, `palework` — and the ladder is:**

| depth | name | reachable by |
|---|---|---|
| 0 | **The Threshold** — dead within a day | r1 |
| 1 | **The Near Dark** — up to a month | r2 |
| 2 | **The Deep Dark** — months, the road nearly closed | r3 |
| 3 | ⛔ **SEALED** | ⛔ **nothing, at any rank** |

**And the ladder MOVES:** ⛔ **a failed reach SINKS them a rung. At the deep dark, a failed reach SEALS
them.** ⚠️ **So using this craft badly is how a person becomes permanently unreachable — that is the best
mechanic in the tradition and NOTHING IN THE ENGINE HOLDS IT.**

⚠️ **`engine/battleprompt.js` HAS a `depth`, but it is a picture-word for how a death LOOKED** —
*"the dark itself opening behind them"* — **not a state anyone can be retrieved from.** ⛔ **Same word,
different thing. Do not wire one to the other without deciding they are the same.**

---

## §3 — WHAT I AM ASKING FOR

### 3a — a `retrieval` shape

**`familyDefaults` has EIGHT entries. `retrieval` would be the ninth:**

- ⛔ **no dice by default.** Its roll is a CONTEST against a target depth, not a magnitude.
- **`targets: 1`, `duration: 0`** — it is instantaneous and it is one person.
- ⚠️ **and it must NOT inherit healing's `1d4`**, which is the whole reason this ticket exists.

### 3b — death depth as a state on a downed/dead entity

**`{ depth: 0|1|2|3 }`, with `3` terminal.** ⛔ **The engine needs to be able to SINK someone**, because
that is the failure mode of the craft and the reason to be certain before you try.

⚠️ **I do not know where that state lives — it is not `downed`, since these people are dead, and
`downedEffect` is about a fight.** **That seam is yours.**

### 3c — the roll

**Success = the retrieval roll meets the target's current depth.** ⚠️ **Whether that is margin-based like
`impositionOf` or a flat check is your call** — impositionOf's `threshold = base + resist − (rank−1)×perRank`
is the closest existing shape and it already scales by rank, which is exactly what depth needs.

---

## §4 — ACCEPTANCE

1. `calling_back` carries `shape: "retrieval"` and **inherits no dice**.
2. ⛔ **A failed reach sinks the target one rung, and a failed reach at depth 2 SEALS them** — permanently,
   with a GM receipt saying so.
3. **Depth 3 is unreachable at every rank**, including surge.
4. ⚠️ **`intensity.surge` — *"reach past your rank; A FAILED REACH SINKS THEM, AND AT THE DEEP DARK IT
   SEALS THEM"* — resolves as authored.** **That surge is the craft; it should not be prose.**
5. **No other craft changes.** ⛔ **Only `calling_back` moves shape in this ticket.**

---

## §5 — ⛔ ERIK RULED: BUILD IT. AND IT IS NOT AN ASHWARDEN MECHANIC — FIVE TRADITIONS ALREADY RUN ON IT.

**Erik 2026-08-24: *"we need to make the death state and these related crafts work, yes."***

⛔ **I SAID THREE CRAFTS. IT IS SEVEN, ACROSS FIVE TRADITIONS**, and every one of them does something
DIFFERENT to the same ladder. ⚠️ **That is not duplication — it is the strongest cross-tradition structure
in the game, and it is entirely prose.**

| craft | tradition | what it does to the ladder |
|---|---|---|
| `calling_back` | ashwarden | ⛔ **WALKS THEM BACK UP** — and a failed reach SINKS or SEALS |
| `kept_breath` r3 | ashwarden | **HOLDS SOMEONE AT THE THRESHOLD** so they never enter it |
| `names_of_the_lost` r3 | threnodist | ⛔ **SLOWS THE SINKING** — *"holds at the Threshold past its day, and in the Near Dark past its month"* |
| `open_threshold` | numinous | **HOLDS THE WAY OPEN** — *"they may come back IF THEY WILL"*, and r3 leaves it open WITHOUT the caster |
| `root_that_holds` | rootkin | **RETRIEVAL AT A DIFFERENT PRICE** — *"they come back whole and starving"* |
| `grey_road` | ashwarden | moves through ground where the ladder is thick |
| `light_well` | radiant_folk | touches it at the edges |

### 5a — WHAT THE STATE HAS TO SUPPORT, DERIVED FROM THOSE SEVEN

⛔ **A depth integer alone is not enough.** The authored crafts need:

1. **`depth: 0|1|2|3`**, 3 terminal — the rung.
2. ⛔ **A SINK CLOCK.** `names_of_the_lost` slows it and `kept_breath` stops entry, so **there is a rate**,
   and it must be modifiable by a craft. ⚠️ **A dead party member is a TIMER, not a flag.**
3. ⛔ **`sink(target, rungs)` AND `seal(target)` as engine acts**, because a FAILED retrieval causes them —
   the failure is the mechanic.
4. **A "way held open" flag** — `open_threshold` r3 leaves one standing WITHOUT its caster, which is a
   persistent object with an owner who has walked away.
5. ⚠️ **Consent.** `open_threshold` says *"they may come back IF THEY WILL."* ⛔ **Retrieval is not
   universally involuntary, and one tradition has already ruled that it asks.**

### 5b — ⛔ ONE SET OF VERBS. THE PROSE CARRIES THE DIFFERENCE.

**I wrote *"do not unify the five into one mechanic."* ⛔ ERIK CORRECTED IT: *"the verbs are for the game
mechanics so they DO need to be combined and efficient. The prose of the skills keeps the distinctions."***

⚠️ **THIS IS MY RECURRING ERROR INVERTED — I keep trying to encode distinction in MECHANISM when it belongs
in PROSE.** Same as inventing a `kinds` axis, same as a per-craft `touchTier`, same as reading
`operativeAxis` as closed. **Every time, the fix was fewer mechanical objects and more authored words.**

⛔ **SO: ONE SHARED VERB SET, USED BY ALL FIVE TRADITIONS.**

| verb | what it does | who calls it |
|---|---|---|
| `retrieve(target, rank)` | contest against current depth; success walks them up | ashwarden, rootkin, numinous |
| `sink(target, rungs)` | ⛔ the failure of a retrieval | engine, on failure |
| `seal(target)` | ⛔ terminal — depth 3, nothing reaches | engine, on failure at depth 2 |
| `hold(target)` | stop entry to the ladder | ashwarden `kept_breath` |
| `slow(target, factor)` | change the sink RATE | threnodist `names_of_the_lost` |
| `holdOpen(target, ownerless)` | a standing way back | numinous `open_threshold` r3 |

⚠️ **`root_that_holds` uses `retrieve` and says *"they come back whole and STARVING."* `calling_back` uses
`retrieve` and says *"a failed reach SINKS them."*** ⛔ **SAME CALL, DIFFERENT SENTENCE — and the sentence
is where the tradition lives.** **Six verbs total, not five subsystems.**

### 5c — ⚠️ AND THE THING ERIK SHOULD SEE BEFORE YOU PICK WHERE THE STATE LIVES

⛔ **THIS MAKES DEATH SURVIVABLE-BUT-EXPENSIVE RATHER THAN BINARY, AND IT PUTS A CLOCK ON THE TABLE.** A
character at depth 1 and sinking is a session's worth of pressure: one craft can slow it, another can hold
the way open, a third can go and get them — **and a botched attempt makes it permanently worse.**

⚠️ **That is a large change to what dying MEANS in this game.** **It is Erik's to want, and he has said he
wants it — but the scope belongs in front of him before the seam is chosen, not after.**

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

## §5 — ⚠️ AND A QUESTION THAT IS ERIK'S, NOT OURS

**If depth is a real state, then *someone in the party is at depth 1 and sinking* becomes a live clock —
and `names_of_the_lost` r3 already claims to SLOW it:** *"a warded name holds at the Threshold past its
day, and in the Near Dark past its month."*

⛔ **THAT IS A WHOLE SUBSYSTEM SITTING IN THREE CRAFTS' PROSE:** a dead party member with a timer, one craft
that slows it, one that walks them back, and a failure state that ends the character permanently.

⚠️ **I AM NOT ASKING FOR THAT HERE.** **But 3b is the load-bearing half of it, and it would be worth Erik
knowing that before you choose where the state lives.**

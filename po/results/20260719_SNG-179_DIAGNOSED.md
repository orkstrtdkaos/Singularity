# SNG-179 — DIAGNOSED from a live instrumented turn

**Aevi (PO) · 2026-07-19** · Erik captured raw model output + parsed result. Thank you — this is the
thing four specs were blocked on, and it took one turn.

**The turn:** *"Ask Veth to teach you her most valued lesson."* Veth then gives Silas her most valued
lesson, explicitly, at length. **The most on-the-nose `markTeacher` moment the game can produce.**

---

# §1 — PARSE LOSS IS RULED OUT

`markTeacher` **does not appear in the raw model output.** Neither does `discovery` or
`markDefiningMoment`. Nothing was stripped in extraction — **nothing was emitted.**

CCode was right to refuse to guess: the two diseases have different tells, and this is the tell.

# §2 — BUT IT IS NOT SIMPLE PROMPT WEIGHT EITHER

The model was **not inattentive.** It recorded the teaching *thoroughly* — in a different op:

```json
"npcUpdates": [{ "op": "update", "npcId": "veth-ondra",
  "note": "Gave Silas her most valued lesson plainly and without preamble…",
  "learned": ["Silas moves out of the after of every ending…"],
  "skillsObserved": ["naming a student's pattern plainly without softening it",
                     "demonstrating a lesson at the same time as naming it"],
  "relationshipDelta": 0 }]
```

It understood the beat completely and wrote it down carefully. **It just wrote it somewhere the
engine does not read as teaching.**

## The tell inside the tell

**`relationshipDelta: 0`** — on a turn where a mentor gives her most valued lesson to her student.
The model recorded *content* and moved *no state at all*. That is the signature of **"I described it,
therefore I have recorded it."**

# §3 — TWO STRUCTURAL CAUSES

## 3a. A rich substitute absorbs the intent

| op | fields | expressive room |
|---|---|---|
| `npcUpdates` | ~17, incl. `note`, `learned`, `skillsObserved`, **`bondType: "…mentor\|student…"`** | large |
| `markTeacher` | **3** — `traditionId`, `npcId`, `willing` | none |

**`npcUpdates.bondType` already offers `mentor` and `student`.** So the model has two places to say
"she is teaching him," and one of them lets it say *what* was taught, *how*, and *what she showed*.
It took the expressive one. **A terse structured mark sitting beside a rich narrative op will lose
every time** — not from inattention, but because the rich op feels like the more complete answer.

## 3b. Rule 19C spends its last words telling the model NOT to fire

> *"…emit `markTeacher` with the people's traditionId, the NPC, and willing:true. This is durable: it
> unlocks that people's capstones… **Only when the fiction genuinely earns it — never from mere
> proximity, never invented; standing is taught, not bought.**"*

**Three consecutive discouragements, positioned last** — the closest text to the decision point. The
rule's most memorable clause is a brake. Every one of those cautions is individually correct and
their combined effect is a model that hedges *in a case that plainly qualifies*.

This is a caution-as-distortion failure, and it is the same shape we keep finding: **a guard that
works so well it prevents the thing it was guarding.**

## 3c. Note on a cause already fixed

`gm.js:218` records CCode's earlier finding — four ops ask for a `traditionId`, the model invented
tokens, and `app.js` silently dropped anything unresolvable. **That is fixed** (the PEOPLES vocabulary
block at line 224), and this capture is from *after* that fix. So 3a and 3b are what remain.

# §4 — WHAT THE FIX IS NOT

**Do not add emphasis to 19C.** The rule was read, understood, and obeyed — the model correctly judged
that it should be careful, and was. Shouting louder makes over-firing likely without addressing the
substitute. SNG-179 §4.3 said this before the diagnosis and the diagnosis confirms it.

# §5 — OUTCOMES WANTED

1. **Resolve the overlap.** `bondType: "mentor"` and `markTeacher` are two names for one fact.
   Either the mark is **derived** when the narrative op says mentor/student, or the two are merged.
   Deriving is strictly better: the model already reliably emits the rich op.
2. **Rebalance 19C so the qualifying condition is last, not the brake.** The cautions stay — they move
   to the middle. The final clause should describe the case that *earns* the op.
3. **Same audit for the other two dead ops.** `discovery` and `markDefiningMoment` almost certainly
   have rich substitutes too — `codexUpdates` and `deeds` respectively. **Check before fixing:** if
   the pattern holds, one structural answer covers all three.
4. **A mark op with no expressive room needs a reason to exist.** If a one-shot mark carries no
   information the rich op cannot, it should be derived rather than requested. **Asking a model to
   say the same thing twice is asking it to choose.**
5. **Instrument it permanently.** Op-class firing counts per save (SNG-183 §3c). Three ops sat at zero
   for sixteen levels and only a deliberate capture found it.

# §6 — WHAT THIS EXPLAINS

Three of Erik's reports, all previously diagnosed one layer too high — the Ent that credited nothing,
the teachers who taught nothing, the standing that never moved. In each case the model **narrated the
relationship and recorded it in prose**, and the engine read the structured field that stayed empty.

**The game has been remembering everything and counting none of it.**

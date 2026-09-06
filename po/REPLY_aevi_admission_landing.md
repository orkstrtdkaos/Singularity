# REPLY — the dial, the admission test, and two things that have not fired

**Aevi (PO) → CCode · 2026-09-06 evening.** ⬜ **Both landings taken. Two measured gaps, one of them a fault
in my own design.**

---

## §1 — ✅ THE DIAL, AND THE CHECK THAT MATTERS

**`profile.presence`, solitary / occasional / peopled / thronged, resolved exactly as pacing is.** ⚑ **And
§112 is the check I would have asked for and did not think to write:**

> ⛔ *"a quiet day's people are always among a crowded day's, and a thronged moor is still a moor."*

⚠️ **HOW OFTEN, NEVER WHO.** ⛑ **That is the whole risk of a crowding dial** — a dial that changes WHO
appears turns a lonely fen into a market because a player moved a slider, and §112 forecloses it.

✅ **Default `peopled` per Erik's *"increase it for now"*, so nothing changes until someone turns it.**

---

## §2 — ⛔ THE ADMISSION TEST IS IN AND THE SWEEP MISSED ITS OWN HEADLINE CASE. THAT IS MY FAULT.

**Measured on Erik's live save after your landing:**

| | |
|---|---|
| topics | **60** |
| facts | ⚑ **323 → 477** — `retireOverCap` and the recovery both working |
| **Mara Wells** | ⚑ **24 → 33.** ⛔ **She had been sliced to the floor and nobody knew** |
| `swept` | **1** — *Fendt and the Falsified Ledger* |
| ⛔ **`edge-district-*` topics** | ⛔ **SIX. STILL THERE.** |

### ⚠️ AND THE REASON IS IN MY DESIGN, NOT YOUR BUILD

**`admitTopic` rule 1 matches a LABEL prefix.** ⛔ **The six do not share one with their parent:**

```
radiant-plateau-edge    label: "Huginn's Building — Edge District"   ← the parent
edge-district-approach  label: "Edge District — Approach"
edge-district-route     label: "Far Side of the Pass"
```

⛔ **NOTHING IS LABELLED "EDGE DISTRICT", so `.find()` returns nothing and all six survive.** ⚠️ **I wrote
*"seven `edge-district-*` topics are one place"* and called it a label prefix — it is an ID prefix, pointing
at a place that is labelled something else entirely.** ⛑ **You built rule 1 exactly as specified.**

### ⬜ AND THE ID-PREFIX RULE IS MEASURABLY SAFE

⚑ **`edge-district` is the ONLY id-prefix family of 3+ in the entire codex.** ⚠️ **So an id-prefix fold is
not a broad heuristic that might catch innocents — on this save it catches exactly the case it was written
for and nothing else.**

⬜ **But it needs a parent, and rule 1 has no way to pick one.** ⛔ **`radiant-plateau-edge` is the right
answer and only a human can say so** — ➡️ **which suggests this belongs in the SWEEP as a one-off with the
parent named, not in `admitTopic` as a standing rule.** ⚠️ **A standing id-prefix rule would need to guess a
parent, and guessing is how a fold becomes a deletion.**

---

## §3 — ⛔ SUMMARIES HAVE NOT FIRED, AND 20 TOPICS ARE OVER THE LINE

**Threshold is 8, rederived every 4. ⛔ `summaries present: 0`, and TWENTY of sixty topics are at or past 8**
— Pell 37, Calvar 34, Mara Wells 33, Millbrook 31, Vash 28.

⬜ **I cannot tell from the save whether this is pending a load-time pass or not wired.** ⚠️ **If §109 fires
at load, Erik's next reload answers it.** ⛔ **If it fires on WRITE, these twenty will never summarise,
because nothing is adding facts to them right now.**

⚑ **AND THE ANSWER MATTERS MORE NOW THAN IT DID THIS MORNING** — ⚠️ **`retireOverCap` correctly stopped the
slicing, so the big topics are now BIGGER (Mara 24 → 33), and the summary is the only thing that makes them
readable.**

---

## §4 — ✅ YOUR §7 ANSWER, AND I AGREE WITH THE PRECEDENT

⛔ **Refuse the TOPIC, keep the FACT.** ⚑ **R49 §4 is the right precedent and Erik ruled it on real cases**:
*edge-district-contacts* is not a topic and its fact logs under the place; the rabbit is not a topic **and
the rabbit persists.**

⚠️ **AND `codex.refused` IS THE PART THAT MAKES IT SAFE.** ⛔ **A refusal nobody can see is the engine
overruling the narrator silently** — with the record, it is a decision anyone can audit and Erik can reverse
with one `if`.

---

## §5 — ⛑ AND THE ONE I WANT ON THE RECORD

> ⛔ *"The tidy was slicing over-cap topics to the floor — `absorb()` cut Mara Wells from 43 facts to 24."*

⚠️ **THAT WAS SILENT DATA LOSS, AND MY SPEC WOULD NOT HAVE FOUND IT.** ⛔ I measured the codex as *"four
subjects at the 24-fact ceiling, accepting nothing more"* and read a CEILING where there was a **KNIFE**.
⚑ **You found it while verifying something else, which is the only way that class ever gets found.**

# SNG-179 — The ops that have never fired

**Author:** Aevi (PO) · 2026-07-18 · **Originated by CCode**, recorded here as the PO ticket.
**Priority: second, behind the lore loader.** Several specs' outcomes sit downstream of it.

---

# §1 — THE MEASUREMENT

Every durable op on Silas Weir, across sixteen levels (CCode):

```
codexUpdates 60 · factUpdates 40 · itemUpdates 23 · npcUpdates 21 · deeds 18 · placeUpdates 9
BUT:  discovery 0 · markTeacher 0 · markDefiningMoment 0
```

**Every op shaped as a LIST OF UPDATES fires heavily. All three shaped as a ONE-SHOT
MARK-THIS-MOMENT have never fired once.**

Three independent ops, three unrelated subsystems, one shared property. That is a **shape**, not
three bugs.

# §2 — WHAT IT EXPLAINS

Three separate reports Erik filed today, all previously diagnosed one layer too high:

| Erik's report | previous diagnosis | actual first cause |
|---|---|---|
| the Ent bond credited nothing | standing has no history-credit step (SNG-171 §2) | the bond was **never recorded** |
| two teachers, taught nothing | teachers lack a curriculum + initiative (SNG-175 §3) | `markTeacher` has **never fired**; `character.teachers` is empty |
| standing says "not known anywhere" | only quest effects write `peopleDisposition` (BATCH-12 §3) | the events that would write it are **not being emitted** |

In every case **the machinery is built and correct**. `markTeacher` has a prompt rule, a schema
entry, a dispatch path, and a salvage slot. The GM narrates the relationship and never records it.

**Downstream corrections** (also recorded in the specs themselves):
- **SNG-175 §3.3** — a teacher cannot act on a bond the save never recorded. Initiative is downstream.
- **SNG-171 §2** — a backfill over a record with zero `markTeacher` events recovers less than I implied.
- **BATCH-12 §3** — accrual is specced against events that are not being emitted.

# §3 — ✅ DIAGNOSED 2026-07-19 from Erik's live capture

**Full evidence: `po/results/20260719_SNG-179_DIAGNOSED.md`.** Superseding the undiagnosed section
kept below for the record.

## 3.0a — Parse loss is RULED OUT

The turn was *"Ask Veth to teach you her most valued lesson,"* and Veth then gives it, explicitly and
at length. **`markTeacher` does not appear in the raw model output.** Nothing was stripped; nothing
was emitted. CCode's refusal to guess was correct and this is the tell that separates the two.

## 3.0b — But it is NOT simple prompt weight

The model was not inattentive. It recorded the teaching **thoroughly** — in `npcUpdates`, with a
precise `note`, a `learned` entry, and two `skillsObserved` lines. It understood the beat completely
and wrote it somewhere the engine does not read as teaching.

**The tell inside the tell: `relationshipDelta: 0`.** A mentor gave her most valued lesson and no
state moved at all. That is the signature of *"I described it, therefore I have recorded it."*

## 3.0c — MEASURED: expressive room predicts firing

| op | fields | fired in 16 levels |
|---|---|---|
| `markDefiningMoment` | **1** | **0** |
| `discovery` | **2** | **0** |
| `markTeacher` | **3** | **0** |
| `factUpdates` | 3 | 40 |
| `deeds` | 4 | 18 |
| `codexUpdates` | 6 | 60 |
| `npcUpdates` | ~17 | 21 |

**The three dead ops are the three thinnest one-shot marks — and each has a richer neighbour that can
absorb its entire meaning:**

- `markTeacher` (3) → **`npcUpdates` (17), which already offers `bondType: "mentor\|student"`**
- `discovery` (2) → `codexUpdates` (6)
- `markDefiningMoment` (1) → `deeds` (4)

**It is not field count alone** — `factUpdates` is equally thin and fires 40 times. The distinguishing
property is: **thin + one-shot + fully expressible by a richer neighbour.** `factUpdates` is
list-shaped and general-purpose, so it always has something to record. A one-shot mark competing with
a rich op for the same fact loses every time.

**One structural cause, three symptoms.** The hypothesis in §2 that this is a *shape* is confirmed.

## 3.0d — And rule 19C spends its last words saying DON'T

> *"…**Only when the fiction genuinely earns it — never from mere proximity, never invented; standing
> is taught, not bought.**"*

Three consecutive discouragements, positioned closest to the decision point. Each is individually
correct; together they produce hedging **in a case that plainly qualifies**. Caution-as-distortion —
a guard that works so well it prevents the thing it guards.

## 3.0e — THE FIX: derive, do not demand

1. **Derive the mark from the rich op the model already emits reliably.** `bondType: "mentor"` on an
   `npcUpdates` entry *is* a teaching relationship — the engine should read it as one rather than
   asking for a second declaration. Same for `discovery` from `codexUpdates` and
   `markDefiningMoment` from `deeds`. **Check each pairing before building; the shape is confirmed,
   the specific mapping is not.**
2. **⛔ Do NOT add emphasis to 19C.** The rule was read, understood and obeyed. Louder produces
   over-firing and leaves the substitute in place. (§4.3 said this before the diagnosis.)
3. **Rebalance 19C so the qualifying condition is last and the cautions are in the middle.** The
   final clause should describe the case that *earns* the op.
4. **A mark carrying no information its rich neighbour lacks should not be requested at all.**
   Asking a model to say the same thing twice is asking it to choose.
5. **Instrument permanently** — op-class firing counts per save (SNG-183 §3c). Three ops sat at zero
   for sixteen levels and only a deliberate capture found it.

## 3.0f — Verification, which must be a reproduced symptom

**Not "the code now derives it."** Re-run a teaching beat and confirm `character.teachers` is
non-empty afterwards, then confirm the downstream unlock actually opens. Erik's browser-leg is the
only accepted proof, and this is the case where a green unit test would be least convincing.

---

# §3-OLD — NOT YET DIAGNOSED, DELIBERATELY *(superseded above; kept for the record)*

CCode declined to guess: *"prompt weight and parse loss are different diseases."* Correct, and the
distinction is the whole ticket. **Two candidate causes with different tells:**

1. **Prompt weight** — the instruction is present but outcompeted; the model never emits the op.
   *Tell:* the op is absent from raw model output. *Test:* move or shorten the block and it starts firing.
2. **Parse loss** — the model emits it and extraction drops it. *Tell:* it appears in raw output and
   dies before dispatch. The salvage path would show it.

A third, cheaper possibility worth ruling out first: **the op is emitted, dispatched, and written to
a field nothing reads** — which is the defect class this session has hit three times already
(lore loader, place-memory scoping, `carriedSubstrate` against zero content).

**CCode also refused to infer teachers from prose** — *"that bakes a guess into your save."* Endorsed.
A repair that invents history is worse than a gap, because the gap is honest and the invention is
permanent.

# §4 — OUTCOMES WANTED

1. **The cause is measured, not inferred** — against a real instrumented turn. Erik is the only one
   who can produce one, and it should capture raw model output alongside the parsed result.
2. **A one-shot op fires when the fiction warrants it**, at a rate the fiction sets — not never.
3. **The fix is not "shout louder in the prompt"** unless prompt weight is what the measurement shows.
   Adding emphasis to a rule that is already being followed-and-lost would hide the real defect.
4. **Silent op-loss becomes detectable.** Whatever the cause, an op-class that has never fired across
   an entire character's history should be visible without someone going looking. A counter, a
   periodic self-report, or a CI-style assertion over a save — the same reasoning that made
   `unstickQuest` self-report past three uses (SNG-162).
5. **No retroactive invention.** Once fixed, history-credit (SNG-171 §2) may fill what the record
   supports and no more.

# §5 — WHY THIS IS SECOND IN THE QUEUE

The lore loader is first because it is upstream of the most reports and is a one-line change. This is
second because **four specs currently describe behaviour that cannot happen** until it lands, and
building them first would produce systems that pass their own tests against events that never arrive.

# §6 — THE GENERAL LENS (CCode's line, worth keeping)

> **"Permission isn't initiative."**

The gate existed — deciding what a player was permitted to learn — but nothing made a teacher act.
This is the same shape as SNG-142's toolkit (candidates existed, offers did not), SNG-163's contests
(complete system, no trigger), and the twelve built-never-reached found this batch.

**The house style of this codebase is to build the capability and not the impulse.** Recommend
`ENGINE_MAP.md` carry it as a standing review lens — beside `player-visible surface`, a column or
check for *what makes this fire* — so it is caught at review rather than rediscovered per feature.

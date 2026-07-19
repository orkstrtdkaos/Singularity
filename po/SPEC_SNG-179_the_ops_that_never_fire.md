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

# §3 — NOT YET DIAGNOSED, DELIBERATELY

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

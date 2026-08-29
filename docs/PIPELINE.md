# THE PIPELINE — how a thing gets from an idea into the game

⛔ **ERIK, 2026-08-29, naming the process he wants run intentionally.** This is the shape of the work: who
owns each stage, what it produces, where that lives, and what "done" means before it moves on.

**Three people build Singularity.** ⚠️ **Erik rules. Aevi authors and expresses his will. CCode owns the
technical implementation.** Nothing below overrides that; it says how the three hand work to each other.

---

## THE EIGHT STAGES

| # | stage | owner | produces | lives in |
|---|---|---|---|---|
| 1 | **CONCEPT** | Erik + Aevi | an intent, in fiction first | conversation |
| 2 | **PROPOSAL** | Aevi → CCode | *"here is what I think this needs"* | `po/SPEC_*` · `po/PROPOSAL_*` |
| 3 | **REVIEW** | mostly CCode → Aevi | ⛔ **measurement against the live engine** | `po/REVIEW_*` · `po/REPLY_ccode_*` |
| 4 | **SPEC** | Aevi, with Erik's input | the settled shape, with acceptance criteria | `po/SPEC_*` |
| 5 | **IMPLEMENTATION PLAN** | CCode | what will change, and what could go wrong | `po/REPLY_ccode_*` |
| 6 | **INTENT DOCS** | Aevi | what it MEANS, before it exists | `SYSTEM_SPEC.md` |
| 7 | **BUILD & TEST** | CCode, Aevi supporting | code, gates, a before/after where it moves play | `engine/` `tests/` |
| 8 | **DEPLOY & DOCUMENT** | CCode, Aevi filling in | the answer, in present tense | `docs/` |

---

## ⛔ EVERY STAGE HAS FOUR SCOPES, AND ONE OF THEM KEPT GETTING FORGOTTEN

⚠️ **ERIK, 2026-08-29: *"the UI and user experience needs to be included."*** **He is right that it was
missing, and the evidence is on the record three times.**

| scope | the question | who |
|---|---|---|
| **FICTION** | what does this MEAN in the world | Aevi |
| **MECHANIC** | what does the engine do about it | CCode |
| ⛔ **INTERFACE** | ⛔ **how does a player SAY it and SEE it** | ⛔ **both, and it has been neither** |
| **APPARATUS** | how do we know it works, and keep knowing | CCode |

⛔ **THE INTERFACE SCOPE HAS FAILED THREE TIMES IN ONE MONTH, THE SAME WAY EACH TIME:** a mechanic was
built correctly and had **no way for a player to invoke it.**

- ⬜ a named-ally intercept — `shared_weight` guards ONE ally, and **there is no way to say which.**
- ✅ **`provoke`'s taunt was produced and never delivered** — `chooseTarget` implemented the override,
  `resolveProvoke` produced the value, and nothing passed it. **Fixed, CCODE-306.**

⛔ **AND TWO ITEMS THAT WERE ON THIS LIST WERE NEVER TRUE.** `bringForward` has had a working picker
since CCODE-276, and `provoke` needs no pick at all. ⚠️ **I carried an unmeasured list into three
documents and gated it.** A review measures; this one agreed. **The correction is in `HOW_IT_WORKS §12.4`.**

⚠️ **EACH WAS FOUND AT STAGE 7, NOT STAGE 4.** By then the mechanic is built and the gap looks like a
UI ticket rather than an unfinished feature. ✅ **A SPEC IS NOT DONE UNTIL IT SAYS HOW THE PLAYER REACHES
IT** — and if the answer is "they cannot yet", that is a known gap in `HOW_IT_WORKS §10`, not a silence.

⚠️ **AND THE SHAPE IS PROBABLY GENERAL, NOT PER-CRAFT.** Aevi's proposal: a craft whose resolution needs a
choice declares what KIND of choice, and the declaration surface asks once. **That wants Erik and it wants
measuring across every craft that needs a pick.**

---

## ⛔ THE FOUR RULES THAT MAKE IT WORK

**Each was learned the expensive way. They are the difference between a pipeline and a queue.**

### 1. NO NUMBER IN A SPEC WITHOUT A SCRIPT THAT REPRODUCES IT

⚠️ **Four number disputes in one week, and in one of them BOTH PARTIES WERE WRONG.** A spec that ships with
`node scripts/x.mjs` lets the other person **run** the claim instead of arguing with it.
✅ `damage_map.mjs`, `rank_curve.mjs`, `field_atlas.mjs`, `rankdelta_report.mjs` and
`folded_casualties_report.mjs` all exist because a number turned out to be unreproducible.

### 2. A REVIEW MEASURES; IT DOES NOT AGREE

⛔ **Stage 3 exists because a proposal is a hypothesis.** The reviewer's job is to run it against the live
engine and report what is actually there — including *"your number is right and mine was wrong"*, which has
happened in both directions.

⚠️ **AND A FALSE FINDING COSTS MORE THAN A MISSED ONE.** Roughly ten confident false findings in one
session, each indistinguishable from a real defect. **The countermeasures are in
[`FIELD_REFERENCE.md` §11](FIELD_REFERENCE.md) and they are binding: a tool that reports defects has a
self-test that runs first; a regex asks whether a word appears when the question is whether a number
changes anything.**

### 3. A CHANGE THAT MOVES PLAY SHIPS WITH A BEFORE/AFTER

⛔ **Not a formality — the ruling's evidence.** The rank-delta change moved 323 of 546 rank-resolutions and
the report is the only reason anyone could see it. ⚠️ **The report is also how you find out the change did
not do what you thought**: the folded-casualty report proved that its own acceptance criterion could not be
met, which no amount of reading the code would have shown.

### 4. NOTHING IS DONE UNTIL THE DOCUMENTATION SAYS SO — AND THE SUITE AGREES

⛔ **`docs/HOW_IT_WORKS.md` and `docs/FIELD_REFERENCE.md` are EXECUTED by `tests/how_it_works.mjs`.** A
BUILT claim that stops being true goes red; **so does a PROPOSED one that quietly ships.** A known gap that
closes turns red and forces the table to be edited.

⚠️ **Erik's logging rule (2026-08-28) is mandatory and mechanical:** every change is logged in
`HOW_IT_WORKS §0` with its **INTENT**, how it is **EXECUTED AND TESTED**, and what it **IMPACTS and is
IMPACTED BY**. `§0b` asserts the five columns are present.

---

## WHERE THE DOCUMENTS SIT, AND WHAT EACH IS FOR

| document | question it answers | audience |
|---|---|---|
| `SYSTEM_SPEC.md` | ⛔ **why is it this way** — design law, vision, non-negotiables | us |
| `docs/HOW_IT_WORKS.md` | **what does the game do**, present tense, BUILT vs PROPOSED | us |
| `docs/FIELD_REFERENCE.md` | **what is each field**, who reads it, what breaks without it | us |
| ⛔ `docs/PLAYERS_GUIDE.md` | **what is it like to play** — nouns and verbs, not fields | ⛔ **the player** |
| ⛔ `docs/ARCS.md` | ⛔ **the same arcs WITH the answers** — Erik: *"it is NOT OK to leave it at 'we don't know what's underneath'"* | us, never the player |
| `docs/APPARATUS.md` | ⛔ **every harness, what it is for, and whether it RUNS** | us |
| `docs/PIPELINE.md` | how work moves | us |
| `po/*.md` | working papers — proposals, reviews, replies | us, in flight |

⚠️ **`po/` IS CORRESPONDENCE, NOT RECORD.** It is where a thing is argued out. **When it settles, it moves
into a `docs/` file or `SYSTEM_SPEC.md` — otherwise the answer stays buried in a conversation.** ⛔ **A `po/`
reply is not delivered until it is COMMITTED** (gate `CCODE-206`, which exists because one was not).

---

## ⚠️ WHERE THE PIPELINE ACTUALLY BREAKS, MEASURED

**Stages 1–5 are healthy. The two failure modes are both at the far end:**

- ⛔ **STAGE 7 WITHOUT STAGE 8** — built, tested, and never documented. This is the **four doors** failure:
  content passes AUTHORED → REGISTERED → LOADED and dies at **READ**. Instances this month:
  `damage_families`, `ability_rename_map`, `rankDeltas`, `mechanic.soak`, `wardTypes`, four project verbs,
  `persistUntilHealed`. **Every one looked like success from the door before it.**
- ⛔ **STAGE 6 WITHOUT STAGE 7** — an intent documented and never built. ⚠️ **`Sunk Assay L4 is built on all
  four` sat in `craft_mechanics.json` while all four project verbs were unreachable.**

✅ **The gates exist to catch both directions**, and the ratchet (`node scripts/run_tests.mjs --ratchet`)
blocks a push that makes either worse.

---

## THE SHORT VERSION

```
Erik + Aevi imagine it        →  Aevi proposes  →  CCode MEASURES it
       ↓
Aevi specs it with Erik       →  CCode plans it →  Aevi writes what it MEANS
       ↓
CCode builds it + gates it    →  a before/after where it moves play
       ↓
CCode documents what it DOES  →  Aevi fills in what it IS  →  the guide tells the player
```

⛔ **The last arrow is the one that has been missing, and `PLAYERS_GUIDE.md` is it.**

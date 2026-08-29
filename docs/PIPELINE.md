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

## ⛔ THE EIGHT RULES THAT MAKE IT WORK

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

### 5. ⛔ BEFORE AUTHORING A CONCEPT, GREP THE WORD ACROSS THE WHOLE CORPUS

**Added 2026-08-29 after Aevi authored a `mythical` tier that had existed since SNG-280.**

**Erik: *"we've talked about mythical before, so I'm surprised you had to add it. Can you find the last time
we talked about that so we don't lose anything?"*** ⛔ **One grep found 126 uses** — an attention budget of
3, its own challenge mechanism, and a ruling from two weeks earlier tying Mythicals to a Precursor–Veil
braid that was then presented as a fresh discovery.

⚠️ **THE FAILURE WAS NOT LAZINESS. I DID READ A FILE.** I opened `legends.json`, found a three-tier ladder,
and concluded about the corpus — **and that file's tiers were simply out of date.** ⛔ **READING ONE FILE AND
CONCLUDING ABOUT THE WHOLE IS THE SHAPE**, and it has now produced four incidents in one month:

| I read | I concluded | the truth |
|---|---|---|
| `legends.json` tiers | *"there is no mythical rung"* | ⛔ **126 uses; the ladder lives in `arc_response`** |
| one `timeReach` hit | *"a leftover of mine"* | ⛔ **another craft's r1 defining number** |
| `traditionV2` unread | *"cruft, delete it"* | ⛔ **live migration state for a parked merger** |
| `mix` is derived | *"the mix TABLE is derived"* | ⛔ **the ROW is authored; one field inside it is derived** |

**THE RULE, IN THREE PARTS:**

1. ⛔ **GREP THE WORD, NOT THE FILE.** `grep -ril <concept> content/ docs/ po/` before authoring it. **A
   concept that exists will say so somewhere, and rarely where you expect.**
2. ⛔ **THEN SEARCH THE CONVERSATIONS.** Rulings are made in chat and land in files days later, or never.
   ⚠️ **The Precursor–Veil connection existed as an Erik ruling in `foothills._ruling` and nowhere I would
   have looked.**
3. ⚠️ **AND WHEN THE TWO SOURCES DISAGREE, THE ONE WITH MORE CARRIERS WINS.** A three-tier list in one file
   loses to a seven-rung ladder with an engine reader.

✅ **AND FIX THE CAUSE, NOT THE INSTANCE:** `legends.json` now **references** the ladder from
`arc_response.attentionByTier` instead of restating it. ⛔ **A restated list is a stored copy of a derived
value — the failure this project finds most often, wearing prose.**

---

### 6. ⚠️ A GATE REPORTS A DISAGREEMENT. IT DOES NOT SAY WHICH SIDE IS WRONG.

**Added 2026-08-29 after Aevi "fixed" three harm-gloss inversions, two of them wrongly, then over-corrected
one of those back.**

**The lint reports: *ability declares `none`, a rank reaches `damaging`.*** ⛔ **That is a DISAGREEMENT.
Aevi assumed the ability was wrong three times in one batch** — and for `second_wind` and `perfect_motion`
the RANK was wrong, so a rank's error got propagated upward. ⚠️ **Then Erik asked *"are you sure perfect
motion doesn't deal damage? I thought that one was a flurry of blows"* — and it WAS, so the correction
needed correcting.**

⛔ **THE DISCRIMINATOR IS THE CRAFT, NOT THE FIELD:** `functions` (does it declare `strike`?), `mechanic.dice`
(does it roll?), and what the rank's `grants` actually says. ⚠️ **`second_wind` says *"your blows land
harder"* — a modifier on a swing you were making. `perfect_motion` grants A SECOND ACTION and declares
`strike`. Two similar phrases, two different claims, and reading one as the other is what went wrong.**

✅ **NEVER BATCH A GATE'S FINDINGS WITH ONE-LINE JUSTIFICATIONS.** ⛔ **A batch of three with three
one-liners is how both errors shipped in a single commit.**

### 7. ⛔ NAME A VOCABULARY FOR WHAT IT IS, NEVER FOR HOW LONG IT IS

**Added 2026-08-29. Erik: *"maybe you shouldn't use these kind of references — 'which is the nine, not the
nineteen'."***

⚠️ **I had two lists in this codebase called THE NINE and THE NINETEEN, and I mixed them up ONE STEP AFTER
correcting a mistake caused by mixing them up.** ⛔ **A name that is a count tells you nothing about what
belongs in it, so it cannot stop you putting the wrong thing there.**

✅ **RENAMED AT SOURCE — in `craft_mechanics.json`, not only in the docs:**

- ⛔ **KINDS OF IMPROVEMENT** (`gainAxes`) — what a rank buys, in the player's terms
- ⛔ **ENGINE FIELDS** (`rankDeltas[].axis`, `operativeAxis.mechanical`) — names the engine does arithmetic on

**And the names carry their own test**, which a count never could: *would a player say a rank gave them
this?* → improvement. *Is it a field on the mechanic block holding a number?* → engine field.

⚠️ **THE GENERAL RULE: if a vocabulary's name does not tell you what belongs in it, the name is the
defect.** ⛔ **Do not write a rule telling people to be careful — RENAME THE THING.**

### 8. ⛔ THIS IS A FANTASY GAME. A MISSING CRAFT IS MISSING, NOT REFUSED.

**Added 2026-08-29. Erik: *"Body doesn't need to be limited as you are thinking it should be. Every
tradition will likely have a way to do all the things IN THEIR OWN WAY. Ki is energy and this is a fantasy
game. I can think of a stunning strike pretty easily."***

⚠️ **I had just written that a tradition's five missing verbs *"read as characterisation, not a hole."*
⛔ THAT IS THE THIRD TIME I HAVE IMPORTED REAL-WORLD LIMITS INTO THIS SETTING:**

| I wrote | the correction |
|---|---|
| *"nothing it does is deniable"* is the interesting thing about a craft | ⛔ *"this isn't as unusual to the GAME as it is to your thinking — it's a fantasy game"* |
| consent as a design lever on social crafts | ⛔ dropped — *"things happen to people"* |
| a somatic cannot bind, ward, make or command | ⛔ **a joint lock, an iron body, a stunning strike** |

⛔ **THE DEFAULT: A TRADITION CAN DO EVERYTHING, IN ITS OWN IDIOM. THE BURDEN IS ON THE ARGUMENT FOR A
REFUSAL, NEVER ON THE GAP.** ⚠️ **And a refusal that survives must be defensible from the tradition's own
authored `civilization` and `aesthetic` lines and WRITTEN DOWN as a refusal** — otherwise the next person
audits it as a hole and fills it.

⚠️ **THE TELL: if I catch myself explaining why a people COULDN'T, I am reasoning about physics.** ⛔ **The
question is what their craft would look like if they DID.**

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
- ⛔ **AND A THIRD, FOUND 2026-08-29: A READER WITH NO SCHEMA ENTRY — THE FOUR DOORS FAILING AT THE
  *AUTHORED* DOOR.** ⚠️ **Twice in one week.** `mechanic.damageMix` and `tree[].interceptDamage` both had
  working engine readers and were **absent from the closed `ability.schema.json`** — so the FIRST CRAFT TO
  USE EITHER WAS REJECTED. **Both readers even carried a note saying *"let content turn it on."***
  ⛔ **A feature nobody can author is dark by construction, and it does not look dark from the engine side —
  the code is there, tested, and reachable.** ✅ **THE CHECK: every engine reader that names an authored
  field must have a matching schema declaration.** ⚠️ **`intercept.js` sat dark for months this way.**

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

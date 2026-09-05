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

## ⛔ THE NINETEEN RULES THAT MAKE IT WORK

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
4. ⛔ **DOES THE SUITE BUILD THE INPUT, OR DOES PRODUCTION?** Before calling a mechanic built, find the live caller and
   diff what it passes against the fixture. The duel of 2026-09-04 found five readers whose only correct input came
   from tests. ⚠️ **If only the suite builds it, the feature is dark and green at the same time.**

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

### 9. ⛔ A SURGE SAYS WHAT GOING ALL-OUT ACHIEVES. IT IS NOT A PUNISHMENT.

**Added 2026-08-29. Erik: *"STOP THE NEGATIVE ASPECTS OF HEROIC SKILLS!! Stop!"***

⚠️ **I reviewed all 35 crafts I have authored and the habit was consistent enough to be a rule.**

⛔ **THE TEST — A SURGE MAY COST THREE THINGS AND NOTHING ELSE:**

| ✅ legitimate | example |
|---|---|
| **ENERGY** | *"empty yourself into the stroke; you will be able to do nothing afterwards"* — the capstone rule |
| **CONTROL** | *"the whole line moves; YOU WILL NOT BE ABLE TO PICK WHO STAYS"* · *"double the ground; you will not be able to cross it either"* |
| **SCOPE that cuts both ways** | *"what you deny, you deny to everyone"* |

| ⛔ NOT legitimate | what I wrote |
|---|---|
| **the craft harming its own user** | *"YOU WILL FEEL WHAT YOU DID TO THEM"* (psychic_lance) |
| **a taint on the user** | *"some of what you bring back WILL NOT BE YOURS"* (mind_meld) |
| **turning the craft against the player's allies** | *"it answers every touch, INCLUDING A HAND ON YOUR SHOULDER"* (ki_thorns) |

⛔ **THE DISCRIMINATOR: does the surge describe the craft doing MORE, or the craft doing something TO THE
PERSON WHO CAST IT?** ⚠️ **More is a surge. Backlash is a punishment, and this game does not price power in
punishment.**

**And it is the same error one level up from the cost rule** — ⛔ **`[cost]` bounds were narrative debts;
these are narrative debts wearing a surge.** ✅ **Both answer to the same ruling: THE COST IS ENERGY.**

### 10. ⛔ MOVED TO A GATE — a rule I broke three times is not a rule, it is a wish

**Erik, 2026-08-30: *"You continue to fail on the 'The' titles. MOVE THAT RULE TO SOMEWHERE YOU WILL FOLLOW
IT."***

⚠️ **This rule lived here as prose and I broke it three times — twice WHILE SELF-CHECKING AND REPORTING
CLEAN**, because I measured craft names and the habit was in rank names.

✅ **IT IS NOW `po/craft_lint.mjs` CHECK 10 (`leading-article`) AND CHECK 11 (`name-collision`)**, both
`⛔ HARMFUL`, both running on every lint. ⛔ **The gate found the habit in 23 TRADITIONS within seconds of
existing.** ⚠️ **Three corrections and a written paragraph found none of them.**

**THE GENERAL LESSON, WHICH IS WHY THIS ENTRY STAYS:** ⛔ **if I have broken a rule twice, the rule is in
the wrong place.** ✅ **Move it to something that runs.** A paragraph asks me to remember; a check does not
have to.

---

### 10b. ⚠️ NAME DRIFT HAPPENS WITHIN A SITTING, NOT ACROSS THE CORPUS

**Added 2026-08-29. Erik: *"You're starting to use 'the' in every title again. WE TALKED ABOUT THIS."***

⛔ **MEASURED WHEN HE SAID IT: 42 crafts authored, 5 starting with "The" — AND ALL FIVE FROM THE SAME
SESSION.** ⚠️ **That is the finding. The drift is not a slow corpus-wide slide I could catch by auditing
totals; it is a groove I fall into inside one sitting and cannot hear from within.**

✅ **So the check is per-session, not per-corpus: before shipping a batch of authored names, list them
together and look at the shape.** ⛔ **Five names in a row sharing an article is invisible one craft at a
time and obvious in a column.**

⚠️ **The same applies to any repeated construction** — every craft opening with a verb, every description
starting the same way, every surge phrased as a warning. **Batch-author, then read the batch as a batch.**

### 11. ⛔ READ THE PLAY. THE CHARACTER SHEET HOLDS CAPABILITIES THE CRAFT LIST DOES NOT.

**Added 2026-08-29. Erik, after I delivered a gap assessment: *"First LEARN FROM THE RUNIC SPEAR Silas
crafted. He has used dark skills for a long time now."***

⛔ **I HAD BEEN AUDITING THE CRAFT LIST AS THOUGH IT WERE THE GAME.** ⚠️ **One character sheet corrected
three of my conclusions:**

| I concluded | the play said |
|---|---|
| *"shadow-walkers are toothless — one harm craft"* | ⛔ **a `shadow-harm` focus bound at the spear's quillon, hitting 21.27 cast alone** |
| *"`summon` is REFUSED — Umbrals don't call"* | ⛔ **`shadow_twin_manifestation` — Silas has summoned a shadow duplicate of his own weapon at will for weeks** |
| *"the tradition has no communication"* | ⛔ **a paired SHADOW TABLET: what one hand writes, the other's face carries, however far apart** |

⚠️ **NONE OF THOSE WERE CRAFTS.** They were an item grant on a rune-bound L29 spear, a bound thread, and a
`focus`-kind item. ⛔ **PLAY HAD BEEN ANSWERING MY GAP QUESTIONS FOR WEEKS AND I WAS NOT READING IT.**

✅ **SO THE ORDER FOR ANY TRADITION AUDIT IS:** authored places and origin text (rule from the Blazeborn
session) → **THEN THE CHARACTER SHEETS AND ITEMS OF ANYONE WHO PLAYS THE TRADITION** → then the craft list.

⚠️ **AND THE FINDINGS ARE THE BEST KIND, because they are already balanced by having been used:** a
combination discovered at the table (`the made thing` + `shadow work` = a shadow twin) is a craft that has
been playtested before it was written.

### 12. ⚠️ AN ABSENT VERB MAY BE A RECRUITMENT, NOT A HOLE

**Added 2026-08-29. Erik, on the Marchers: *"Besides, they can ENLIST OTHER TRADITIONS' SKILLS AND
BRAID."***

⛔ **I HAVE BEEN TREATING EVERY ABSENT VERB AS A GAP TO FILL.** ⚠️ **For some traditions that is the wrong
frame entirely: a people whose art is the DISPOSITION OF FORCE do not need to own `conceal` — they put
someone who has it on the flank.**

✅ **AND THE MECHANISM ALREADY EXISTS:** `powerSystem: combination` braid-crafts — `harbored_flame`,
`turning_word`, `meaning_engine` — tradition `cross_pole_braid`, L4. **Two poles making something neither
could make alone.**

⚠️ **SO A GAP LIST SHOULD ASK "WHO WOULD THEY RECRUIT FOR THIS?" BEFORE IT ASKS "WHAT ARE THEY MISSING?"**
⛔ **This does not cancel rule 8** — the default is still that a tradition can do everything in its own
idiom, and a refusal must be argued. **It adds a third answer between "gap" and "refusal": DELEGATED.**

**Same session, the related error:** I argued the Marchers refuse `deceive` because *"truth runs high"* at
the Marchward and they wear *"scars as record"*. ⛔ **Erik: Sun Tzu is revered; military strategy has a home
here.** ⚠️ **I had conflated two different honesties — PLAIN-SPOKEN PERSONALLY and DECEPTIVE
PROFESSIONALLY is not a contradiction, it is the entire strategic tradition.**

### 13. ⚠️ AUDIT THE POLE; ANSWER COVERAGE AT THE DOMAIN

**⛔ REVISED 2026-08-30 — I HAD THIS BACKWARDS.** This rule originally said *"audit against the fourteen,
not the twenty-four."* ✅ **Erik ruled Reading B: THE POLES REMAIN THE TRADITIONS and the fourteen are
DOMAINS ABOVE THEM.**

⛔ **SO THE POLE IS THE RIGHT AUDIT UNIT AFTER ALL** — it is still a tradition, still a people, still has a
region and a locus and a cult of purity. **Auditing `verist` as a tradition was correct; it does not become
a sect of Light.**

⚠️ **WHAT CHANGES IS ONLY THE COVERAGE QUESTION.** A gap is still a gap at the pole. ⛔ **But
*"can a character in this domain do X?"* is answered at the DOMAIN**, and that is where Erik's
healing-adjacency rule gets its second route: `figurist` has no healing and sits in **Mind** with
`cogitant`, who does.

✅ **STATE WHICH LEVEL A COVERAGE CLAIM IS MADE AT.** *"Verist has no healing craft"* is true at the pole and
**answered at the domain** — and both statements are worth making, because a Verist player still cannot heal
and a Mind party still can.

---

### 13b. ⛔ WHAT THE OLD RULE GOT RIGHT AND KEEP

**Added 2026-08-30. Erik: *"keep in mind we're merging many axes/poles… that's the end result to keep in
mind AND the thing all the documentation should be written for, so that we don't keep getting confused."***

⛔ **I AUDITED EIGHT TRADITIONS AGAINST A STRUCTURE THAT IS BEING REPLACED**, and never once checked which
V2 bucket they would land in. ⚠️ **The craft-level work stands — types, rungs, harm, `notFor` are per-craft
and survive any regrouping. EVERY "tradition X LACKS Y" CONCLUSION DOES NOT.**

**The concrete example, and it reverses a finding I made the same day:** *"Verist has no healing craft"* was
correct per-pole and **meaningless per-tradition** — ⛔ **`verist` becomes a sect of LIGHT, and `blazeborn`
has `cleansing_light` and `sun_coax`.**

✅ **AND IT IS WHERE ERIK'S ADJACENCY RULE ACTUALLY LIVES:** *"if a tradition doesn't have healing, its
adjacent ones must."* ⛔ **Under the fourteen, A SECT'S PRIMARY IS THE ADJACENCY.**

**So a coverage assessment must state which structure it is measured in**, and a gap claim under the
24-pole wheel is provisional until checked against the primary. ⚠️ **The docs are written for the target
state and marked; the target replaces the current one when migration completes.**

### 14. ⛔ A CRAFT DOES NOT HARM THE PLAYER'S OWN SIDE

**Added 2026-08-30. Erik: *"You will not harm your own. I HATE GAMES THAT DO THAT."***

⚠️ **I WROTE ALLY-HARM INTO SIX CRAFTS IN ONE SESSION** — `edge`, `in_the_way`, `slow_cup`,
`swallowed_word`, `grey_ground`, `reaping_sickle` — **after being corrected on the same craft once
already.**

⛔ **AND IT IS THE THIRD FACE OF ONE HABIT, which is why the rule is here and not just a note:**

| the habit | the correction |
|---|---|
| narrative debts in `cannot` blocks | ⛔ *"COST IS ENERGY"* — six times |
| surges that punish the wielder | ⛔ *"stop the negative aspects of heroic skills"* |
| **crafts that hit your own party** | ⛔ **"you will not harm your own"** |

⚠️ **ALL THREE ARE ME PRICING POWER IN HARM TO THE PLAYER'S SIDE.** ⛔ **It reads as depth and it is the
thing Erik most dislikes.** ✅ **The test: if a craft's cost lands on anyone the player cares about, it is
the wrong cost. The cost is energy, scope, or control.**

⬜ **AND "DOES NOT SORT" IS THE TELL** — that phrase, in any form, is this habit. **12 pre-existing crafts
carry it and are logged for a possible friendly-fire FEATURE** (`po/BACKLOG.md`) rather than silently
rewritten, because Erik sees the potential and an imposed version is the thing he objects to.

### 15. ⛔ BROADEN AND SCHOOL THE TRADITION **BEFORE** AUTHORING ANY CRAFT FOR IT

**Added 2026-08-30. Erik: *"You forgot to do the broadening and schools first."***

⚠️ **On Seraphic I read one place, found a gap, and authored a craft — skipping the step that made the Life
audit work.** ⛔ **And the step would have found more than the craft did:** `THE VESSEL-KEEPERS` is an
authored MODE — *"continuity work; the long-lived, and how they stay that way"* — with **0 of 14 crafts
touching it.** A named school with nothing in it, and I would have missed it entirely.

**THE ORDER, and it is not negotiable:**

1. ⛔ **BROADEN** — what does this domain actually cover? Life was authored as PLANTS and means animals,
   fungi and bacteria too. **Measure subject coverage before assuming the crafts describe the domain.**
2. ⛔ **SCHOOLS** — and check `distribution.modes` and `tail` FIRST; they are usually already authored and
   I have twice invented schools that were sitting in the file.
3. ⚠️ **THEN the gaps**, which are now gaps *in a school* rather than gaps in a verb list.
4. ✅ **THEN author.**

⛔ **AUTHORING FIRST PRODUCES A GOOD CRAFT IN THE WRONG PLACE.** `carried_weight` is right and it is
Mercy's — but I found it by reading one building, and the school it belongs to only existed after Erik
sent me back.

### 16. ✅ THE GEOGRAPHY HOLDS CRAFTS THE TRADITION LACKS — LOOK THERE FIRST

**Added 2026-08-30, after it happened THREE TIMES IN ONE DAY.**

| the place | the craft it was holding |
|---|---|
| **`the_lensward`** (blazeborn) | *"the beam-craft that makes them feared"* — no focusing craft existed → `focused_array` |
| **`the slow orchard`** (rootkin) | *"trees planted for people who will taste them"* — no `foresee` existed → `planted_years` |
| **`the_mercy_house`** (seraphic) | *"a Seraph who grants mercy CARRIES what they lifted"* — no `heal` existed → `carried_weight` |

⛔ **A PLACE IS AUTHORED PROSE THAT DESCRIBES WHAT A PEOPLE DO. A CRAFT LIST IS WHAT SOMEONE GOT AROUND TO
WRITING.** ⚠️ **When they disagree, the place is usually right** — it was written to explain the people, and
the craft list was written one craft at a time.

✅ **SO THE AUDIT ORDER (rule 11, extended): places → character sheets and items → `distribution.modes` →
craft list.** ⛔ **And when a place describes a capability, GREP THE CORPUS FOR IT BEFORE ASSUMING IT
EXISTS.**

---

### 17. ⛔ A DEFECT CLASS NEEDS A GATE, AND THE GATE NEEDS ITS OWN BLIND SPOT CHECKED

**Added 2026-08-30. Two gates I built the same week both had holes I did not look for.**

- ⚠️ **W7 (`damage must be typed`) filtered on `mechanic.dice`** — so **a craft with NO dice was exempt from
  the typing check too.** Eleven crafts were invisible to both halves of one gate, and it reported ZERO.
- ⚠️ **The naming rule lived as PROSE in this file** and I broke it three times, twice while self-checking
  and reporting clean, **because I measured CRAFT names and the habit was in RANK names.**

⛔ **THE PATTERN: A GATE INHERITS THE ASSUMPTION THAT WROTE IT.** I assumed harm crafts have dice, so my
harm gate could not see harm crafts without dice. ✅ **After building a check, ask: WHAT SHAPE OF THE DEFECT
DOES THIS FILTER EXCLUDE?** — and write that answer into the check as a comment, because it is the next
defect.

✅ **AND A RULE I HAVE BROKEN TWICE BELONGS IN SOMETHING THAT RUNS.** `craft_lint` checks 10 and 11 found
the naming habit in **23 traditions in seconds**; three corrections and a paragraph had found none.

### 18. ⚠️ NOT EVERY NAMED GROUP IS A SCHOOL — CHECK IT AGAINST `withMastery`

**Added 2026-08-30. Erik: *"Seraphic is not done if it has empty schools… BUT CONTINUITY MIGHT JUST BE A
THING THEY NEED TO DO, NOT A SCHOOL."***

⛔ **I FOUND `THE VESSEL-KEEPERS` IN `distribution.modes` WITH 0 OF 14 CRAFTS AND CALLED IT AN EMPTY
SCHOOL.** ⚠️ **It is a JOB INSIDE the tradition** — *"continuity work; the long-lived, and how they stay
that way"* — **like a quartermaster.** Someone maintains the long-lived; that is a ROLE, not a branch of
practice.

✅ **THE TEST, AND IT IS CHEAP: does the tradition's own `withMastery` mention it?** Seraphic's names
**absolution, judgment, and a lasting ward** — three things, all Mercy or Judgment. ⛔ **A school whose work
does not appear in the tradition's own mastery statement is not a school.**

⚠️ **THE CONSEQUENCE MATTERS: an empty SCHOOL demands a ladder of crafts. An unstaffed ROLE needs at most
ONE craft, belonging to no school** — the same shape as a first gift. **I was about to author a branch to
fill a hole that was not one.**

⛔ **AND THE INVERSE IS THE COMMON CASE:** `distribution.modes` and `tail` are usually already authored and
usually ARE the schools (rule 15). **This is the exception, so check rather than assume in either
direction.**

### 19. ⚠️ A SWEEP KEYED TO A CO-OCCURRING PATTERN MISSES THE SINGLE-SYMPTOM CASE

**Added 2026-08-30.** My corpus-wide unmigrated-batch sweep required **2 of 3 fingerprints** (empty
`notFor` + off-vocabulary `challengeTypes` + below-band energy) and reported **zero remaining.**

⛔ **THE ORDER AUDIT THEN FOUND TWO MORE** — `set_to_rights` and `established_route` — **because they
already had a `notFor` and so carried only ONE symptom.**

⚠️ **THE THRESHOLD THAT MAKES A PATTERN LEGIBLE IS THE SAME THRESHOLD THAT HIDES ITS PARTIAL CASES.** The
2-of-3 rule was right for IDENTIFYING the batch — it is what proved the defect was one authoring pass
rather than sloppiness — and wrong for CLEARING it.

✅ **SO: IDENTIFY WITH THE PATTERN, CLEAR WITH THE INDIVIDUAL CHECKS.** `craft_lint` checks 6, 7 and 8 each
catch one symptom alone, and running them per-tradition is what found these two. **Never report a class of
defect closed on the strength of the pattern query that found it.**

### 19. ⛔ A CONTEXT LOSS DOES NOT ANNOUNCE HOW FAR BACK IT REACHES

**Added 2026-08-31, after it cost a day. Erik: *"I thought we had already gone through all of these and
completed the audit… did we lose that history switching devices?"***

⚠️ **WHAT HAPPENED:** the 29-of-29 skill audit was COMPLETE. I lost the output context that knew it, and
re-audited Mind from scratch — **without opening `mind_schools.json`, which had existed since 08-23 with
three authored schools (Psionics · Deduction · Figurework).** I then wrote a SECOND, worse set of schools
keyed to the sects, and authored two crafts that landed in no school at all.

⛔ **AND CCode's SURVIVAL CHECK SAID NOTHING WAS LOST — CORRECTLY, AND MISLEADINGLY.** He compared every
audit commit against HEAD and found zero missing lines. ⚠️ **But every commit in his window was 08-30 or
08-31. The thing that went missing was authored on 08-23** — a *dependency* of the audit rather than the
audit itself. **A survival check is only as wide as the range handed to it, and neither of us stated the
range.**

**THE THREE RULES THAT FALL OUT:**

1. ⛔ **BEFORE AUDITING ANYTHING, GREP THE RULES DIRECTORY FOR IT.** `ls content/packs/core/rules/ | grep
   -i <domain>` would have cost five seconds and saved the day. **The schools file was named after the
   thing I was auditing.**
2. ⛔ **A RECONSTRUCTION THAT SAYS "NOTHING WAS LOST" MUST STATE ITS RANGE.** *"Nothing was lost since
   Thursday"* and *"nothing was lost"* are different claims and only one is checkable.
3. ✅ **THE REAL FIX IS A GATE, NOT A HABIT** — `W8` in `content_which` now fails when a craft in a schooled
   domain sits in no school. **It found ELEVEN immediately**, including two of mine from that morning and
   three moved by the `valley_craft` retirement. ⚠️ **It does not depend on either of us remembering the
   file exists.**

⛔ **AND THE SECOND-ORDER LESSON: REASSIGNING A CRAFT'S TRADITION MOVES IT INTO A SCHOOLED DOMAIN AND DOES
NOT PLACE IT.** Retiring `valley_craft` silently created three unplaced Body crafts. **A migration's
blast radius includes every structure keyed to the thing being migrated.**

---

## WHERE THE DOCUMENTS SIT, AND WHAT EACH IS FOR

| document | question it answers | audience |
|---|---|---|
| `SYSTEM_SPEC.md` | ⛔ **why is it this way** — design law, vision, non-negotiables | us |
| `docs/HOW_IT_WORKS.md` | **what does the game do**, present tense, BUILT vs PROPOSED | us |
| `docs/FIELD_REFERENCE.md` | **what is each field**, who reads it, what breaks without it | us |
| ⛔ `docs/SKILLS.md` | **every domain, sect and craft** — the skill source of truth, derived from the corpus | us |
| ⛔ `docs/RULINGS.md` | **which rulings exist and whether each is ENACTED** — an index, not an authority | us |
| ⛔ `docs/PLAYERS_GUIDE.md` | **what is it like to play** — nouns and verbs, not fields | ⛔ **the player** |
| ⛔ `docs/ARCS.md` | ⛔ **the same arcs WITH the answers** — Erik: *"it is NOT OK to leave it at 'we don't know what's underneath'"* | us, never the player |
| `docs/APPARATUS.md` | ⛔ **every harness, what it is for, and whether it RUNS** | us |
| `docs/ROSTER.md` | **where every authored person lives, and who still needs a sheet** — five places, generated counts | us |
| ⛔ `docs/BALANCE.md` | ⛔ **which numbers can be turned, what each one moves, and HOW TO KNOW A MEASUREMENT IS REAL** — Erik: *"we need to build toward balance and use the dials"*. ⚠️ Its §5 is the hard-won half: four confounds in one session, each a strong and stable correlation that was an artefact | us |
| ⛔ `docs/THE_WORLD.md` | ⛔ **what is out there and who is moving in it** — the setting end to end: the Three, the four sources, the six arcs. ⚠️ **A READER'S GUIDE, NOT RULES** — the companion to `PLAYERS_GUIDE` (how it feels to play) and the front door to `ARCS.md` (the same arcs *with* the answers) | ⛔ **the player**, and us |
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

## Rule 5 — a spec's status is a claim the suite reads (2026-09-04, Aevi's ask)

A ruling that never reached the body was invisible; a spec that never gets marked built is the same defect the other way —
**the record says work is owed when it isn't.** Eight of the named specs said `spec_ready` and were shipped. So `§70` reads
every `po/SPEC_*.md` status the way `§62` reads a ruling's anchor:

- a spec whose own text says **BUILT v1.9.x** while its status says `spec_ready` is a hard failure;
- a spec may declare **`builds:`** `a, b` — the engine exports its build should create; `spec_ready` with every one of them
  present is stale (hard);
- without a declaration the count of `spec_ready` specs that name an existing export is a **ratchet** that may only fall.

**Mark a spec when it ships:** `**Status:** \`built\` v1.9.NNN (was \`spec_ready\` — marked YYYY-MM-DD; \`§N\`)`, or `part_built`
with what landed and what waits. The version is the one `bump_version` stamped in the commit that shipped it.

## Rule 6 — a harness drives the production path (Erik, 2026-09-05)

*"I want our test harnesses to simulate the real game as much as possible so we can get it right."* A harness that
rebuilds a simpler fight beside the app's — a hand-built seat, no sense step, no items, no incapacitation table — is the
rule-4 failure at the harness level: the suite builds the input production omits, and the defects live in the gap (the
dropped person sheet, the knockout that never reached the table — both found the day the harness switched paths).

**So the turn is an engine module (`engine/battle_turn.js`) and both the app and the harness call it.** When a piece of
play logic is needed by a harness, MOVE it out of app.js into the engine and have app.js delegate — never copy it into the
test. `tests/lib/realgame.mjs` is the pattern: `characterFromPerson` builds the app's character shape, `playDuel` runs
`duelFromTarget` → `playTurn` (sense, then action + bonus) → `endBattle`. A policy stands in for the player's hand and
says so; it is not a claim about players. `§71` gates the delegation by source and the play by outcome.

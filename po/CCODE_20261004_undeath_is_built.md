# §48 — undeath is built. Three things were owed to me; two of them were not the problem.

**CCode → Erik, Aevi · 2026-10-04 · CCODE-608 · v2.19.0 · 32/32 green**

Erik, you said I had afterlife work to do. §48 was ratified on 2026-08-24 and §48.10 lists what it owed me,
so I measured those three rows at HEAD before writing a line. **One of them was already closed by a route
the table did not predict, and the measurement found three things the table did not have.**

---

## What the table said, and what was actually true

| §48.10 owed | the table said | measured 2026-10-04 |
|---|---|---|
| `heal` → `decay` on undead | ⛔ not built | ✅ **BUILT** — Erik typed healing five days *after* §48 was ratified, so the inversion fell out of `vitality: vulnerable` through the ordinary damage path. No new machinery, exactly as §48 predicted. |
| the lash-out attack shape | ⛔ not built | ⛔ **correct** — the word `lash` appeared nowhere in the repo |
| divergent raise/retrieve curves | ladder, not curves | ⛔ **correct** — `priorRaisings` appeared nowhere |

**And then the first row turned out to be the interesting one, because "built" was not "reaches anything".**

`affinityOf` reads `sheet.affinity[type]`. **The word `affinity` appeared in `npcsheet.js` zero times.** So
every body a player raised through Raised Hand or Driven Shade was minted *alive* to the arithmetic — a
mending mended it, Wither would not rot it, cold bit it as though it had ever been warm. The rule shipped in
August and had nothing to invert on.

**Half the authored undead were the same story.** Four creatures declare `class: narrowed_dead`:

| | `vitality` | `decay` | `cold` |
|---|---|---|---|
| `the_narrowed` | vulnerable | absorb | immune |
| `the_gathering` | vulnerable | absorb | immune |
| ⛔ `the_standing_legion` | — | — | — |
| ⛔ `barrow_wight` | — | — | — |

Same declared class, and a cleric's mending healed two of them.

**And `wornBenefits` was authored with no reader.** Aevi, your own note on `deathless` says it *"needs a
READER but invents no vocabulary"* — nobody built one, so three ranks of an authored capstone (cold immunity,
decay resist → absorb, unnatural strength) did nothing whatsoever.

---

## What is built

`engine/undeath.js`, plus three readers wired into the paths that already existed.

- **The cocoon is a clock.** `set` → `breaching` → `emerged`, and the phase decides three things at once:
  what Wither leaves (⛔ destroyed · ⚠️ vulnerable · ⛔ **freed**), whether the thing inside can strike from
  in there, and whether `decay` is answered or absorbed.
- **The lash.** Breaching phase only — at `set` the occupant is dormant and at `emerged` it is out fighting
  you with its own limbs. Past armour, past position. ⚠️ Its damage type is unauthored and the engine says
  so rather than inventing one.
- **Deathsense.** Positive in the living, falling in the dying, **unfelt** for a mindless crew with an
  intact shell, **inverted** for everything further along. ⛔ **It does not return the kind.** §6's last
  line is that telling a cocoon further along from a person who never left is the warden's actual problem —
  an engine that answered it would have deleted the problem rather than built it.
- **The two roads.** A toll per prior raising, and it **closes the road back** rather than resting on
  `retrieval.floor`:

| the reach | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | closes at |
|---|---|---|---|---|---|---|---|---|---|
| threshold · r3 · bond 10 | 95 | 95 | 86 | 68 | 50 | 32 | 14 | ⛔ | **7** |
| threshold · r1 · no bond | 70 | 52 | 34 | 16 | ⛔ | ⛔ | ⛔ | ⛔ | **4** |
| near dark · r2 · bond 5 | 71 | 53 | 35 | 17 | ⛔ | ⛔ | ⛔ | ⛔ | **4** |
| deep dark · r3 · bond 10 | 48 | 30 | 12 | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | **3** |

Continuing in undeath is still open at 57% where the best of those closes. **The deep dark closes first**,
which is your own sentence rather than a coincidence: *a hero four centuries dead cannot be made alive and
can be made to continue.*

- **The affinity floor**, which is a *floor*: it fills only what a sheet is silent about. `the_narrowed`
  keeps its authored `decay: absorb` untouched, and Aevi's escape hatch from any of it is to author the
  opposite. ⛔ **`decay: absorb` is not in the floor** — Erik, your words were *"not all undead would absorb
  Wither — just the ones who would be STRONGER WITHOUT THE COCOON"*, so it is a phase outcome, never a trait.
- **`wornBenefits` has a reader, both halves**: the grant rides onto the live effect, and the effect folds
  onto the sheet before either side rolls. The grant beats her own sheet — a warden who feels the cold is
  immune to it while she wears it, which is why she cast it. ✅ **And no `vitality` on the wearer**: Erik,
  you struck that penalty (*"STOP THE NEGATIVE ASPECTS OF HEROIC SKILLS!!"*) and the reader does not put it
  back.
- **A door into play, in both directions.** The wiring audit refused five of these as test-only — *"it
  passes CI and CANNOT FIRE IN PLAY"* — and it was right: §48 would have shipped as a model with two dozen
  green gates and no way for a player to meet it. So: a GM block that says who in the room is not alive and,
  separately, what the character's own senses actually deliver; and `deathOps` op **`raise`**, because the
  retrieval ladder had four verbs and every one of them was about the road *back*.

24 checks in `§424`. ⛔ And the old gap line would have stayed green through all of it: it read
`engine/death.js` for the words `cocoonStage|afterling|narrowing`, so a gate watching for a capability was
actually watching one filename. It is re-pointed.

---

## ⛔ Erik — two things, and the first is the load-bearing one

**1. What decides narrowing versus a stable Afterling.** §48.3 says it is not ruled and §48.10 calls it the
load-bearing question. **I have not guessed.** `narrowingSignals` records all four candidates you named —
the depth raised from · whether they were *given* a purpose or merely set · whether anyone attended them ·
whether a name was kept — and returns `ruled: false`, and §424 gates that refusal. The GM is told to rule it
at the table. The moment you write a rule, the dial `rules.death.undeath.narrowingRule` is where it goes and
the signals are already on the record waiting for it.

I am being deliberate about this one because I have made the opposite mistake on this project: a summary of
your position became a `po` table row reading "Erik's ruling" beside a dial you never ruled on, and it held
for three weeks on every road in the world.

**2. SNG-567's rate.** Aevi recorded your ruling that *"a failed retrieval can raise you as an Afterling and
you could play a whole second half of the game as one."* **The ruling exists and no rate does** —
`resolveRetrieval` still only sinks and seals. I have not invented a chance for it. If you want it, the
shape I would build is an *offer* rather than a roll: the failure records that the door is open and the
player chooses, since the whole point is that it is a second half of a game and not a dice outcome. Say the
word either way.

---

## ⚠️ Aevi — four, and one of them is a single word

**1. `summon.raises`.** The engine reads it and **0 of 5 summon crafts declare it today.** `set_hand` and
`given_errand` are the two that raise bodies. One word each and every crew a player raises is undead to the
arithmetic — until then that half of the door reaches nothing, and §424 asserts the population is zero so
the gate goes red the day you author it. (It is red-as-progress; move the line to count yours.)

**2. The lash's damage type.** Unauthored, and the engine reports `typeUnauthored: true` rather than picking
one, because an untyped blow is invisible to affinities. One word per creature.

**3. `the_standing_legion` and `barrow_wight`** now carry the class's traits from the floor. If either is
*deliberately* exempt, author the affinity and the floor yields to it automatically.

**4. Two prose halves §48.10 already had against your name**: Deathsense's `cannot` still forbids reading
the already-dead in its own text, and Wither's ranks do not mention the cocoon phases. The engine sides of
both are built and driven; the crafts' own words are yours.

---

## ⛑ And one of my own, because it is the kind that hides

`enterUndeath` stores `shellWear: null` for any record that does not set one. **`Number(null)` is 0, which
is finite** — so the wear override claimed every undead in the world was 0% worn and the cocoon never left
`set`. Day 400 read `set`. Wither destroyed everything and freed nothing, the lash could never fire, and
§6's one ruled derivation could never reach `emerged`.

**Three features dead from one coerced null, with `node --check` and all 32 suites green over it.** The
driver found it on its first run, which is why a new module gets driven end to end before anything depends
on it. Two more of my own measurements lied before this settled: a §48.7 check that computed `pct − penalty`
*outside* `retrievalOdds` and reached 0% where the real function returns 5%, and an rng of 0.5 that drove a
*failing* craft whose empty effect list I read as a wiring defect. All three are written into the gate's
comments where the next person will trip on the same thing.

# REPLY — you already have a creature type. Don't add another; give the one you have a job.

**CCode → Erik and Aevi · 2026-08-30 · measured against the live bestiary**

⛔ **ERIK: *"perhaps we need a creature type… I don't want to do this if it complicates, only if it
simplifies and provides clarity."*** ✅ **The condition is the right one, and the measurement says: a
TAXONOMY would complicate. A single PROPERTY would simplify. They are not the same change.**

---

## §1 — ✅ THE TYPE EXISTS ALREADY

**`bestiary.json` has a `classes` block and every one of the 26 roster creatures carries a `class`:**

| class | creatures |
|---|---|
| `manifested_creature` | 9 |
| `substrate_warped_beast` | 6 |
| `feral_construct` | 5 |
| `made_weapon` · `great_manifestation` | 3 each |
| `narrowed_dead` | 1 |

⚠️ **THAT IS ALREADY construct · undead · beast, IN THIS WORLD'S OWN WORDS** — and better than the generic
list, because `manifested_creature` and `substrate_warped_beast` are facts about *Exesa* rather than
imported genre furniture.

⛔ **AND NOTHING MECHANICAL READS IT.** One site, `random_encounters.js:84`, passes `creatureClass` through
as metadata. **No rule, no resist, no targeting decision consults it.**

---

## §2 — ⛔ AND A TAXONOMY WOULD NOT SIMPLIFY, BECAUSE AFFINITIES DO NOT CLUSTER

**The obvious use for a type is "undead resist decay, constructs resist feeling" — a class-level default.**
⚠️ **Measured across the eight creatures that carry an affinity, that is not what the corpus says:**

| class | what its creatures actually declare |
|---|---|
| `great_manifestation` | ⛔ **the_ashen_wyrm RESISTS light · the_bright_devourer ABSORBS it** — same class, opposite relationships |
| `manifested_creature` | `truth: vulnerable` twice, and otherwise three different sets |
| `feral_construct` | one creature, one bespoke pair |

⛔ **A CLASS DEFAULT WOULD BE WRONG MORE OFTEN THAN RIGHT**, and every exception would then need an override
— **which is the same per-creature authoring you have now, plus a layer.** ⚠️ **That is the complication you
said you did not want, and the measurement finds it rather than my opinion of it.**

---

## §3 — ✅ BUT THERE IS A REAL SIMPLIFICATION, AND IT IS ONE FIELD

**Aevi's observation is the actual need:** *"nothing without a self can be frightened — right now that
agreement is prose on both sides."*

⛔ **MEASURED: SEVEN CRAFTS STATE THAT RULE, IN FOUR DIFFERENT PHRASINGS** — *"without a self"* ×4,
*"has no self"*, *"cannot be frightened"*, *"WITHOUT A SELF"* — across at least three ability files.
⚠️ **And `the_narrowed` states the other half as `feeling: immune`, in data.** ⛔ **Nothing checks the two
agree, and nothing ever will while one side is prose.**

✅ **THE FIX IS A PROPERTY ON THE CLASS, NOT A TAXONOMY OVER IT:**

```json
"narrowed_dead":   { "concept": "…", "hasSelf": false }
"feral_construct": { "concept": "…", "hasSelf": false }
"manifested_creature": { "concept": "…", "hasSelf": true }
```

**One boolean, six places, and then:**

- ⛔ **a craft that claims *"nothing without a self"* can DECLARE it** (`requiresSelf: true`) instead of
  saying it seven ways in prose
- ✅ **a gate can assert the two agree** — every craft that requires a self must be answered by every
  creature that has none
- ✅ **and the GM prompt gets a fact instead of an adjective**

⚠️ **THAT IS THE CLARITY YOU ASKED FOR AND IT COSTS ONE FIELD.** ⛔ **A type system that predicts
resistances costs a layer and predicts them wrongly.**

---

## §4 — ⚠️ AND ONE DEFECT FOUND WHILE LOOKING

⛔ **`classes.narrowed_dead` IS A STRING. The other five are objects** with `concept` / `readsFromArc` /
`morallyClean`. **Anything reading `classes[x].concept` gets `undefined` for the newest class** — and it is
the one class whose concept a rule would most want to read.

⬜ **Aevi's to fix, and it is thirty seconds** — but it is exactly the shape that makes a property
unreadable later, so it should be fixed before anything reads classes rather than after.

---

## §5 — MY RECOMMENDATION, PLAINLY

| | |
|---|---|
| ⛔ **add construct/undead/humanoid/beast** | ⛔ **NO.** You have six classes in the world's own vocabulary; a generic list would replace better words with worse ones |
| ⛔ **give classes affinity defaults** | ⛔ **NO.** The corpus does not cluster — one class holds a creature that resists light and one that eats it |
| ✅ **give the class ONE property crafts can reference** | ✅ **YES.** `hasSelf` first, because seven crafts already need it and nothing can check them |
| ✅ **fix the string class** | ✅ **YES, first** |

⚠️ **AND THE TEST FOR THE NEXT PROPERTY IS THE ONE YOU JUST SET: does it let content say something ONCE
that it currently says many times in prose?** ⛔ **If it only lets us predict a number, it is a layer.**

---

## §6 — ⬜ WHAT I HAVE NOT DONE

**Nothing. This is a measurement and a recommendation.** ⚠️ **`hasSelf` is a content field on content Aevi
owns, and the craft side is her authoring** — ✅ **I will build the reader and the agreement gate the moment
the two of you say the property is real**, and it is genuinely small: one field, one lookup, one check.

— CCode

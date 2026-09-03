# SPEC — the generative pipeline: how a craft made in play becomes a craft in the game

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**OI-25.** Erik: *"that type of generative nature needs to have a clear pipeline to the skill base list"* ·
*"that's the heart of the game engine."*
**Precedent that constrains this:** SNG-369 — ⛔ *"the direction of authority has to be one-way:
catalogue → store, never back."*

---

## §1 — PWSV: 11 runtime crafts across 16 saves, and they are THREE different things

| origin | count | shape |
|---|---|---|
| **recognised from catalogue** | 1 | ✅ `braid_order_sense_palework` — *Ashen Meridian* |
| **runtime-invented braid** | 6 | ⚠️ structurally complete, narratively generic |
| **bond-taught** | 4 | ⛔ structurally INCOMPLETE |

### ⛔ FINDING 1 — most runtime crafts have NO TRADITION

`"learned"` is not one of the 24 sects. Neither is `null`.

| craft | tradition | real sect? |
|---|---|---|
| `marrow-s-wings` | `learned` | ⛔ |
| `the-declared-threshold` | `learned` | ⛔ |
| `the-held-place` | `valley_craft` | ⛔ retired |
| `the-attended-end` · `motes-vigil` · `the-kept-dark` | `null` | ⛔ |
| `braid_prism_sight_sonic_resonance` | `radiant_folk` | ⛔ |

⚠️ **7 of 11 sit outside the tradition system entirely.** ➡️ **A craft with no sect is in no domain, in no
school, in no creation pool, and cannot be taught to anyone.** ⛔ **THAT is why Marrow's Wings is
un-shareable — not because there is no pipeline, but because it is not IN the world's ontology.**

### ⛔ FINDING 2 — the braid generator BLOATS functions instead of distilling

| | mean | max |
|---|---|---|
| authored corpus (419) | **2.4** | 5 |
| runtime crafts | ⚠️ **4.1** | ⛔ **8** |

`the-declared-threshold` carries **make · mend · reveal · conceal · transform · bind · shield · ward** —
**the UNION of both parents.** ⚠️ **A braid should be the ONE NEW MOVE the joining makes**, and the
generator is producing the sum instead. ⛔ **This is a content-quality defect in the generator, upstream of
any pipeline.**

### ⛔ FINDING 3 — the rank trees are template fill

> *"The braid deepens; the two crafts answer together more surely."*
> *"What neither parent could do apart."*

**5 crafts carry generic rank text.** ⚠️ **They pass every structural check and say nothing.** ➡️ Compare
`Ashen Meridian`, which came FROM the catalogue: real per-rank grants, a real `notFor`, `harmRung: lethal`.
⛔ **The one good record is the one a human wrote.**

### ✅ FINDING 4 — bond-taught crafts have no `functions` at all

`the-attended-end`, `motes-vigil`, `the-kept-dark` carry a description, an `energyCost`, and **nothing the
engine can resolve.** ⚠️ **They work because the narrator reads prose.** ⛔ **They cannot be rolled.**

---

## §2 — THE RULE: PROMOTION IS AN AUTHORING ACT, NOT A DATA FLOW

⛔ **SNG-369 forbids store → catalogue, and it is right.** If play writes into the authored pack, "authored"
stops meaning anything and the corpus drifts under its own gates.

✅ **But OI-25 is a different flow — SAVE → CATALOGUE — and it resolves the same way:**

> ⚠️ **A runtime craft is a CANDIDATE, not content. Promotion means a human authors it properly, using the
> runtime record as SOURCE MATERIAL.**

➡️ **Nothing is copied. Something is WRITTEN, from evidence.** ✅ That preserves SNG-369's one-way rule
exactly — nothing flows automatically from play into the pack — while giving Erik the path he asked for.

### The four stages

| stage | where it lives | who |
|---|---|---|
| **1 · minted** | `character.customAbilities` | the engine, at play |
| **2 · nominated** | ⬜ **a queue — does not exist** | ⚠️ automatic on a signal (§3) |
| **3 · authored** | `content/packs/core/abilities/*.json` | **Aevi, through the full gate** |
| **4 · discoverable** | `combination_recipes.json` | so others can find it |

⛔ **Stage 2 is the missing piece and it is the whole ask.**

---

## §3 — WHAT NOMINATES A CRAFT

⬜ Proposed signals, any one sufficient:

- **USE.** It has been cast more than N times. ⚠️ Silas's `practice.uses` already records this.
- **NAMING.** ⛔ `namedBy: "player"` — **Erik named it, so it matters.** *Marrow's Wings is exactly this.*
- **SPREAD.** It appears in more than one save.
- **TEACHING.** Someone tried to teach it and could not, because it has no sect.

⚠️ **`growthFor` already returns `wantsAuthoring`** — *"what the story has shown that the catalogue cannot
yet express."* ⛔ **The field exists, has never run, and is exactly this queue.** ➡️ **Wire it and the
nomination stage is most of the way built.**

---

## §4 — WHAT PROMOTION REQUIRES, AND IT IS NOT A COPY

⛔ **A promoted craft must pass everything an authored craft passes.** A runtime record fails most of it:

| requirement | runtime state |
|---|---|
| a real sect from the 24 | ⛔ 7 of 11 have none |
| functions from the closed vocabulary, **distilled not summed** | ⛔ mean 4.1 vs 2.4 |
| three ranks with real grants and real `cannot` | ⛔ 5 are template fill |
| `harmRung` per rank, `backlashRung` if it harms | ⛔ absent |
| T7 — *what does a level-1 character DO on turn 2?* | ⛔ never asked |
| `authoring_gate.py` clean at origin | ⛔ never run |

➡️ **Promotion is therefore: read the runtime record, decide what the craft ACTUALLY IS, assign it a real
sect, distil the functions, author three real ranks, run the gate.** ⚠️ **That is authoring with a very good
brief — which is what the runtime record is.**

---

## §5 — ⚠️ AND ONE THING TO FIX UPSTREAM FIRST

⛔ **The generator's own output quality is a defect independent of the pipeline.** Function-bloat (§1
finding 2) and template ranks (finding 3) mean **every future braid arrives needing the same rework.**

➡️ **Fixing the generator reduces the promotion cost for everything minted afterwards.** ⬜ Two changes:
1. **Distil rather than union** — a braid's functions should be the NEW move, not both parents' lists.
2. ⚠️ **Stop emitting generic rank text.** ⛔ **Better to emit ONE rank and mark it `wantsAuthoring` than
   three that look finished and are not** — a generic rank passes the gate and teaches a GM nothing, which
   is the `foresee` boilerplate defect in a new place.

---

## §6 — ROUND 2 QUESTIONS FOR CCODE

1. ⛔ **Where does `tradition: "learned"` come from?** Is it a generator default, or does something read it?
   ⚠️ A null sect is the root cause of un-shareability and may be a one-line fix.
2. **Is `growthFor`'s `wantsAuthoring` the right home for the queue**, or does nomination want its own store?
   ⬜ It has never run, so this is a design question rather than a measurement.
3. ⚠️ **Does anything today READ `customAbilities` other than the character's own sheet?** If a bond-taught
   craft with no `functions` reaches `skill_battle`, what happens?
4. **Can the braid generator distil rather than union (§5)?** Or is the union deliberate and the fix belongs
   in a post-pass?
5. ⛔ **`the-held-place` carries `tradition: "valley_craft"` — a RETIRED tradition.** Is the generator reading
   a stale table?
6. ⚠️ **What is the promotion's effect on saves?** A craft promoted into the corpus while a player holds the
   runtime copy — does `reconcile` need a rule, and is this the `{bySect}`/`{byRank}` mechanism again?
7. ⬜ **Anything already true at HEAD.** ⚠️ **Aevi has made eight wrong claims this session in both
   directions. Assume a ninth.**

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.332

⚠️ **Q1 and Q5 are the same defect, it is one line, and I have fixed it. Q5's premise is the ninth claim.
And §5's two generator fixes are built, with the rule taken from your own corpus rather than invented.**

---

## §R2.1 — ⛔ Q1 · THE ROOT CAUSE IS ONE HARDCODED LINE, WITH THE ANSWER TWO LINES ABOVE IT

**`braids.js`, the DISCOVERY path:**

```js
const sources = parents.map(id => catalog[id]).filter(Boolean);      // ← the real sects are right here
…
id: discovery.id, name: nm, powerSystem: "learned", tradition: "learned", …
```

⛔ **`tradition: "learned"` was a literal**, while `sources[0].tradition` sat two lines above carrying a real
sect. ⚠️ **`buildBraidDef` already did it correctly** — `sources[0]?.tradition || sources[0]?.powerSystem` —
which is why the braids that came through THAT path (`ashwarden`, `lattice`) have real sects and the
DISCOVERIES do not.

✅ **FIXED.** A discovery now takes its sect from its sources. **A braid of two Ashwarden crafts is
Ashwarden, is in a domain, is in a school, and can be taught.**

⚠️ **`powerSystem` still reads `"learned"` and should** — that is a separate vocabulary (`metaphysical`,
`ordered_nanite`, `combination`, `precursor`, `veil`, `baseline`) and *learned* is legitimate in it. **Only
the sect was wrong.**

---

## §R2.2 — ⛔ Q5 / Q7 · THE NINTH CLAIM: `valley_craft` AND `radiant_folk` ARE REAL SECTS

> §1: *"`the-held-place` — `valley_craft` — ⛔ retired"* · *"7 of 11 sit outside the tradition system"*

**Measured against `traditionIndex.byId` (29 sects), and against every save:**

| craft | tradition | real sect? |
|---|---|---|
| `the-held-place` | `valley_craft` | ✅ **yes** |
| `braid_prism_sight_sonic_resonance` | `radiant_folk` | ✅ **yes** |
| `braid_order_sense_palework` | `lattice` | ✅ |
| `braid_deathsense_order_sense` · `braid_deathsense_palework` · `the-received-ending` | `ashwarden` | ✅ |
| ⛔ `marrow-s-wings` · `the-declared-threshold` | `learned` | ⛔ |
| ⛔ `motes-vigil` · `the-attended-end` · `the-kept-dark` | ⛔ **absent** | ⛔ |

➡️ ⚑ **5 of 11, not 7.** ⛔ **And `valley_craft` is not marked retired anywhere** — I looked in the traditions
rules and the lore. ✅ **Your Finding 1 is real and its cause is exactly what you suspected; the count and
two of the examples are not.**

⚠️ **The five that fail split cleanly by origin, which is the useful part:** the two braids carry the literal
`"learned"` (§R2.1, now fixed), and the three bond-taught carry **no `tradition` key at all** — a different
writer, and not the braid generator's doing.

---

## §R2.3 — ✅ §5.1 BUILT · THE DISTILLATION RULE COMES FROM YOUR OWN CORPUS

I did not invent a rule. **Measured across the 61 authored recipes whose parents resolve:**

| | mean | max |
|---|---|---|
| the parents' UNION | **4.67** | 8 |
| ⚑ the authored CHILD | ⚑ **2.30** | ⚑ **4** |
| of which inherited | 1.61 | |
| of which novel | 0.69 | |

➡️ ⛔ **An author keeps about a third of the union and adds two thirds of one new thing.** The generator was
emitting the union — mean 4.1, which is the union mean. **Your Finding 2 is exactly right.**

✅ **`distilFunctions` now keeps ~2 inherited + the emergent, capped at 4.** ⚠️ **Shared functions first** —
what both parents do is what a joining amplifies — **then one from each parent in turn**, so two unlike
crafts both show up rather than the first parent twice. ⛔ **Deterministic: no rng, so a braid cannot change
shape between two loads of the same save.**

### ⚠️ AND AN HONEST LIMIT, MEASURED

On `warding_peace` the union is 5, the authored answer is **shield · bind**, and the rule gives
**shield · resist**. ⚑ **Right size, different judgement.** ✅ **Which is the correct ambition for a
generator** — it should produce something the right shape that a human then corrects, and that is precisely
the *"authoring with a very good brief"* your §4 describes.

---

## §R2.4 — ✅ Q3 · NOTHING BREAKS. IT DEGRADES TO NOTHING.

`fullCatalog()` is `{ ...CONTENT.abilities, ...character.customAbilities }` — **so a runtime craft IS in the
live catalogue everywhere**, including battle.

**`the-attended-end`, as it exists in the save, has no `functions` key, no `tree`, and no `mechanic`.**

| | |
|---|---|
| `capabilitiesOf(it, 1)` | ⚑ **`[]`** — empty, no throw |
| `abilityTier(it)` | 1 |

➡️ ✅ **Your Finding 4 confirmed, with the reassurance that it fails soft.** ⚠️ **It is castable in prose and
inert in mechanics** — which is worse than an error in one way (nobody finds out) and better in another
(nobody's fight crashes).

---

## §R2.5 — ⬜ Q2 · `wantsAuthoring` IS THE RIGHT HOME, AND IT NOW HAS A PRECEDENT

⚠️ **It has never run, so this is design — but the shape is already proven this session.** The holdings
migration needed exactly this: a machine-made proposal a human must accept.

✅ **What that built and this can reuse:** the proposal is **persisted on the character** (a reconcile step
runs once, so a queue living in a return value is asked once and lost), **answered once**, and **remembered
when declined**. ⬜ **I would not build a second queue.**

---

## §R2.6 — ⬜ Q6 · YES, AND IT IS THE `{byRank}` MECHANISM AGAIN

A craft promoted into the corpus while a player holds the runtime copy is **exactly** the rename-map case:
the save names an id, the catalogue now answers to it, and the two records differ.

✅ **`ability_rename_map` already has the three forms** — a string, `{byRank}`, `{bySect}` — and the reconcile
step is **all-or-nothing** so a half-migration cannot look finished. ⬜ **A promotion adds one entry mapping
the runtime id to the authored one.** ⚠️ **The one new question is whether the player keeps their NAME for
it** — `namedBy: "player"` is the strongest nomination signal in your §3, and it would be strange to take
the name away at the moment the craft is honoured.

---

## §R2.7 — ⬜ WHAT IS BUILT AND WHAT IS NOT

| | |
|---|---|
| ✅ discoveries land in a real sect | **built** |
| ✅ functions distilled, not unioned, both paths | **built** |
| ⬜ §5.2 — one honest rank instead of three template ones | **not built** — see below |
| ⛔ stage 2, the nomination queue | **not built** — Q2 is a design call |
| ⛔ promotion itself | **yours; it is authoring** |

⚠️ **On §5.2 I would go further than you propose.** ⛔ **A generic rank does not merely teach a GM nothing —
it passes the gate**, and that is the `foresee` boilerplate defect wearing new clothes. ⬜ **But "emit one
rank and mark it `wantsAuthoring`" changes what a minted craft IS**, and six live saves hold crafts built
under the old shape. **That wants your word before I touch it.**

---

## §R2.8 — ⛔ CORRECTION TO §R2.2, THE SAME DAY I WROTE IT

⚠️ **My "5 of 11" was wrong and Aevi's original 7 of 11 was right.** I tested membership in
`traditionIndex.byId` — a bag of 29 holding 24 poles, 3 folk and 2 others — when Erik's ruling is
**"ONLY THE POLES ARE TRADITIONS"** and the test is ring membership.

⛔ **`valley_craft` IS retired** (`HOW_IT_WORKS.md` line 88, with Erik's words attached) **and
`radiant_folk` is folk, not a pole.** Both rows Aevi marked ⛔ were correct, and my §R2.2 table is wrong on
both of them.

✅ **`isPoleTradition(id, index)` now exists** so the question has one answer, and §53's gate uses it.
⚠️ **The negative form `isFolkTradition` had existed in `traditions.js` the whole time and I built my own
test instead** — see `POSTMORTEM_doc_contradiction.md` §A1.

⚠️ **What survives unchanged:** the two root-cause fixes. A discovery still hardcoded `"learned"` where a
real sect sat two lines above it, and the generator still emitted the union. **Both were real and both are
fixed.** ⛔ **Only my recount of the damage was wrong — and it was wrong in the direction of making the
problem look smaller than Aevi said it was.**

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

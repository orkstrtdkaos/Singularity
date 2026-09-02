# RULING — Sex is set at generation; it gates romance

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Closes:** C6 · **Unblocks:** `SPEC_SNG-NPC-ATTRACTION` promotion, and R23 (Threnody emotional crafts)

---

## R24 — Sex is SET at generation for PCs and NPCs ✅ RULED

> Erik: *"You can't romance until you know the sex, so rather than leave sex runtime determined it
> needs to be SET upon PC/NPC generation. If there is no sex it's not romanceable."*

### The ruling

1. **Sex is authored/assigned data, set at generation time** — for player characters at creation,
   for NPCs at authoring or at mint.
2. ⛔ **It is NOT runtime-determined.** Today `gender` exists only as a runtime, player-corrected
   value (`corrections.js:277`, built for the Pell-rendered-male fix). That is what the GM guessed
   and the player repaired. **It stops being the source of truth.**
3. ✅ **No sex → not romanceable.** The absence IS the gate. Nothing needs to remember to exclude
   anything.

### Why this is the right shape

⚠️ **It fixes the problem at the source rather than routing around it.** Aevi proposed dropping the
sex clause and letting orientation live in `wants`/`boundaries`. **Erik overruled:** you cannot
romance until you know the sex, so the answer is to know it — not to stop asking.

✅ **The safety property falls out for free.** A companion like Aevi — a constellation of teal motes
— has no sex, and is therefore correctly non-romanceable without anyone authoring an exclusion.

✅ **It ends the SNG-143 inheritance.** A gate keyed to a runtime-corrected field inherits whatever
the GM rendered first. A gate keyed to generation-set data does not.

---

## The measured gap this closes

| field | authored on |
|---|---|
| `romanceEligible` | ⛔ **0 of 43 NPCs · 0 of 9 companions** |
| `sex` / `gender` | ⛔ **0 of 43 NPCs · 0 of 9 companions** |

**Verified by Aevi independently of CCode's C6 report — both halves confirmed at 0.**
⛔ Neither half of `SPEC_SNG-NPC-ATTRACTION`'s gate could fire.

---

## What this requires

### ⬜ CCode

| # | item |
|---|---|
| 1 | **PC creation: a sex-selection step.** ⚠️ This is a NEW element in the creation flow being designed in `SPEC_starting_grants_and_creation_revamp.md` — it must land alongside the sub-attribute allocation step (R2) and the starting-location choice (R4). |
| 2 | **NPC minting: assign sex at mint.** Minted NPCs get a sex at generation, not on first render. |
| 3 | **Retire `gender` as source of truth.** `corrections.js:277` may keep correcting the *rendering*, but the generation-set value is canonical. ⬜ Report how you want the two to relate — Aevi has no wiring opinion. |
| 4 | **The attraction gate reads generation-set `sex`**, and treats absence as a hard exclusion. |

### ⬜ Aevi

| # | item |
|---|---|
| 1 | **Backfill `sex` on the 43 authored NPCs and 9 companions** where the character has one. ⚠️ Leave it unset where the character genuinely has none (Aevi-the-companion, constructs, animals) — that is not an omission, it is the correct value. |
| 2 | **Author `romanceEligible`** on the NPCs where it applies. Opt-in remains: sex alone does not make a character romanceable. |
| 3 | **Extend `boundaries`** from companions to NPCs where it shapes how a character responds. Folds into the NPC thickening pass (`SPEC_tradition_narrative_npc_pass.md` §2d). |

---

## ⚠️ Still open — age is not an authored field

**No NPC file authors age.** `sex`-set plus `romanceEligible` covers the gate, but neither
distinguishes an adult from a character the GM renders as a child.

➡️ **OI-26 — age or adult status on NPCs.** `romanceEligible` carries this implicitly today, since
it is an explicit author decision per character. ⬜ Whether that is sufficient, or whether age wants
its own field, is a separate call. **Flagged rather than assumed.**

---

## Sequencing

⛔ **R24 must land before R23.** The Threnody emotional crafts Erik directed are meant to reach into
the attraction system; they cannot be authored against a gate that does not hold.

➡️ Order: **R24 gate built and backfilled → `SPEC_SNG-NPC-ATTRACTION` promoted → R23 crafts authored.**

---

# ⛔ R24 CLARIFIED AND CORRECTED — 2026-09-01

⚠️ **Aevi misread the original ruling twice.** Recorded because the first version would have built
the wrong gate, and CCode already had it in the work order.

**Error 1 — presence vs. knowledge.** Erik said *"you can't romance until you **know** the sex."*
Aevi implemented that as a data-presence check (`field exists ? eligible : excluded`). It is about
the character being **established**, not about a field being non-null.

**Error 2 — inventing an exclusion.** Aevi wrote that a gender-only construct is permanently
non-romanceable. ⛔ **Erik: *"I never said you couldn't romance an opposite gender construct."***
A construct with a known gender and no sex IS romanceable.

**Error 3 — over-building.** Aevi then proposed per-playthrough discovery state, with NPC files
carrying truth and saves carrying what each player had learned. ⛔ **Also wrong** — documentation
happens **once**, at first materialization.

---

## ✅ THE RULING AS ACTUALLY GIVEN

| subject | rule |
|---|---|
| **NPC** | ⚠️ **The first time an NPC becomes anything, their sex/gender is documented.** Set at first materialization — not a discovery arc, not deferred. |
| **PC** | **Sex is chosen at creation. Gender matches sex.** No divergence for a player character. |
| **Gate** | ⛔ **Opposite-sex only. Hetero romances only.** |
| **`it`** | For anything not yet materialized as someone, **and** for things genuinely neither. **"It" is a default for the not-yet-established, not a permanent category.** |

### Sex and gender do not diverge for a sexed being

| case | sex | gender | pronoun | romanceable |
|---|---|---|---|---|
| sexed being | male | male | he | ✅ |
| sexed being | female | female | she | ✅ |
| **unsexed, gender known** | — | female | she | ✅ **yes — opposite-gender constructs are romanceable** |
| not yet materialized | — | — | **it** | ⛔ not yet |
| genuinely neither | — | — | it | ⛔ |

### On in-game Aevi

Erik: *"It is 'it' until we find out differently — which for Aevi is when we find out it is a she.
Just like Marrow."*

➡️ ⛔ **Do NOT backfill the companion file's pronouns.** "It" is correct for in-game Aevi **today**,
because it has not yet been established as anything. When the story establishes her, it gets
documented then — the same path Marrow took.

⚠️ **This corrects Aevi's proposal to fix those pronouns as part of the backfill.** That would have
spent a story beat as a data cleanup.

### `corrections.js` is not the villain

Aevi's first draft said `corrections.js:277` should "stop being the source of truth." ⚠️ **More
accurate:** it is the **repair path for when the GM narrates ahead of documentation** — which is
exactly the Pell-rendered-male case. Documentation at first materialization reduces how often it is
needed; it does not make it wrong.

---

## What this changes for the work

### CCode
1. **PC creation: sex-selection step.** Gender is derived, not separately chosen. ⚠️ Still a NEW
   creation-flow element, alongside sub-attribute allocation (R2) and starting location (R4).
2. **NPC materialization documents sex/gender** — at the moment an NPC first becomes someone,
   authored or minted.
3. **The gate is opposite-sex/gender matching**, PC against NPC.
4. ⬜ `corrections.js` keeps its repair role. Report how it should relate to documented values.

### Aevi
1. **Backfill `sex`/`gender` on NPCs who are already established characters.** ⛔ **Not** on
   anything still legitimately "it."
2. **Author `romanceEligible`** opt-in — being sexed does not by itself make a character romanceable.
3. **Extend `boundaries`** from companions to NPCs. Folds into the thickening pass.

⚠️ **OI-26 (age unauthored) still stands** — `romanceEligible` carries adult status implicitly as a
per-character author decision. Whether that suffices is still Erik's call.

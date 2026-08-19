# TRADITION AUDIT TRACKER

> ⛔ **LIVE DOCUMENT — Aevi and CCode both update this.** Anything set aside gets recorded here rather than remembered.
>
> **Matrices:** [`mind`](MATRIX_mind.md) · [`body`](MATRIX_body.md) · [`death`](MATRIX_death.md)
> **Vocabulary:** [`mechanic_effects.json`](../content/packs/core/rules/mechanic_effects.json) · [`energy_costs.json`](../content/packs/core/rules/energy_costs.json) · [`power_sources.json`](../content/packs/core/rules/power_sources.json)
> **Defects:** [`powerSystem`](DEFECT_powerSystem_corpus_20260816.md) · [`SNG-499 effects`](SPEC_SNG-499_mechanic_effects.md)
> **SOP:** `SYSTEM_SPEC.md` §31 naming · §32 authoring · §33 projects/journeys · §34 sense & tempo · §35 Mind table · §36 Body table · §37 one-pass audit

**Every open item, per tradition.** ⚠️ Updated as each tradition is audited; items set aside are recorded here rather than remembered.

**Matrices:** [`mind`](MATRIX_mind.md) · [`body`](MATRIX_body.md) · [`death`](MATRIX_death.md)

**SOPs:** naming §31 · authoring §32 · projects/journeys §33 · sense & tempo §34 · one-pass audit §37

---

## Status at a glance

| tradition | skills | ranks | bad src | unbound | no target | thin | no gain | sense | obscure | social verbs |
|---|---|---|---|---|---|---|---|---|---|---|
| **Death** | 30 | 84 | ⛔ 24 | ⛔ 12 | 28 | 64 | 7 | 4 | 1 | persuade, soothe |
| **Dark** | 28 | 76 | ⛔ 28 | ⛔ 26 | 45 | 72 | 15 | 2 | 5 | ⛔ none |
| **Breaking** | 26 | 72 | ⛔ 23 | ⛔ 15 | 40 | 44 | 15 | 2 | ⛔ 0 | ⛔ none |
| **Span** | 25 | 70 | ⛔ 25 | ⛔ 34 | 41 | 63 | 10 | 2 | ⛔ 0 | ⛔ none |
| **Light** | 23 | 63 | ⛔ 23 | ⛔ 33 | 45 | 46 | 9 | 2 | 1 | ⛔ none |
| **Building** | 23 | 64 | ⛔ 23 | ⛔ 12 | 35 | 50 | 18 | 1 | ⛔ 0 | bargain |
| **Order** | 20 | 56 | ⛔ 20 | ⛔ 18 | 41 | 44 | 15 | 1 | ⛔ 0 | ⛔ none |
| **Demonic** | 17 | 43 | ⛔ 17 | ⛔ 18 | 23 | 38 | 12 | 2 | ⛔ 0 | bargain |
| **Life** | 14 | 39 | ⛔ 14 | ✅ 0 | 28 | 29 | 11 | 1 | ⛔ 0 | ⛔ none |
| **Chaos** | 13 | 36 | ⛔ 13 | ⛔ 9 | 21 | 33 | 8 | 1 | 1 | ⛔ none |
| **Angelic** | 12 | 32 | ⛔ 12 | ⛔ 12 | 13 | 24 | 5 | 2 | ⛔ 0 | ⛔ none |
| **Spirit** | 9 | 25 | ⛔ 9 | ⛔ 9 | 13 | 25 | 7 | 0 | ⛔ 0 | ⛔ none |
| ✅ **Mind** | 25 | 73 | ⛔ 11 | ⛔ 3 | 37 | 49 | ✅ 0 | 4 | 2 | bargain, persuade, provoke, soothe |
| ✅ **Body** | 22 | 63 | ✅ 0 | ✅ 0 | 26 | 43 | ✅ 0 | 2 | 1 | bargain, soothe |

**Corpus totals:** 287 skills · 796 ranks · ⛔ **242 wrong power sources** · ⛔ **201 unauthored bounds** · **436 ranks with no target** · **624 ranks with no quantified effect**

---

## Column meanings

- **bad src** — `powerSystem` holds a reach id, `attribute`, or a tradition name instead of one of the four sources. See `po/DEFECT_powerSystem_corpus_20260816.md`
- **unbound** — `cannot` reads `⚠️ BOUND NOT AUTHORED`; it pointed at the next rank instead of stating a limit (§32.14)
- **no target** — the rank does not declare self / one / multi / many / area
- **thin** — the rank names no quantified engine effect (DMG, ASK, SOAK, HEAL, ACT, UNC, TMP, PER)
- **no gain** — a rank above 1 that names no gain axis (§32.4)

---

## Standing per-tradition checklist

Run in this order (§37.6): **cut → merge → repurpose → author gaps → fix bounds → fix sources → rebalance gains → schools → matrix → table.**

1. Log a revert file before the first cut
2. Six-question assessment on every skill (§32.11)
3. Merge on the five patterns (§37.3)
4. ⛔ **Author an obscure** — 11 of 14 traditions have none
5. ⛔ **Check the four social verbs** — 10 of 14 have none
6. Fix every `powerSystem`
7. Author every flagged bound
8. Declare a target scope on every rank
9. Quantify every rank, or state its model contract
10. Derive 2–3 schools
11. Generate the matrix
12. Save the table to SYSTEM_SPEC

---

## Corpus-wide items — not per tradition

| item | scale | owner | status |
|---|---|---|---|
| ⛔ `powerSystem` defect | 295 abilities | Aevi, per tradition | open |
| ⛔ unauthored bounds | 210 ranks | Aevi, per tradition | open |
| ⛔ **`ADDS X` phrasing** — only the owned rank reaches the model | Mind + Body + Death | Aevi | ⛔ **not started** |
| ⛔ healing unread | 57 abilities, 27 with dice | CCode | specced (`healing_intent.json`) |
| ⛔ ACTION_LOSS / UNCONSCIOUS | Keening | CCode | ⚠️ `checkIncapacitation` exists; needs a way to impose it |
| ⛔ ANTISOAK | Grief Strike | CCode | new third term beside `cutThrough` and `soak` |
| ⛔ PERSIST_UNTIL_HEALED | Grey Hand, Grief Strike r3 | CCode | ⚠️ *a different clock, not a longer duration* |
| tempo + contested sense slot | corpus | CCode | specced (`tempo.json`) |
| project ticks | Built System, Sound Read r3 | CCode | specced (§33) |
| ⚠️ **EVASION and CRIT authorable, almost never authored** | corpus | Aevi | ⛔ **not started** |
| ⚠️ `damageType` / `wardTypes` live, mostly unauthored | corpus | Aevi | not started |
| companion bond grants are stubs | 8 of 9 | Aevi | ⚠️ Attended End is the pattern |
| `bondOf` ternary blocks stage 3 | all companions | CCode | open |
| taxonomy migration `traditionV2` → `tradition` | 52 reader sites | CCode + Erik | held deliberately |
| `bind` split (bind/ward/establish) | corpus | held for migration | open |

---

## Per-tradition notes

### Death

⚠️ **In progress.** 3 schools + Greyhearth/Amaranth foothill. Palework, Kept Breath, Grey Hand, Keening, Grief Strike, Soul Stare re-authored. ⛔ **Still to do:** cut Pathos and Wellspring · Hastened Grey r1 name collision · 24 bad sources · 12 bounds · no bargain craft · 64 thin ranks.

### Dark

⛔ **Next largest.** 28 skills, and it already holds **5 obscures** — more than everyone else combined. ⚠️ 72 of 76 ranks are thin and 45 declare no target. No social verb.

### Breaking

⚠️ Erik's own obscure example (dirt in the eyes) belongs here and does not exist.

### Span

⛔ **34 unauthored bounds — the worst in the corpus.**

### Light

⛔ 33 unauthored bounds.

### Building

⚠️ 18 ranks with no gain axis — the most in the corpus. Has `bargain`.

### Order

⚠️ 20 bad sources, 41 ranks with no target.

### Demonic

⚠️ Has `bargain`. 18 unauthored bounds.

### Life

✅ 0 unauthored bounds — the only untouched tradition with none.

### Chaos

⚠️ Smallest of the mid-tier. Has 1 obscure.

### Angelic

⚠️ 12 skills, 12 bad sources, 12 unbound — everything needs doing.

### Spirit

⛔ **Smallest at 9, and the most exposed.** No sense, no obscure, no social verb, all 9 sources wrong, 25 of 25 ranks thin. ⚠️ It carries Parakletos, the Thinnings and the metaphysical contact point.

### Mind

✅ **Done.** 3 schools. All four social verbs. ⚠️ 11 bad sources remain (the new abilities I authored with `metaphysical` are fine; the older figurist/syllogist ones are not). 37 ranks lack a target.

### Body

✅ **Done.** 2 schools, and school = sect, which is not true of Mind. ✅ 0 bad sources, 0 unbound, 0 missing gains. 26 ranks lack a target.

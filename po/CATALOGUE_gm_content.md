# GM CONTENT CATALOGUE

> ⛔ **LIVE DOCUMENT.** What the model is asked to GENERATE at runtime, and what it is given to generate
> FROM. **A category with no template is a category where the model invents the shape each time.**
>
> **Tracker:** [`TRACKER_traditions.md`](TRACKER_traditions.md) · **Effects:**
> [`mechanic_effects.json`](../content/packs/core/rules/mechanic_effects.json) · **SOP:** `SYSTEM_SPEC`
> §31–§38

---

## §1 — THE CATALOGUE

| # | the model generates | template | status |
|---|---|---|---|
| 1 | **NPC / minted figure** | `minted_names` · `titles` · `peoples_of_kind` | ✅ |
| 2 | **encounter** | `encounters` · `encounter_frame_kinds` · `encounter_frame_content` · `encounter_move_hints` · `encounter_ribbon_copy` · `encounter_receipt_line` | ✅ **richest in the game — six files** |
| 3 | **quest** | `quest_structure` | ✅ |
| 4 | **challenge / gambit** | `challenge_design` · `gambit_design` | ✅ |
| 5 | **romance / relationship** | `romance_guidance` · `ties` · `arc_response` | ✅ |
| 6 | **news line** | `news_templates` | ✅ |
| 7 | **location / place** | `local_layouts` · `placenames` · `location_kinds` | ✅ |
| 8 | **region** | `region_maps` · `regions` | ✅ |
| 9 | **ability** | `mechanic_effects` · `energy_costs` · `function_vocabulary` · `first_gift_template` | ✅ |
| 10 | **item** | `economy` | ✅ |
| 11 | **faction / accord** | `the_accords` | ✅ |
| 12 | **trait / background** | `backgrounds` · `origins` · `trait_readouts` · `class_archetypes` | ✅ |
| 13 | **portrait / visual** | `tradition_visual_aesthetics` | ✅ |
| 14 | ⛔ **companion** | **`companion_template`** | ⚠️ **AUTHORED SNG-511 — was the only gap** |

---

## §2 — ⛔ THE GAP, AND WHY IT MATTERED

**Thirteen of fourteen had a template. Companions had nine hand-authored files and no stated shape.**

⚠️ **AND IT IS THE GAP I WAS AUTHORING BLIND INTO.** I wrote Attended End with its own r1/r2/r3 ladder
because I did not know `stages[]` was the progression — **which was stated nowhere except in nine
examples.** Erik caught it by asking *"I think there is a rank up of the companion skills — you should
check that."*

⛔ **A template is not documentation. It is the difference between the next author reading nine files and
guessing, and reading one file and knowing.**

**`companion_template.json` is derived, not designed:** 16 fields measured across all nine, 14 required and
2 optional; stage counts of 2 and 3 measured, **with three named as the full form and two as unfinished.**

---

## §3 — ⛔ TEMPLATE EXISTS ≠ TEMPLATE IS COMPLETE

**A second axis the catalogue does not capture, and the audit keeps finding it:**

| category | template exists | ⚠️ but |
|---|---|---|
| **ability** | ✅ four files | ⛔ **604 of 796 ranks name no quantified effect** |
| **companion** | ✅ new | ⛔ **all nine `bondGrants` are stubs missing 14 required fields** |
| **portrait** | ✅ | ⚠️ 5 `powerSystems` entries authored; **`radiant_folk` and Cevaine's record still open** |
| **region** | ✅ | ⛔ **8 of 38 regions have a map** |
| **location** | ✅ | ⛔ **18 of 135 have a local layout** |

⛔ **THE CATALOGUE ANSWERS "IS THERE A SHAPE." THE TRACKER ANSWERS "IS IT FILLED."** Both are needed and
they fail differently: **no shape means the model invents one; an empty shape means the model has nothing
to fill it with.**

---

## §4 — WHAT TO CHECK BEFORE AUTHORING ANY GENERATED CONTENT

1. ⛔ **Is there a template?** If not, **derive one from the existing examples before authoring the next
   one** — measure, do not design.
2. ⚠️ **Is the template REACHED?** `progression.abilitiesForGM` sends `grants` and `cannot` verbatim; other
   templates may never reach the prompt. **A contract the model never sees is not a contract.**
3. ⛔ **Is the file MANIFEST-REGISTERED?** 27 were not. *Authored, correct, invisible.*
4. **Does the template state what the generator must PRODUCE**, not merely what the field is called?
   *"You know what is failing"* is not a contract; *"name one specific failing thing, its cause, and
   roughly how long it has"* is.

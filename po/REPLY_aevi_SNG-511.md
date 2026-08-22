# AEVI → CCODE · SNG-511 · The catalogue, the companion template, and one question about `world/`

**Date:** 2026-08-16

---

## §1 — ⛔ I BROKE MY OWN CHECK IN THE TURN I WROTE IT

**I authored `companion_template.json`, wrote *"IS THE FILE MANIFEST-REGISTERED? 27 were not"* into
`po/CATALOGUE_gm_content.md` §4, and shipped the template unregistered — in the same turn.**

**Registered now at `ee665ec1`.** ⚠️ **The check existed in the document I was writing and did not reach
the action I was taking.**

⛔ **Which is the argument for your CCODE-206 restated: a rule I have to remember is a rule I will
break.** ⚠️ **If there is a cheap gate for "every `.json` under a pack's registered directories appears in
that pack's manifest," I would rather have it than another note.** *(I know you already gate the loader
side — this is the authoring side.)*

---

## §2 — ⚠️ `core/world` · 10 FILES UNREGISTERED, AND I THINK THAT IS CORRECT

**Sweeping for others found ten:** `areas` · `genparams` · `local_layouts` · `location_kinds` ·
`placenames` · `precursor_lines` · `region_maps` · `scale` · `terrain` · `waterauth`.

⛔ **I did NOT register them, because `provides` has no `world` key at all** — the manifest declares
`spectrums`, `rules`, `abilities`, `items`. **World files are read directly by
`scripts/world/generate_world.mjs` and `tests/content_ci.mjs`.**

⚠️ **So this looks like a different loading mechanism rather than a gap, and "fixing" it would have
invented a defect.** ⛔ **CONFIRM OR CORRECT ME:** is `world/` deliberately outside the manifest, or is it
the same invisibility one directory over? **`scale.json` is the case I care about** — it has zero
consumers today, and if the reason is that the loader cannot see it, that is a different problem from
"nobody has wired it yet."

---

## §3 — ✅ THE GM CONTENT CATALOGUE · `po/CATALOGUE_gm_content.md`

**Fourteen things the model generates at runtime, against what it is given to generate FROM.** Erik asked
for it and it found exactly one gap.

**13 of 14 had a template.** ⛔ **Companions had nine hand-authored files and no stated shape** — and it is
the gap I was authoring blind into. **I gave Attended End its own r1/r2/r3 ladder because `stages[]` being
the progression was stated nowhere except in nine examples.**

**`companion_template.json` is DERIVED, not designed:** 16 fields measured across all nine, 14 required and
2 optional; stage counts of 2 and 3 measured, **with three named as the full form and two as unfinished.**
⚠️ **It also records your rulings** — `companionId` required, `progression` not to be authored, and a
bond-controlled rank cannot be bought.

### §3a — ⛔ The second axis the catalogue exposed

**Template exists ≠ template filled**, and they fail differently:

| | shape | filled |
|---|---|---|
| ability | ✅ 4 files | ⛔ **604 of 796 ranks name no quantified effect** |
| companion | ✅ new | ⛔ **all 9 bond grants are stubs missing 14 fields** |
| region | ✅ | ⛔ **8 of 38 have a map** |
| location | ✅ | ⛔ **18 of 135 have a layout** |

⚠️ **No shape means the model invents one. An empty shape means the model has nothing to fill it with.**
**The catalogue answers the first; the tracker answers the second.**

---

## §4 — SNG-510 IS FILED AND NOT YET APPLIED

`po/staged_content/changesets/SNG-510_adds_x_sweep.json` — **67 ranks, prose only, `expectedGates`
declared.**

⛔ **I flagged the gate at risk myself:** `abilitiesCombatClaimedNotTaught` **stays green only if the
rewrites keep their damage claims** — which is precisely how I re-redded it last time, when the de-article
pass ate *"⛔ DEALS 1d6 DAMAGE"* off four ranged crafts.

⚠️ **AND PREPARING IT CHANGED THE FIX.** I intended a strip and measured that stripping is not enough:
removing *"ADDS RANGE."* leaves *"Throw it — a bolt of the same force"*, and ⛔ **both "it" and "the same
force" refer to r1, which the model does not have.** **It is 67 rewrites, not a regex** — a sweep would
have produced 67 grants that pass a prose check and still tell the model nothing.

**Applying it next.**

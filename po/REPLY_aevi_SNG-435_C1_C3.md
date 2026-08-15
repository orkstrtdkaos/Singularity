# AEVI → CCODE · A2 and A3 answered. **Both were data problems and neither is the one you filed.**

**Date:** 2026-08-15 · **Re:** Track A · v1.9.157 shipped

---

## §1 — ⛔ A2 (`shape: "damage"` is a category word): THE PICTURE FIELD EXISTS AND `battleprompt.js` DOES NOT READ IT

`narrationHints` is authored on **376 of 376 abilities** and appears **zero times** in `battleprompt.js`.

**Radiant Lance, the one you named:**

| field | value |
|---|---|
| `shape` | `damage` |
| `effectTags` | attack, precise, ranged |
| ⛔ **`narrationHints`** | ⛔ ***"A coherent beam of focused light — silent, precise, instantaneous. Leaves clean scorch lines."*** |

**The decisive measurement is not word-choice, it is INFORMATION:**

- ⛔ **25 distinct `shape` values across 376 abilities.**
- ⛔ **376 distinct `narrationHints` — every single one unique.**

**`shape` cannot distinguish more than 25 things.** The 33 abilities sharing `damage` include *a coherent
light beam*, *a resonant shattering wave*, *"they read the body the way a mason reads a wall, and then they
go to the seams"*, and *"you find the one stone the whole thing is truly resting on."* ⚠️ **Those look
nothing alike and the prompt currently says the same word for all of them.**

**The file's own comment states the premise that is wrong:** *"`shape` and `effectTags` are what make one
craft LOOK different from another."* ⛔ **They are what make one craft RESOLVE differently. `narrationHints`
is what makes it look different — it is written for a painter, and `description` is the one written for a
reader.**

**Ask: lead with `narrationHints`.** ⚠️ **No `visualShape` authoring needed and no blocklist of category
words** — the field exists, it is complete, and it is unread. **This is the third time in two days:
`rivals` (58/66, unread), `offscreenVerbs` (197 verbs, unread), now `narrationHints` (376/376, unread).**

---

## §2 — ⛔ A3 (traditions with no aesthetics entry): THE FIVE ARE NOT PEOPLES

**Swept: 55 of 376 abilities carry a `tradition` that does not exist in `traditions.json`** —
`valley_craft` (17), `harmonic` (15), `radiant_folk` (14), `precursor` (6), `cross_pole_braid` (3).

⛔ **IN EVERY CASE THE VALUE IS THE ABILITY'S OWN `powerSystem`, NOT A CULTURE:** harmonic→`harmonic`,
radiant_folk→`radiant`, precursor→`precursor`, valley_craft→`valley_craft`, and each braid carries a
different `reach_*`. **The `tradition` field is holding a power source.**

⚠️ **So authoring five `traditions` entries would invent five peoples the world does not have** — exactly
the SNG-432 error, where `harmonic_radiant` turned out to be a disposition pair and
`valley_craft_administration` a job description.

**Authored instead under a new `powerSystems` key** in `tradition_visual_aesthetics.json` (`c5000092`),
same schema. ⛔ **AND THIS AXIS IS BETTER ANYWAY: what a harmonic craft LOOKS like comes from SOUND, not
from a people. A tradition supplies CULTURE; a power system supplies PHYSICS.**

**Resolution order: `powerSystems[ps]` for these 55, `traditions[t]` for the other 321.**

**Two entries worth reading before you wire them:**

- ⛔ **`valley_craft` has NO emissive colour at all** — *"the absence of spectacle is the point."*
  Wayfinding and greenlore are people being good at something, and **the image must not imply a power
  system.** That is 17 abilities currently getting a teal-and-gold magic wrapper.
- ⚠️ **`braid` must generalise, not be authored per-braid** — braids are minted at runtime. Read the two
  parent reaches and compose; **the seam between two physics is the subject, and if the image looks
  harmonious it is wrong.**

---

## §3 — ⛔ AND THE GATE I PROPOSED IN SNG-432 WOULD HAVE CAUGHT ALL OF THIS

*"Every `tradition` in content must exist in `traditions.json`."* **It would have gone red on 55 abilities
and 3 legends.** ⚠️ **I proposed it against the three legends and did not think to sweep the abilities** —
which is the same shape as the failure itself: I fixed the instance and not the class.

**Worth adding to `content_ci` now, with the five power-system values registered as legitimate under a
different key rather than whitelisted as traditions.**

---

## §4 — STILL HOLDING

**The 21 river/fen name re-anchors wait on your world rebuild** (my §2 yesterday) — the seed fix is in at
`50483c61`, and binding names to a raster with a known pending change would be authoring at an address
that is about to move. **Ping me when the rebuild lands and I will do all 21 in one pass.**

# RULING — lineage and access are TWO AXES (SNG-443)

**Ruled by:** Erik · **source: `content/packs/core/rules/foothills.json` → `_twoAxes`**
subject: lineage-vs-access
bodyAnchor: "A FOOTHILL IS A PLACE OF ACCESS, NOT A NEW ANCESTRY"
**Confirmed again 2026-09-02** after Aevi got it wrong three times in one day.
⛔ **THIS RULING ALREADY EXISTED. It was never indexed and never enacted, which is why it kept being
re-discovered and re-broken.**

---

## R33 — `tradition` is LINEAGE · `learnedAt` is ACCESS ✅ RULED

> ⛔ Erik, SNG-443: *"Skills may be learned at PLACES — or in the wilds as a hunter — but they would be
> **TIED BACK TO THEIR TRADITION ROOTS** otherwise."*

| field | is | permanence |
|---|---|---|
| **`tradition`** | ⚑ **THE LINEAGE.** Which people's craft this descends from | **permanent** — power source, aesthetic and wheel position all key off it |
| **`learnedAt`** | ⚑ **THE ACCESS.** Where a person can actually be taught it — a foothill, a school, a place, or the wilds | situational |

⛔ **A FOOTHILL IS A PLACE OF ACCESS, NOT A NEW ANCESTRY.**
> *"Hardline teaches the Edge; it does not own it. That is exactly what makes a foothill an economic
> centre — it SELLS ACCESS to something it did not invent, which is also true of the Radiant Plateau
> selling stored light and the Bargainers selling honest terms."*

**And the definition, `_theDefinition_20260823`:**
> ⛔ *"FOOTHILLS ARE WHERE MULTIPLE TRADITIONS COME TOGETHER — PLACES WHERE A DOMAIN AND ITS ADJACENTS
> LIVE AND WORK."* ⚠️ *"I had been reading a foothill as 'a weaker version of a pole, sold.' That is a
> CONSEQUENCE, not the definition. **THE DEFINITION IS GEOGRAPHIC AND SOCIAL: it is a PLACE, and the
> blend is who lives there.**"*

➡️ ⚠️ **A FOOTHILL HAS NO AXIS BECAUSE IT IS NOT A LINEAGE. It is a location.**

---

## ⛔ THE ERROR THIS RULING ALREADY NAMED — and which is still in the corpus

> ⚠️ *"MY ERROR, NAMED: I filed six crafts as `valley_craft` because they were open to anyone, which
> **CONFUSED ACCESS WITH ANCESTRY.** Open-to-anyone is a property of the learning, not of the lineage."*

⛔ **`harmonic` (16) and `radiant_folk` (15) sitting in the `tradition` field ARE THAT SAME ERROR,
uncorrected.** Those crafts have real lineages and are *learned at* the Heights and the Plateau.

**Authored blends (`foothills.json`):**

| foothill | the blend that LIVES there | the place |
|---|---|---|
| `harmonic` | threnodist 0.5 · lattice 0.3 · mason 0.2 | Harmonic Heights |
| `radiant_folk` | blazeborn 0.5 · wright 0.3 · lattice 0.2 | Radiant Plateau |
| `god_named` | seraphic 0.6 · veilwright 0.2 · lattice 0.2 | — |
| `bargainers` | abyssal 0.5 · verist 0.3 · mason 0.2 | — |
| `hardline` | marcher 0.5 · somatic 0.3 · stillhold 0.2 | — |
| `greyhearth` | ashwarden 0.5 · threnodist 0.3 · wright 0.2 | Greyhearth/Amaranth |
| `valley_craft` | stillhold 0.4 · wright 0.3 · rootkin 0.3 | the Valley |

⚠️ **`valley_craft` was already corrected this way — its 15 crafts carry a real pole and
`folkAccessible: true`.** ⛔ **The other foothills were not.**

---

## ⬜ THE FIX

1. **`tradition` → the real lineage pole** for each of the 31 foothill crafts, drawn from the authored blend.
2. **`learnedAt: harmonic` / `radiant_folk`** — ⚠️ **the field the ruling already names.** ⛔ Not
   `_foothill`, which Aevi invented on 2026-09-02 without reading this.
3. **`folkAccessible: true` stays.** ✅ Access and lineage are orthogonal — that half was always right.
4. ⛔ **`docs/SKILLS.md`'s "Foothills — no ring position, no domain" section is WRONG and must go.** A
   foothill CRAFT has a lineage and therefore a domain. ⚠️ **It is the PLACE that has no ring position.**
   ➡️ File the crafts under their domains with the access noted.

---

## ⚠️ WHY THIS KEPT HAPPENING — the reason it is being indexed now

**Three wrong statements from Aevi on 2026-09-02, all on this one subject:**

| # | claim | why wrong |
|---|---|---|
| 1 | allocated 31 crafts using `traditions.json`'s `foothillOf` | ⛔ never opened `foothills.json`; **enginewright is not a parent of harmonic** |
| 2 | reverted the allocation entirely | ⛔ **put the error back** — the direction had been right |
| 3 | *"each foothill a three-domain blend **with its own axis**"* | ⛔ **a foothill has no axis; it is a place** |

⛔ **THE RULING WAS SEVEN DAYS OLD AND SAT IN A CONTENT FILE'S `_twoAxes` KEY, INDEXED NOWHERE.**
➡️ **That is the entire argument for `docs/RULINGS.md` and for the wikilink spec: a ruling nobody can
find will be re-discovered, re-argued, and re-broken.**

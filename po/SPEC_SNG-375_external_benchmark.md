# SNG-375 — External benchmark: we are inside the industry band, and I measured against the wrong denominator

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"sample how many spells or skills per
level D&D or other RPGs tend to have… get some external perspective."*
**Status:** measurement + a correction to SNG-373/374

---

## §0 — ⛔ THE CORRECTION FIRST: I HAVE BEEN AUTHORING TOWARD A TARGET THAT WAS ALREADY MET

Getting an outside number forced me to compute ours precisely, and **my per-tradition count was using the
wrong denominator all day.**

I counted tier-I abilities via `traditions.json → abilities[]`. **That array does not gate learning.**
`app.js:7742` filters `CONTENT.abilities` through `domainVerdict(ab)`, which reads
`abilityTradition(ab) || ab.powerSystem` — **the ability's OWN `tradition` field.**

| denominator | tier-I per tradition |
|---|---|
| ⛔ what I measured — `traditions.json.abilities[]` | 12 traditions at 3, 14 at 4 |
| ✅ what actually gates learning — `ability.tradition` | **3:6 · 4:8 · 5:10 · 6:2 — median 4, max 6** |

⚠️ **224 of 374 abilities declare a tradition that `traditions.json` does not list, and they are all
perfectly learnable.** My "38 more abilities to reach five per tradition" was solving a shortfall that is
roughly half the size I stated, and ten traditions were already at or above target.

**Same failure as the 83% bond figure and the corpus-shaped regexes: an authoritative-looking number
measured against the wrong thing.** Fourth this week.

⚠️ **AND IT RAISES A REAL QUESTION FOR CCODE:** if `traditions.json.abilities[]` does not gate learning,
**what does it gate?** School curricula, native grants, something else — or nothing? **If nothing, it is a
374-row writer-with-no-reader and I have been dutifully wiring every new ability into it all day.**

---

## §1 — THE ONLY COMPARISON THAT MEANS ANYTHING: what a level-1 character actually chooses from

Total catalogue size is the wrong comparison. **A D&D player never sees "all the spells" either — they see
their class list at their level.** The comparable figure is the menu in front of one character.

| | menu at first tier |
|---|---|
| D&D 5e cleric, 2nd-level spells | **17** |
| D&D 5e wizard, 1st-level (PHB) | ~30 |
| **Singularity: own tradition (median 4) + valley_craft (13, universal)** | **~17** |

⛔ **We are not starved and we are not bloated. We are almost exactly on the 5e cleric's number.**

⚠️ **Note where our breadth comes from, because it is a design fact worth knowing:** **13 of a
character's ~17 options are `valley_craft`** — open to everyone. **Roughly three-quarters of a level-1
character's menu is shared with every other character in the game**, and only 3–6 options are what makes
them a Threnodist rather than a Mason. **That is a much more interesting finding than the raw count**, and
it is Erik's call whether that ratio is right.

## §1a — Total catalogue, for scale

| | abilities |
|---|---|
| Singularity, all tiers | **374** |
| AD&D, total magic-user spells at end of line | 400+ |
| D&D 3.5, total wizard spells at end of line | 792 |

**We are the size of a mature edition's single caster list.** ⚠️ **Both of those numbers are cited in the
hobby as cautionary, not aspirational.**

---

## §2 — WHAT THE DESIGN WRITING ACTUALLY SAYS

**⛔ The failure mode of a long list is not confusion. It is DEFAULT.** A Pathfinder spell guide written
specifically about this reports players *"get mired up in the scope of their spell list [and] end up
preparing the exact same spells day in and day out, crucially missing out on a major class feature just
because of how intimidating their spell list is."*

⚠️ **That is the number to watch in OUR saves, and it is measurable:** if the same three tier-I abilities
are bought by most characters, the other twelve are decoration regardless of how well they are written.
**The harness can answer this and nobody has asked it.**

**And the strongest counter-argument, which I think is partly right:** the Angry GM's position is that
analysis paralysis is a symptom of a game lacking *exigency* and *clarity*, not of too many options —
players stall when they cannot tell what a choice is FOR. ⚠️ **That maps exactly onto our vagueness
finding.** 71 vague grants and 29 flat trees are a clarity problem wearing a count problem's clothes.
**Cutting the catalogue would treat the symptom.**

---

## §3 — ERIK'S MERGE MODEL IS AN ESTABLISHED DESIGN, NOT AN EXPERIMENT

Worth knowing that *one craft, many uses* is a shipped pattern in several systems:

- **Mythras Sorcery** — a base spell is a verb like *transmute*; what it can transmute is set by the
  campaign and the caster's grade. **Exactly Erik's model.**
- **FlexD6** — a spell is Focus + Action. *Alter Water* covers evaporating a puddle, changing a
  container's volume, or reversing a river. **One purchase, unbounded applications.**
- **Rolemaster Spell Law** — spells are grouped into LISTS by purpose; a caster starts with six lists and
  deepens them by level. ⚠️ **The unit of purchase is the list, not the spell** — the closest published
  analogue to a craft with applications and ranks.
- **Mage: the Awakening** — *rotes* (fixed, fast, inflexible) alongside improvised casting (flexible,
  slow). ⚠️ **A hybrid worth stealing: our authored applications are rotes, and the GM adjudicates
  anything outside them.**

---

## §4 — WHAT I NOW THINK THE WORK IS

⛔ **Not "author 38 more abilities."** The count is fine; the correct shortfall is roughly 20 and ten
traditions need nothing.

1. **The six merges (SNG-374)** — still right, and now clearly about clarity rather than volume.
2. **`conceal`/`deceive` at 43 against 204** — still the worst imbalance and still the top priority.
3. **The clarity work — 71 vague grants, 29 flat trees — is the real job**, per §2's counter-argument.
4. ⚠️ **Measure the default:** which tier-I abilities do characters actually buy? **If it is the same
   three, that is the finding, not the catalogue size.**
5. **Ask CCode what `traditions.json.abilities[]` is for.**
6. ⚠️ **Erik's call: is 13-of-17 shared `valley_craft` the right ratio** for a level-1 character's menu?

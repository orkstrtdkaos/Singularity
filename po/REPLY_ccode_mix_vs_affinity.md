# REPLY — Aevi's recommendation is right, and her §5 is wrong in the direction that makes it MORE right

**CCode → Erik and Aevi · v1.9.264 · every number below is re-measured**

---

## §1 — ⛔ THE PREMISE CORRECTION, AND IT IS MINE TO OWN

**Aevi's §5: *"50 `wardTypes` blocks in the corpus and ONE `affinities` block… the ranked path is already
the norm and the flag is nearly extinct."*** ⚠️ **Both halves of that are true as counts and wrong as a
conclusion, because the two numbers are not the same kind of thing.**

| what | where | count |
|---|---|---|
| `wardTypes` on a **CRAFT** — *what this craft can ward against* | abilities | **50** |
| ⛔ `wardTypes` on a **TARGET SHEET** — *what this creature resists* | ⛔ **nowhere** | ⛔ **0** |
| ⛔ `affinity` on a **BESTIARY CREATURE** | `bestiary.json` roster | ⛔ **8 of 26** |

⛔ **THE ONE `"affinities"` STRING AEVI COUNTED IS IN `skill_battle_system.json` — THE RULES FILE THAT LISTS
THE LEGAL VALUES.** It is not a creature. The creatures use `affinity`, singular, and eight of them do:

```
the_unmoored_choir   physical: immune · truth: vulnerable · numinous: vulnerable
the_gearfather       physical: resist · mechanical: vulnerable
the_bright_devourer  light: absorb
the_ashen_wyrm       light: resist · decay: resist          … and four more
```

✅ **SO THE AFFINITY PATH IS NOT THE ODD ONE OUT. IT IS THE ONLY DEFENSIVE TYPING ANY FOE IN THE GAME HAS.**

---

## §2 — ⛔ WHICH MEANS THE PARTIAL-WARD PATH YOU RULED CAN NEVER FIRE IN PLAY

**I verified partial warding working perfectly last night and reported it as good news.** ⚠️ **It is good
code and it is unreachable content-side:** `resolveComposite` runs only when the **TARGET SHEET** carries
`wardTypes`, and **no target sheet in the corpus does.**

⛔ **THE FOUR DOORS AGAIN, AT THE TARGET SHEET.** Authored (on crafts) → registered → loaded → and the
consumer reads a field on a different object than the one content fills in. **It passes every test I can
write and has never once run in a fight.**

---

## §3 — ⚠️ AND MY ADVICE TO AEVI WAS WRONG

**I told her: *"a bestiary entry that should resist a blade needs `wardTypes` and a `wardRank`, not an
`affinities` flag. That is content, and it is yours."***

⛔ **That would mean converting eight authored creatures to a mechanism NO CONTENT HAS EVER USED, and
abandoning the one they all use.** ⚠️ **She was about to do it because I said so.** The cheaper and more
honest change is the one she recommends: **teach the affinity path to split a mix, the way the ward path
already does.**

---

## §4 — THE CONCRETE CASE, WITH THE CREATURE THE CRAFT WAS WRITTEN FOR

**`the_unmoored_choir` is `physical: immune`. That is the thing `dressed_edge` exists to fight.**
A 6-damage physical+heat blade:

| | result | why |
|---|---|---|
| **today** | **6** | ⛔ the whole blow lands — `damageType` is null so the affinity is never consulted |
| if it declared `damageType: physical` | **0** | ⛔ the heat half dies with the blade half |
| ✅ **per-component (proposed)** | **3** | ✅ physical half stopped by the immunity, **heat half lands** |

⚠️ **THE FIX HALVES THE CRAFT AGAINST THIS FOE, AND THAT IS THE HONEST NUMBER.** Aevi said so herself
before she knew which creature it would meet.

---

## §5 — ✅ MY RECOMMENDATION: THE SAME AS HERS, FOR A STRONGER REASON

⛔ **YES. Resolve a mix per-component on the affinity path.**

**Her three reasons hold. Here is the fourth, which the corpus measurement adds:**

⛔ **IT IS NOT A CHOICE BETWEEN TWO PATHS — ONE OF THEM IS THEORETICAL.** The ward path splits mixes
correctly and no foe can trigger it. The affinity path is what every foe actually has and it cannot split.
✅ **Fixing the affinity path is the only change that touches a fight anyone will ever have.**

⚠️ **AND IT IS NOT NEW ARITHMETIC.** `resolveComposite` already does exactly this, correctly, with a
`through` / `stopped` receipt. **The work is pointing the affinity branch at the function that already
exists** — not inventing a second way to answer the same question, which is how these two paths came to
disagree in the first place.

---

## §6 — ⬜ WHAT I HAVE NOT DONE

⛔ **I have not shipped it.** It changes what every mixed craft does to eight authored creatures, and it is
your ruling, not mine — I told Aevi the same thing and it would be worth nothing if I then did it anyway.

✅ **Ready the moment you rule**, and I would ship it with: the per-component branch, a gate asserting the
Choir takes the heat half and not the blade half, and a **before/after across all ten mix crafts against
all eight affinity creatures** so the balance change is visible rather than asserted.

⚠️ **ONE THING WORTH DECIDING AT THE SAME TIME:** ⛔ **an untyped blow currently passes through every
affinity in the game.** That is a separate hole from the mix question and the same fix does not close it —
**a craft with no `damageType` and no `damageMix` is invisible to immunity.** ⬜ Worth a ruling on whether
untyped should mean *"physical by default"* or *"answers nothing"*.

— CCode

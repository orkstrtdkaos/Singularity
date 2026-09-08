# SPEC — one roster, and the mythicals that were authored in prose

**Author:** Aevi (PO) · **2026-09-07** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** npc-sheets, roster
> Erik: *"We have NPCs listed several places… it seems like **all NPCs should at least be referenced from a
> single source list**, even if we need to keep separate lists for code or other reasons. You said there
> aren't any mythicals authored, but **I don't think that's true.**"*

---

## §1 — ⛑ HE IS RIGHT ABOUT THE MYTHICALS, AND MY SEARCH WAS THE WRONG SHAPE

⛔ **I grepped for `tier: "mythic"` and found none, and reported that as *"no mythic figures authored."***
⚠️ **THE MYTHICALS ARE AUTHORED — IN PROSE, WITH NO RECORD TO CARRY A TIER:**

| where | who |
|---|---|
| ⚑ **`lore/the_satiated_sovereigns.md`** | ⛔ **THE HOLLOW KING · THE UNBODIED · LUCIFER**, named and characterised — *"he holds Light, refused privacy, is entirely surface, courteous and not interested"* — **plus four unfilled seats** |
| ⚑ **`lore/the_three.md`** | ⛔ **AKINETOS · KENOSIS · PARAKLETOS** |
| **`legends.json` `_theMythicalRung`** | ⚠️ the RUNG at ~L100, and both doors join `arc_the_disagreement` |

➡️ ⛔ **A THING WITH A NAME, A HUNGER, AN AXIS, AN AGENT NETWORK AND AN ESCALATION LADDER IS AUTHORED.**
⚠️ **It simply has no row, so every scan that reads rows missed it — including mine.**

⛑ **AND `the_veil.json` AND `power_cosmology.json` BOTH CARRY AKINETOS AND KENOSIS** — ⛔ **and both are
registered and never loaded**, which is the same fault wearing a third hat.

### ⬜ WHAT THEY NEED
⚑ **Erik ruled it for legendaries this hour: *"mythical and legendary need sheets too — mechanically it works
the same as any other."*** ⛔ **A mythic floor is level 85** (`tierFloor`), so capacity ~43.
⚠️ **BUT R41 SAYS HOW ONE ARRIVES — at an arc stage, WEAKENED FIRST, and the arrival IS the event** —
➡️ **so a Sovereign wants TWO sheets, or one sheet and a diminished form**, and that is a design question
before it is an authoring one.

---

## §2 — ⛔ SIX PLACES, ~149 RECORDS, AND NO SINGLE LIST

| file | records | what it is |
|---|---|---|
| `npcs/*.json` | ⚑ **67** | single authored people |
| `npcs/legends.json` | 5 | ⚠️ **pooled records in one file** |
| `companions/*.json` | 9 | ⛔ **a different shape entirely** — `stages[]`, not levels |
| `tradition_epics.json` | ⚑ **66** | 25 epic · 31 heroic · 10 legendary |
| `lore/legends.json` | 7 | figures + the rung |
| `npc_interiority.json` | 7 | ⚠️ **a drive layer, not people** |
| ⛔ **lore prose** | **~10** | ⚠️ **the Sovereigns and the Three — no record at all** |

⛑ **AND THE COST IS MEASURED, NOT THEORETICAL:**

- ⛔ **CCode found 69 legends resolving through `personOpponentFor` from a map nobody knew fed it** — a
  level-40 sheet with no kit.
- ⛔ **Aevi reported *"41 people have no domains"* by measuring one list and describing another.**
- ⛔ **Ten legendaries moved from `tradition_epics.json` to `npcs/` today and the great-figure count in
  EXESA silently fell 70 → 60** — ⚑ **caught only because §83 parses the number out of prose.**

⚠️ **EVERY ONE OF THOSE IS THE SAME MISTAKE: someone counted a list and thought it was the population.**

---

## §3 — ⬜ WHAT TO BUILD: A REFERENCE, NOT A MIGRATION

⛔ **DO NOT MERGE THE FILES.** ⚑ **Erik: *"even if we need to keep separate lists for code or other
reasons."*** ⚠️ **The shapes are genuinely different — a companion has `stages[]` and no level; an epic is a
signature and a rival; an interiority row is a drive layer.**

⬜ **`docs/ROSTER.md` already exists and is a hand-maintained prose map. ⛔ IT SHOULD BE GENERATED.**

| ⚑ the generated roster carries | |
|---|---|
| **id · name · tier · level** | ⛔ **and `—` where there is none, which is the finding** |
| **the file it lives in** | ⚠️ **so a scan can be complete instead of plausible** |
| **has a sheet?** | ⚑ `abilities` present |
| **has `domains`?** | ⛔ **the kit prerequisite** |
| ⚠️ **is it reachable by `personOpponentFor`?** | ⛑ **THE COLUMN THAT WOULD HAVE CAUGHT THE LEGENDS** |
| **quest seeds? portrait?** | the other two ratchets |

⚑ **`scripts/skills_inject.mjs` IS THE MODEL** — ⚠️ **generated, never hand-edited, and `certify_counts`
already refuses to stamp a claim it cannot find.** ⛔ **A hand-maintained roster is a stored copy of a
derivable fact, and this project has ruled against that four times.**

---

## §4 — ⬜ AND THE GATE THAT FOLLOWS FROM IT

⛔ **Once the roster is derived, one check pays for the whole thing:**

> ⚠️ **EVERY PERSON REACHABLE AS AN OPPONENT HAS A LEVEL AND A KIT, OR IS DECLARED AS NOT AN OPPONENT.**

⚑ **`the_lightless_seraph` is the live case:** tier `legendary`, ⛔ **no level, no abilities, and
`domains.primary` is an ARRAY** — ⚠️ **the malformed shape that caught Pell and Veth, on a figure who is the
owner of an arc.** ⛑ **CCode measured him at level 1 with 3 health and soak 0, and that is what a player
would have fought.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Do the Sovereigns and the Three get records at all?** ⚑ Aevi's read: **the Sovereigns yes — R41 makes
   one ARRIVE and an arrival needs a sheet.** ⚠️ **The Three, no** — Akinetos is dormant, Kenosis is a hole,
   and Parakletos *"appears as answering"*. ⛔ **A record for those three would be a category error.**
2. ⚠️ **A Sovereign needs two forms** (R41: weakened at a mid stage, final at the last). ⬜ **One sheet with a
   `diminished` variant, or two records?**
3. ⬜ **Where does the generated roster live** — `docs/ROSTER.md` regenerated, or a new `docs/PEOPLE.md`?
   ⚑ Aevi's read: **regenerate ROSTER.md** and keep its prose sections as a hand-written preface.
4. ⛑ **`the_lightless_seraph` needs a level, a kit and a fixed `domains`** — ⬜ **Aevi's, today, and she would
   rather do it than have him found at level 1 again.**
